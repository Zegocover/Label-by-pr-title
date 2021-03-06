import { Toolkit } from 'actions-toolkit';
import * as yaml from "js-yaml";
import {DefineLabelMatches} from "./labels";
import {LabelAndCriteria} from "./labels";

Toolkit.run( async tools => {
	//#region Main code
	const configPath              = tools.inputs.config;
	const PRLabelCheck            = !!tools.inputs.pr_label_check;
	const pr_No :number|undefined = tools.context.payload.pull_request?.number;
	const useDefaultLabels        = configPath === "N/A";
	var   actionStartTime         = Math.floor(Date.now()/1000);
	if (!configPath) {
		tools.exit.failure(`Config parameter is undefined`);
		return;
	}
	if (!pr_No) {
		tools.exit.failure(`Did not provide pr number`);
		return;
	}

	tools.log.note("PR number is: " + pr_No);
	const labels               = await GetLabels(configPath, useDefaultLabels);
	const outputLabels         = LabelsToOutput(labels);
	tools.log.note(`Config labels: ${outputLabels}`);

	const pr_Data		   = (await GetPRData(pr_No));
	const pr_Title             = pr_Data.title;
	const pr_Labels		   = pr_Data.labels;
	const labelsToAdd          = MatchLabelsWithTitle(pr_Title, labels);
	tools.outputs.Labels 	   = outputLabels;

	if (labelsToAdd.length > 0) {
		//Is the label on the pull request already?
		const addLabelToPR = await LabelExistOnPullRequest(pr_No, labelsToAdd, pr_Labels);

		if (addLabelToPR.length > 0) {
			await AddLabel(pr_No, addLabelToPR);
		}
		else {
			//Label already exists on PR
			tools.log("No new labels added to PR");
		}
	}
	else {
		// no label criteria matched with PR Title
		tools.log("No labels to add to PR");
	}

	if (PRLabelCheck) {
		tools.log("Checking PR to ensure only one config label has been added")
		await ValidatePRLabel(pr_No, labelsToAdd, outputLabels, actionStartTime)
	}
	tools.exit.success("Action complete");

	//#endregion

	//#region Github calls

	/* Find the last event and return its data
	*/
	async function GetLastEvent(pr_No :number, timestamp :number)
	{
		var pageNo = 0;
		var link;
		var events;

		do {
			pageNo++;
			events = await tools.github.issues.listEvents({
				owner: tools.context.repo.owner,
				repo: tools.context.repo.repo,
				issue_number: pr_No,
				page:pageNo
			});
			link = events.headers.link

			if (!link){
				tools.exit.failure(`link is undefined for page ${pageNo}`);
				break;
			}
		} while (link.includes(`rel="next"`))

		let lastIndex = events.data.length -1
		let lastEvent = events.data[lastIndex]

		return lastEvent;
	}

	/* Retrieve labels added by this action from the Labelled event
	*/
	async function GetLabelsFromEvent(pr_No :number, actionStartTime :number ){
		var labels : {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		    }[] = [];
		const lastEvent = await GetLastEvent(pr_No,actionStartTime);
		const lastEventTime = Math.round(new Date(lastEvent.created_at).getTime()/1000)

		if (lastEvent.event == 'labeled' && lastEventTime >= actionStartTime) {
			tools.log("Found labeled event added by this action");
			const lastEventData = await tools.github.issues.getEvent({
				owner: tools.context.repo.owner,
				repo: tools.context.repo.repo,
				event_id: lastEvent.id
			});
			labels = lastEventData.data.issue.labels;
		} else {
			tools.exit.failure("No labeled event was created by this action");
		}

		return labels;
	}

	/*
	* Ensure PR has only one config label
	*/
	async function ValidatePRLabel(pr_No :number, labelAdded :string[], outputLabels :string, actionStartTime :number) {
		const pr_LabelsData            = (await GetPRData(pr_No)).labels;
		const configLabels : string[]  = outputLabels.split(',').map((i) => i.trim());
		var   labelMatchCount          = 0;
		var   pr_LabelNames : string[] = [];
		var labelIterator : {
			id: number;
			node_id: string;
			url: string;
			name: string;
			description: string;
			color: string;
			default: boolean;
		    }[] = [];

		if (pr_LabelsData.length > 0) {
			tools.log("Pull request has labels");
			labelIterator = pr_LabelsData;
		} else {
			tools.log("No labels retrieved on pull request. Attempt to retrieve labeled event data created by this action.")
			/* PR data when labels are manually removed such that no labels exist, this action will add the label
			* but fail to retrieve labels from GetPRData(). This is a known limitation cref:
			* https://github.community/t/previous-job-runs-should-be-overridden-by-subsequent-runs/17522
			* workaround: Find the labeled event that was created by this action and retrieve the labels from
			* event data.
			*/
			labelIterator = await GetLabelsFromEvent(pr_No, actionStartTime);
			if(labelIterator.length == 0) {
				tools.exit.failure("No labels found on labeled event");
			}
		}

		for (let label of labelIterator) {

			let name = typeof(label) ===  "string" ? label: label.name;
			if (!name) {continue;}

			pr_LabelNames.push(name);
			tools.log(`PR Label: ${name}`);

			//Match PR labels with the config labels
			if (Arr_Match(configLabels, name)) {
				labelMatchCount++;
			}
		}

		if (labelMatchCount != 1) {
			tools.exit.failure(`Exactly one config label expected.
			\n Expected: ${labelAdded.join(',')}\n Actual: ${pr_LabelNames.join(',')}`);
			return;
		}
	}

	/* Remove labels from labelsToAdd if they exist on pull request
	*  Return: labelsToAdd
	*/
	async function LabelExistOnPullRequest(pr_No :number , labelsToAdd :string[], pr_Labels : {
		id: number;
		node_id: string;
		url: string;
		name: string;
		description: string;
		color: string;
		default: boolean;
	    }[]) {

		const checkedLabels = labelsToAdd.slice();

		if (pr_Labels.length > 0) {
			tools.log("This PR has labels, checking...");

			for (let label of pr_Labels) {

				let name = typeof(label) ===  "string" ? label: label.name;
				if (!name) {continue;}

				if (Arr_Match(labelsToAdd, name)) {
					tools.log(`Label ${name} already added to PR`);
					RemoveFromArray(checkedLabels, name);
				}
			}
		}

		return checkedLabels;
	}

	/* Add labels to pull request.
	*/
	async function AddLabel(prNumber :number, labelsToAdd :string[]) {

		tools.log(`Label to add to PR: ${labelsToAdd}`)
		await tools.github.issues.addLabels({
			owner: tools.context.repo.owner,
			repo: tools.context.repo.repo,
			issue_number: prNumber,
			labels: labelsToAdd
		});
		tools.log("Labels added");
	}

	/* Get the PR Title from PR number
	* Return pull request data property
	*/
	async function GetPRData(pr_No : number) {
		tools.log("Get pull request data");
		var pullRequest;

		pullRequest = await tools.github.issues.get({
			owner: tools.context.repo.owner,
			repo: tools.context.repo.repo,
			issue_number: pr_No,
		});

		return pullRequest.data;
	}

	/* Request content from github repo from the path
	*  containing yml config file
	*  Return the octokit response
	*/
	async function GetConfigContent(path :string) {

		var response = await tools.github.repos.getContent({
			owner: tools.context.repo.owner,
			repo: tools.context.repo.repo,
			path: path,
			ref: tools.context.sha,
		});

		return response;
	}
	//#endregion


	//#region Data manipulation

	/* Get the labels and their matching criteria from a file
	*  or function.
	*  Return Labels and matching criteria as LabelAndCriteria[]
	*/
	async function GetLabels(configPath :string, useDefaultLabels :boolean) {

		var labels :LabelAndCriteria[] = [];

		if (useDefaultLabels) {
			tools.log(`Get label defaults`);
			labels = DefineLabelMatches();
		}
		else {
			tools.log(`Get label config file: ${configPath}`);
			let configContent : any      = await GetConfigContent(configPath);
			let encodedFileContent : any = Buffer.from(configContent.data.content, configContent.data.encoding);
			let yamlFileContent          = yaml.load(encodedFileContent);
			labels	                     = GetLabelsFromFile(yamlFileContent);
		}

		return labels;
	}

	/* Match the first word in pr_Title with the label's matching
	*  criteria.
	*  Return string[] of matched labels, otherwise empty
	* Remarks - Return is currently limited to first match
	*/
	function MatchLabelsWithTitle(pr_Title :string, labels :LabelAndCriteria[]) {

		var matchedLabels : string[] = [];

		tools.log(`Matching label criteria with PR title: ${pr_Title}`);
		for (let labelData of labels)
		{
			for (let criterion of labelData.criteria){
				if (Str_Match(pr_Title,criterion)) {
					tools.log(`Matched... Add Label: [${labelData.name}] to pull request`);
					matchedLabels.push(labelData.name);
					return matchedLabels;
				}
			}
		}

		//only reach here if no label is matched
		return matchedLabels;
	}

	/* Remove strMatch from arr if it exists
	*/
	function RemoveFromArray(arr :string[], strMatch :String) {

		var lowercaseArr = arr.map(function(value){
			return value.toLowerCase();
		});

		const index = lowercaseArr.indexOf(strMatch.toLowerCase());

		if (index > -1) {
			arr.splice(index, 1);
		}
	}

	/* Given string strBase does it (default) start with || matches strMatch
	*  returns: True|False
	*/
	function Str_Match(strBase :string, strMatch :string, exactMatch : boolean = false) {

		if ((!exactMatch && strBase.toLowerCase().startsWith(strMatch.toLowerCase())) || 
			(exactMatch && strBase.toLowerCase() === strMatch.toLowerCase()) ) {
			return true;
		}
		else { return false; }
	}

	/* Given array arrBase for each item, does it starts with || matches (default) strMatch
	*  returns: True|False
	*/
	function Arr_Match(arrBase :string[], strMatch :string, exactMatch :boolean = true) {

		for (let item of arrBase) {
			if (Str_Match(item,strMatch, exactMatch)) {
				return true;
			}
		}
		return false;
	}

	/* Define the labels to output
	*  Return string of labels
	*/
	function LabelsToOutput(labelAndMatchCriteria :LabelAndCriteria []) {

		const outputLabels = [];

		for (const labelData of labelAndMatchCriteria) {
			outputLabels.push(labelData.name);
		}
		return outputLabels.join(',');
	}

	/* Get labels and their matching criteria
	*  from yamlFileContent: [object Object]
	*  return the array of labels and their matching criteria
	*  E.g. Array of [[label1,'matchA','matchB'],['label2','matchC'],...]
	*  Return Labels and matching criteria as LabelAndCriteria[]
	*/
	function GetLabelsFromFile(yamlFileContent:any) {

		var labels : LabelAndCriteria[] = [];

		for (const tag in yamlFileContent) {
			if (typeof yamlFileContent[tag] === "string") {
				labels.push({name:tag, criteria:yamlFileContent[tag]});
			} else if (Array.isArray([yamlFileContent[tag]])) {
				let labelCriteria :any[] = yamlFileContent[tag].toString().split(',');
				labels.push({name: tag, criteria: labelCriteria})
			} else {
				tools.log(`Unknown value type for label ${tag}. Expecting string or array)`);
			}
		}
		return labels;
	}
	//#endregion
});

