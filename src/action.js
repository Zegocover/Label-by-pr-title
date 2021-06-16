const core = require('@actions/core');
const github = require('@actions/github');

async function run()
{
	//Label associations
	const labels = DefineLabelMatches()

	try
	{
	const GITHUB_TOKEN     = core.getInput('GITHUB_TOKEN');
	const octokit          = github.getOctokit(GITHUB_TOKEN);
	const { context = {} } = github;
	const { pull_request } = context.payload;
	const pr_Labels        = pull_request.labels;
	const pr_Title         = pull_request.title;

	console.log("PR number is: " + github.context.payload.pull_request.number);
	console.log("PR Title is: " + pull_request.title)

	const labelsToAdd = CheckLabelsWithTitle(labels,pr_Title);

	/*await octokit.rest.issues.listLabelsForRepo({
		...context,
	});*/

	if (labelsToAdd.length > 0)
	{
		console.log(`PR_Labels is ${pr_Labels}`);
		if (pr_Labels.length > 0)
		{
			for (const [key,value] of Object.Entries(pr_Labels))
			{
				console.log(`Key is ${key} and one value is ${value}`);

			}
			/*console.log("This PR has labels, checking...");
			for (let pr_Label of pr_Labels)
			{
			console.log(`PR_Labels is ${pr_Labels} and one label is ${pr_Label}`);
				if (Arr_Match(labelsToAdd,pr_Label.name))
				{
					console.log(`Label ${pr_Label.name} already added to PR`);
					RemoveFromArray(labelsToAdd, pr_Label.name);
				}
			}*/
		
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

function RemoveFromArray(arr, strMatch) {
	const index = arr.indexOf(strMatch);
	if (index > -1) {
		arr.splice(index, 1);
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
	const enhancementLabel = ['enhancement','enhance', 'new','feature','Label']
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
			return true;
		}
	}
	return false;
}


run();