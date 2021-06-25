import * as core from '@actions/core';
import * as github from '@actions/github';
import * as yaml from "js-yaml";
import {DefineLabelMatches} from "./labels";
import {LabelAndCriteria} from "./labels";

let UseDefaultLabels = false;
type  OctokitType     = ReturnType<typeof github.getOctokit>;

async function run() {
  try {
    	const GITHUB_TOKEN             = core.getInput('GITHUB_TOKEN');
    	const configPath               = core.getInput('config');
    	const octokit                  = github.getOctokit(GITHUB_TOKEN);
    	const pr_No :number|undefined  = github.context.payload.pull_request?.number;

	// ensure pr_No is not undefined type
	if (!pr_No) {
		console.log("Failed to retrieve PR number from payload");
		return;
	}
	console.log("PR number is: " + pr_No);

	UseDefaultLabels = configPath === "N/A";
	console.log(`Using default: ${UseDefaultLabels}`);
	if (!UseDefaultLabels) {
		console.log(`Get label config file: ${configPath}`);
	}

	const labels       = await GetLabels(octokit, configPath);
	const pr_Title     = (await GetPRData(octokit, pr_No)).title;
	let   labelsToAdd  = MatchLabelsWithTitle(pr_Title, labels);
	const outputLabels = LabelsToOutput(labels);

	core.setOutput("Labels",outputLabels);

	if (labelsToAdd.length > 0) {
		console.log("Validate label with repo");
		const repo_Labels = await GetAllLabelsFromRepo(octokit);
		if (!AreLabelsValid(labelsToAdd, repo_Labels)){
			throw new Error( `Label does not exist on repo. Ensure the following labels are available on repo: \n\t ${outputLabels}`);
		}
		console.log(`Label ${labelsToAdd.toString()} is valid for this repo`);

		//Is the label on the pull request already?
		labelsToAdd = await LabelExistOnPullRequest(octokit, pr_No, labelsToAdd);

		if (labelsToAdd.length > 0) {
			await AddLabel(octokit, pr_No, labelsToAdd);
		}
		else {
			console.log("No new labels added to PR");
		}
	}
	else {
		console.log("No labels to add to PR");
	}

  } catch (error) {
    core.setFailed(error.message)
  }
}


/* Add labels to pull request.
*/
async function AddLabel(octokit :OctokitType, prNumber :number, labelsToAdd :string[]) {

	console.log(`Label to add to PR: ${labelsToAdd}`)

	await octokit.rest.issues.addLabels({
		owner: github.context.repo.owner,
      		repo: github.context.repo.repo,
		issue_number: prNumber,
		labels: labelsToAdd
	});
	console.log("Labels added");
}

/* Remove labels from labelsToAdd if they exist on pull request
*  Return: labelsToAdd
*/
async function LabelExistOnPullRequest(octokit : OctokitType, pr_No :number , labelsToAdd :string[]) {

	const pr_Labels  = (await GetPRData(octokit,pr_No)).labels

	if (pr_Labels.length > 0) {
		console.log("This PR has labels, checking...");

		for (let label of pr_Labels) {

			let name = typeof(label) ===  "string" ? label: label.name;
			if (!name) {continue;}

			if (Arr_Match(labelsToAdd, name)) {
				console.log(`Label ${name} already added to PR`);
				RemoveFromArray(labelsToAdd, name);
			}
		}
	}

	return labelsToAdd;
}

/* Get the labels and their matching criteria from a file
*  or function.
*  Return Labels and matching criteria as LabelAndCriteria[]
*/
async function GetLabels(octokit :OctokitType, configPath :string) {

	let labels :LabelAndCriteria[] = [];

	if (UseDefaultLabels) {
		const configContent : any      = await GetConfigContent(octokit, configPath);
		let   encodedFileContent : any = Buffer.from(configContent.data.content, configContent.data.encoding);
		const yamlFileContent          = yaml.load(encodedFileContent);
		labels                         = GetLabelsFromFile(yamlFileContent);
	}
	else {
		labels = DefineLabelMatches();
	}

	return labels;
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

	let labels : LabelAndCriteria[] = [];

	for (const tag in yamlFileContent) {
		if (typeof yamlFileContent[tag] === "string") {
			labels.push({name:tag, criteria:yamlFileContent[tag]});
		} else if (Array.isArray([yamlFileContent[tag]])) {
			let labelCriteria :any[] = yamlFileContent[tag].toString().split(',');
			labels.push({name: tag, criteria: labelCriteria})
		} else {
			console.log(`Unknown value type for label ${tag}. Expecting string or array of globs)`);
		}
	}
	return labels;
}

/* Validate labels to add to PR with
*  repository defined labels.
*  I.e. We dont want to create new labels
*  Return True|False
*/
function AreLabelsValid(labelsToAdd :string[], repo_Labels :string[]) {

	for (let lbl of labelsToAdd) {
		if (!Arr_Match(repo_Labels, lbl)) {
			return false;
		}
	}

	return true;
}

/* Request content from github repo from the path
*  containing pr_label_config.yml
*  Return the octokit response
*/
async function GetConfigContent(octokit :OctokitType, path :string) {

	let response = await octokit.rest.repos.getContent({
	  owner: github.context.repo.owner,
	  repo: github.context.repo.repo,
	  path: path,
	  ref: github.context.sha,
	});

	return response;
}

/* Get the PR Title from PR number
* Return pull request data property
*/
async function GetPRData(octokit :OctokitType, pr_No : number) {

	const pullRequest = await octokit.rest.issues.get({
		owner: github.context.repo.owner,
		repo: github.context.repo.repo,
		issue_number: pr_No,
	});
	return pullRequest.data;
}


/* Request labels data from repository
*  Return string[] of label names
*/
async function GetAllLabelsFromRepo(octokit :OctokitType) {

	const repo_Labels = [];

	const lbl_obj     = await octokit.rest.issues.listLabelsForRepo({
		owner: github.context.repo.owner,
	  	repo: github.context.repo.repo,
	});

	for (let lblObj of lbl_obj.data) {
		//Add label name to array
		repo_Labels.push(lblObj.name);
	}
	return repo_Labels;
}

/* Match the first word in pr_Title with the label's matching
*  criteria.
*  Return string[] of matched labels, otherwise empty
* Remarks - Return is currently limited to first match
*/
function MatchLabelsWithTitle(pr_Title :string, labels :LabelAndCriteria[]) {

	let matchedLabels : string[] = [];

	console.log(`Matching label criteria with PR title: ${pr_Title}`);
	for (let labelData of labels)
	{
		if (Str_Match(pr_Title,labelData.name)) {
			console.log(`Matched... Add Label: [${labelData.name}] to pull request`);
			matchedLabels.push(labelData.name);
			return matchedLabels;
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

run()
