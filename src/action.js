const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require("js-yaml");

//const defaultPath = '.github/pr_label_config.yml';

async function run()
{
	//Label associations
	//const labelsOriginal = DefineLabelMatches()

	try
	{
	const GITHUB_TOKEN     = core.getInput('GITHUB_TOKEN');
	const configPath       = core.getInput('config');
	const octokit          = github.getOctokit(GITHUB_TOKEN);
	const { context = {} } = github;
	const { pull_request } = context.payload;
	const pr_Labels        = pull_request.labels;
	const pr_Title         = pull_request.title;

	console.log("PR number is: " + github.context.payload.pull_request.number);
	console.log("PR Title is: " + pull_request.title)

	console.log(`Get label config file: ${configPath}`);
	const configurationContent = await GetContent(octokit, context, configPath);
	let   encodedFileContent   = Buffer.from(configurationContent.data.content, configurationContent.data.encoding);
	const yamlFileContent      = yaml.load(encodedFileContent);
	const labels               = DefineLabelsFromFile(yamlFileContent);
	const labelsToAdd          = CheckLabelsWithTitle(labels,pr_Title);
	const outputLabels         = LabelsToOutput(labels);
	core.setOutput("Labels",outputLabels);

	if (labelsToAdd.length > 0)
	{
		console.log("Validate labels from file with repo");
		const repo_Labels = await GetAllLabelsFromRepo(octokit, context);
		ValidateLabels(labelsToAdd, repo_Labels);
		console.log(`Labels ${labelsToAdd.toString()} are valid for this repo`);

		if (pr_Labels.length > 0)
		{
			console.log("This PR has labels, checking...");
			for (let pr_Label of pr_Labels)
			{
				if (Arr_Match(labelsToAdd,pr_Label.name))
				{
					console.log(`Label ${pr_Label.name} already added to PR`);
					RemoveFromArray(labelsToAdd, pr_Label.name);
				}
			}
		}

		if (labelsToAdd.length > 0)
		{
			console.log(`Labels to add to PR: ${labelsToAdd}`)
			await octokit.rest.issues.addLabels({
				...context.repo,
				issue_number: pull_request.number,
				labels: labelsToAdd
			});
			console.log("Labels added.");
		}
		else
		{
			console.log("No new labels added to pull request.");
		}
	}
	else
	{
		console.log("No labels to add to PR");
	}

	/*
	await octokit.rest.issues.removeLabel({
		...context.repo,
		issue_number: pull_request.number,
		name: allMyLabels[0].name
	});
	console.log("Removed first label OK");

	console.log(`Add this label ${allMyLabels[0].name}`)
	labelArr.push(allMyLabels[0].name);
	await octokit.rest.issues.addLabels({
		...context.repo,
		issue_number: pull_request.number,
		labels: labelArr
	});
	*/
/*

		const readable_Labels = JSON.stringify(allMyLabels,undefined,2);
	//	console.log("Print all labels: " + readable_Labels);
	const first_Label = JSON.stringify(allMyLabels[0],undefined,2);
	console.log("Print first label: " + first_Label);

	await octokit.rest.issues.createComment({
		...context.repo,
		issue_number: pull_request.number,
		body: '3Thank you for submitting a pull request! We will try to review this as soon as we can.'
	});
*/
	} catch(error)
	{
		core.setFailed(error.message);
	}
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

/* Create array of labels and their matching criteria from file
*  From yamlFileContent: [object Object]
*  create an array of [[label1,'matchA','matchB'],['label2','matchC'],...]
*  return the array of labels and their matching criteria
*/
function DefineLabelsFromFile(yamlFileContent, labels) {
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
*/
async function GetContent(octokit, context, path)
{
	let response = await octokit.rest.repos.getContent({
	  ...context.repo,
	  path:path,
	  ref: context.sha,
	});

	return response;

	//return Buffer.from(response.data.content, response.data.encoding);
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

/* Given array of labels = [['labelname1','matchword1','matchword2'], ['labelname2','matchword3','matchword4']]
*  Does the pr_Title start with any of the matching words?
*  true - Add labelname to MatchedLabels array
*  false - continue
*/
function CheckLabelsWithTitle(labels, pr_Title)
{
	const matchedLabels = [];

	console.log("Matching labels with PR title...");

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
			}
		}
	}
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


/* Define the array of labels and their matching string as: array[array[]]
*  [['labelname1','matchword1','matchword2'], ['labelname2','matchword3','matchword4']]
*  return: array[array[]]
*/
function DefineLabelMatches(label, )
{
/*	//Label associations
	const bugLabel = ['bug','name','fix', 'test'];
	const enhancementLabel = ['enhancement','enhance', 'new','feature','Label']
	const labels = [];
	labels.push(bugLabel);
	labels.push(enhancementLabel);
	return labels
*/


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


run();