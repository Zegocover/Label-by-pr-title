import { Toolkit } from 'actions-toolkit';
import { SSL_OP_EPHEMERAL_RSA } from 'constants';
import * as yaml from "js-yaml";
import { start } from 'repl';
import {DefineLabelMatches} from "./labels";
import {LabelAndCriteria} from "./labels";

Toolkit.run( async tools => {
	//#region Main code
	const configPath              = tools.inputs.config;
	const PRLabelCheck 	      = !!tools.inputs.pr_label_check;
	const pr_No :number|undefined = tools.context.payload.pull_request?.number;
    	const useDefaultLabels        = configPath ===  "N/A";
	var utcStartTime = Date.now();
	tools.log(`Start time is ${utcStartTime}`);
	

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

	const pr_Data		   = (await GetPRData(pr_No, false));
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
		await ListEvents(pr_No, utcStartTime);
		tools.log("Checking PR to ensure only one config label has been added")
		await ValidatePRLabel(pr_No, labelsToAdd, outputLabels)
	}
	tools.exit.success("Action complete");

	//#endregion

	//#region Github calls

	async function ListEvents(pr_No :number, startTime :number)
	{
		tools.log("Get list of events");
		var pageNo = 0;
		var link;

		do {
			pageNo++;
				tools.log(`Page number is: ${pageNo}`);
			let eventList = await tools.github.issues.listEvents({
				owner: tools.context.repo.owner,
				repo: tools.context.repo.repo,
				issue_number: pr_No,
				page:pageNo
			});
			link = eventList.headers.link
			
		console.log(`The link to the header is: ${link}`);
			if (!link){
				tools.exit.failure(`link is undefined for page ${pageNo}`);
				break;
			}
		} while (link.includes(`rel="next"`))

		const PREvents = await tools.github.issues.listEvents({
			owner: tools.context.repo.owner,
			repo: tools.context.repo.repo,
			issue_number: pr_No,
			page:pageNo
		});
		

		tools.log("Get last event");
		for(let event of PREvents.data) {
			tools.log(`The event name is: ${event.event} at ${event.created_at}`);	
			
		}
		

		let lastIndex = PREvents.data.length -1
		tools.log(`Index of last event is ${lastIndex}`);
		let lastEvent = PREvents.data[lastIndex]
		tools.log(`The event name is: ${lastEvent.event} at ${lastEvent.created_at}`);
		const lastEventTime = Math.round(new Date(lastEvent.created_at).getTime()/1000)
		tools.log(`Is start time ${startTime} greater than ${lastEventTime}`);

		if (lastEvent.event == 'labeled' && startTime > lastEventTime) {
			tools.log("Caught Last time");
			const lastEventData = await tools.github.issues.getEvent({
				owner: tools.context.repo.owner,
				repo: tools.context.repo.repo,
				event_id: lastEvent.id
			});
			const myLabels = lastEventData.data.issue.labels;
			tools.log("Do we have labels?");
			for (let label of myLabels)
			{
				let name = typeof(label) ===  "string" ? label: label.name;
				if (!name) {continue;}
				tools.log(`PR Labels from labelled event: ${name}`);	
			}
		}




	}

	/*
	* Ensure PR has only one config label
	*/
	async function ValidatePRLabel(pr_No :number, labelAdded :string[], outputLabels :string) {
		//const pr_LabelsData            = (await GetPRData(pr_No, true)).labels;
		const pr_LabelsData            = await tools.github.issues.listLabelsOnIssue({
			owner: tools.context.repo.owner,
			repo: tools.context.repo.repo,
			issue_number: pr_No,
			per_page:10,
			page:1
			});
		const configLabels : string[]  = outputLabels.split(',').map((i) => i.trim());
		var   labelMatchCount          = 0;
		var   pr_LabelNames : string[] = [];

		if (pr_Labels.length<1) {
			tools.exit.failure("PR has no labels");
			return;
		}

		for (let label of pr_LabelsData.data) {

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
			tools.exit.failure(`Only one config label expected.
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
	async function GetPRData(pr_No : number, debug : boolean) {
		tools.log("Get pull request data");
		var pullRequest;

		if (debug == false) {
		pullRequest = await tools.github.issues.get({
			owner: tools.context.repo.owner,
			repo: tools.context.repo.repo,
			issue_number: pr_No,
			ref: tools.context.sha,
		});
		} else {
			pullRequest = await tools.github.issues.listLabelsOnIssue({
			owner: tools.context.repo.owner,
			repo: tools.context.repo.repo,
			issue_number: pr_No,

			});

			pullRequest = await tools.github.issues.get({
			owner: tools.context.repo.owner,
			repo: tools.context.repo.repo,
			issue_number: pr_No,
			ref: tools.context.sha,
			});
		}

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

	/* Given string strBase does it start with strMatch
	*  returns: True|False
	*/
	function Str_Match(strBase :string, strMatch :string) {

		if (strBase.toLowerCase().startsWith(strMatch.toLowerCase())) {
			return true;
		}
		else { return false; }
	}

	/* Given array arrBase for each item, does it start with strMatch
	*  returns: True|False
	*/
	function Arr_Match(arrBase :string[], strMatch :string) {

		for (let item of arrBase) {
			if (Str_Match(item,strMatch)) {
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

