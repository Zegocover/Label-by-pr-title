const core = require('@actions/core');
const github = require('@actions/github');

async function run()
{
	try
	{
	const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
	const configPath = ".github/Label.config.yml";
	console.log("my token" + GITHUB_TOKEN);
	const octokit          = github.getOctokit(GITHUB_TOKEN);
	const { context = {} } = github;
	const { pull_request } = context.payload;
	const allMyLabels      = pull_request.labels;
	const pr_Title         = pull_request.title;
	const labelArr            = [];

	console.log("PR number is: " + github.context.payload.pull_request.number);
	console.log("PR Title is: " + pull_request.title)
	console.log("Select first label name from PR to remove: " + allMyLabels[0].name);

	const config = await GetConfig(octokit,configPath);

	const labels = [];
	const labelsToRemove = [];
	for (const [label, globs] of labelGlobs.entries()) {
		core.log(`processing ${label}`);
		if (checkGlobs(changedFiles, globs)) {
			console.log("Add label");
			labels.push(label);
		} else if (pullRequest.labels.find((l) => l.name === label)) {
			labelsToRemove.push(label);
			console.log("Remove label");
		}
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
	console.log("Added label OK");
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
	console.log("Hello, world!");
	} catch(error)
	{
		core.setFailed(error.message);
	}
}

async function GetConfig(octokit, configPath)
{
	const response = octokit.rest.repos.getContent({
		...context,
		path: configPath,
	});

  return Buffer.from(response.data.content, response.data.encoding).toString();
}



run();