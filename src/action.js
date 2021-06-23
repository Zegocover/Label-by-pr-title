const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require("js-yaml");

const AreLabelsInFile = false;

async function run()
{
	try
	{
		const GITHUB_TOKEN     = core.getInput('GITHUB_TOKEN');
		const configPath       = core.getInput('config');
		const octokit          = github.getOctokit(GITHUB_TOKEN);
		const { context = {} } = github;
		const { pull_request } = context.payload;

		console.log("PR number is: " + github.context.payload.pull_request.number);
		console.log(`Get label config file: ${configPath}`);

		const labels       = await GetLabels(octokit, context, configPath);
		let   labelsToAdd  = MatchLabelsWithTitle(pull_request,labels);
		const outputLabels = LabelsToOutput(labels);

		core.setOutput("Labels",outputLabels);

		if (labelsToAdd.length > 0)
		{
			console.log("Validate label with repo");
			const repo_Labels = await GetAllLabelsFromRepo(octokit, context);
			ValidateLabels(labelsToAdd, repo_Labels);
			console.log(`Label ${labelsToAdd.toString()} is valid for this repo`);

			//Is the label on the pull request already?
			labelsToAdd = LabelExistOnPullRequest(pull_request, labelsToAdd);

			if (labelsToAdd.length > 0)
			{
				await AddLabel(octokit, context, pull_request.number, labelsToAdd);
			}
			else
			{
				console.log("No new labels added to PR");
			}
		}
		else
		{
			console.log("No labels to add to PR");
		}
	}
	catch(error)
	{
		core.setFailed(error.message);
	}
}

/* Add labels to pull request.
*/
async function AddLabel(octokit, context, prNumber, labelsToAdd)
{
	console.log(`Label to add to PR: ${labelsToAdd}`)
	await octokit.rest.issues.addLabels({
		...context.repo,
		issue_number: prNumber,
		labels: labelsToAdd
	});
	console.log("Labels added");
}

/* If pull request has label that is in labelsToAdd then remove
*  it from labelsToAdd
*  Return: labelsToAdd
*/
function LabelExistOnPullRequest(pull_request, labelsToAdd) {
	let pr_Labels = pull_request.labels;

	if (pr_Labels.length > 0) {
		console.log("This PR has labels, checking...");
		for (let pr_Label of pr_Labels) {
			if (Arr_Match(labelsToAdd, pr_Label.name)) {
				console.log(`Label ${pr_Label.name} already added to PR`);
				RemoveFromArray(labelsToAdd, pr_Label.name);
			}
		}
	}

	return labelsToAdd;
}

/* Get the labels and their matching criteria from a file
*  or function.
*  Return the array of labels and their matching criteria
*/
async function GetLabels(octokit, context, configPath) {
	let labels = [];
	if (AreLabelsInFile)
	{
		const configContent = await GetConfigContent(octokit, context, configPath);
		let   encodedFileContent   = Buffer.from(configContent.data.content, configContent.data.encoding);
		const yamlFileContent = yaml.load(encodedFileContent);

		labels = GetLabelsFromFile(yamlFileContent);
	}
	else
	{
		labels = DefineLabelMatches();
	}

	return labels;
}

function LabelsToOutput(labelAndMatchCriteria)
{
	const outputLabels = [];
	for (const arr of labelAndMatchCriteria)
	{
		outputLabels.push(arr[0]);
	}
	return outputLabels.join(',');
}

/* Get labels and their matching criteria
*  from yamlFileContent: [object Object]
*  return the array of labels and their matching criteria
*  E.g. Array of [[label1,'matchA','matchB'],['label2','matchC'],...]
*/
function GetLabelsFromFile(yamlFileContent) {
	var labels = [];

	for (const tag in yamlFileContent) {
		if (typeof yamlFileContent[tag] === "string") {
			let tempLabels = [tag, yamlFileContent[tag]];
			labels.push(tempLabels);
		} else if (Array.isArray([yamlFileContent[tag]])) {
			let tempLabels = yamlFileContent[tag].toString().split(',');
			tempLabels.unshift(tag);
			labels.push(tempLabels);
		} else {
			console.log(`Unknown value type for label ${tag}. Expecting string or array of globs)`);
		}
	}
	return labels;
}

/* Validate labels to add to PR with
*  repository defined labels.
*  I.e. We dont want to create new labels
*/
function ValidateLabels(labelsToAdd, repo_Labels) {
	for (let lbl of labelsToAdd) {
		if (!Arr_Match(repo_Labels, lbl)) {
			throw new Error(`Trying to add invalid label [${lbl}] to repo. Valid repo labels are: \n\t ${repo_Labels.toString()}`);
		}
	}
}

/* Request content from github repo from the path
*  containing pr_label_config.yml
*  Return the loaded yaml content
*/
async function GetConfigContent(octokit, context, path)
{
	let response = await octokit.rest.repos.getContent({
	  ...context.repo,
	  path:path,
	  ref: context.sha,
	});

	return response;
}


/* Request labels data from repository
*  and return an Array of label names
*/
async function GetAllLabelsFromRepo(octokit, context) {
	const repo_Labels = [];
	const lbl_obj     = await octokit.rest.issues.listLabelsForRepo({
		...context.repo,
	});

	for (let lblObj of lbl_obj.data)
	{
		//Add label name to array
		repo_Labels.push(lblObj.name);
	}
	return repo_Labels;
}

/* Match the first word in pr_Title with the label's matching
*  criteria.
*  Return array containing label if matched, otherwise empty array
*/
function MatchLabelsWithTitle(pull_request, labels)
{
	const pr_Title      = pull_request.title;
	let matchedLabels = [];

	console.log(`Matching label criteria with PR title: ${pr_Title}`);
	for (let i = 0; i < labels.length; i++) {
		// get the size of the inner array
		var innerArrayLength = labels[i].length;
		// loop the inner array
		for (let j = 1; j < innerArrayLength; j++) {
			var lbl = labels[i][j];
			if (Str_Match(pr_Title,lbl))
			{
				console.log(`Matched... Add Label: [${labels[i][0]}] to pull request`);
				matchedLabels.push(labels[i][0]);
				return matchedLabels;
			}
		}
	}
	//only reach here if no label is matched
	return matchedLabels;
}

/* Remove strMatch from arr if it exists
*/
function RemoveFromArray(arr, strMatch) {
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
function Str_Match(strBase, strMatch)
{
	if (strBase.toLowerCase().startsWith(strMatch.toLowerCase()))
	{
		return true;
	}
	else { return false; }
}

/* Given array arrBase for each item, does it start with strMatch
*  returns: True|False
*/
function Arr_Match(arrBase, strMatch)
{
	for (let item of arrBase)
	{
		if (Str_Match(item,strMatch))
		{
			return true;
		}
	}
	return false;
}

/* Define the array of labels and their matching string as: array[array[]]
*  [['labelname1','matchword1','matchword2'], ['labelname2','matchword3','matchword4']]
*  return: array[array[]]
*/
function DefineLabelMatches()
{
	//Label associations
	const bugFixLabel = ['bugfix','bugfix'];
	const featLabel = ['feat','feat']
	const hotFixLabel = ['hotfix','hotfix']
	const refactorLabel = ['refactor','refactor']
	const choreLabel = ['chore','chore']

	const labels = [];
	labels.push(bugFixLabel);
	labels.push(featLabel);
	labels.push(hotFixLabel);
	labels.push(refactorLabel);
	labels.push(choreLabel);

	return labels;
}

run();