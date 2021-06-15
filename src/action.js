const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');

async function run()
{
	//Label associations
	const labels = DefineLabelMatches()

	try
	{
	const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
	console.log("my token" + GITHUB_TOKEN);
	const octokit          = github.getOctokit(GITHUB_TOKEN);
	const { context = {} } = github;
	const { pull_request } = context.payload;
	const pr_Labels      = pull_request.labels;
	const pr_Title         = pull_request.title;
	const labelArr            = [];

	console.log("PR number is: " + github.context.payload.pull_request.number);
	console.log("PR Title is: " + pull_request.title)
	console.log("Select first label name from PR to remove: " + pr_Labels[0].name);

	const labelsMatched = CheckLabelsWithTitle(labels,pr_Title);


	if (labelsMatched.length > 0)
	{
		if (pr_Labels.length > 0)
		{
			//check labelsMatched are included on PR
			console.log("This pull request has labels: " + pr_Labels.toString());
			for (const pr_label of pr_Labels)
			{
				if (Arr_Match(labelsMatched,pr_label))
				{
					console.log(`Label [0${pr_label}] exists on PR. Do not add`);
					labelsMatched.pop(pr_label);
				}
			}
		}
		console.log(`Add this label ${pr_Labels[0].name}`)
		labelArr.push(pr_Labels[0].name);
		await octokit.rest.issues.addLabels({
			...context.repo,
			issue_number: pull_request.number,
			labels: labelsMatched
		});
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
	console.log("Added label OK");
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
	console.log("Hello, world!");
	} catch(error)
	{
		core.setFailed(error.message);
	}
}

function CheckLabelsWithTitle(labels, pr_Title)
{
	const matchedLabels = [];
	for (let i = 0; i < labels.length; i++) {
		// get the size of the inner array
		var innerArrayLength = labels[i].length;
		// loop the inner array
		for (let j = 1; j < innerArrayLength; j++) {
			var lbl = labels[i][j];
			//console.log('[' + i + ',' + j + '] = ' + lbl);
			//console.log(`Label is ${lbl.toString()}`);
			if (Str_Match(pr_Title,lbl))
			{
				console.log(`Matched... Add Label: [${labels[i][0]}] to pull request`);
				matchedLabels.push(labels[i][0]);
			}
		}	
	}
	return matchedLabels;
}

function DefineLabelMatches()
{
	//Label associations
	const bugLabel = ['bug','name','fix'];
	const enhancementLabel = ['enhancement','enhance', 'new','feature']
	const labels = [];
	labels.push(bugLabel);
	labels.push(enhancementLabel);	
	return labels
}

function Str_Match(strBase, strMatch)
{
	if (strBase.toLowerCase().indexOf(strMatch.toLowerCase()) != -1)
	{
		return true;
	}
	else { return false; }
}

function Arr_Match(arrBase, strMatch)
{
	for (let item of arrBase)
	{
		if (Str_Match(item,strMatch))
		{
			console.log(`Matched ${strMatch} in array`)
			return true;
		}
	}
	return false;
}


run();