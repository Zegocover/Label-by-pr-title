const core = require('@actions/core');
const github = require('@actions/github');

async function run() 
{
	try
	{
	const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
	console.log("my token" + GITHUB_TOKEN);
	const octokit = github.getOctokit(GITHUB_TOKEN);
	const { context = {} } = github;
	const { pull_request } = context.payload;
	const bugLabel = String["bug"];
/*
	await octokit.rest.issues.createComment({
		...context.repo,
		issue_number: pull_request.number,
		body: '3Thank you for submitting a pull request! We will try to review this as soon as we can.'
	});	
*/
	const pr_owner = context.repo.owner;
	const pr_repo = context.repo;
	const pr_number = pull_request.number;
	console.log("comment created successfully");
	console.log("PR owner is: " + pr_owner);
	console.log("PR repo is: " + pr_repo);
	console.log("PR number is: " + pr_number);

	const myLabel = pull_request.labels;
		const stringed2 = JSON.stringify(myLabel,undefined,2);
		console.log("Print all labels: " + stringed2);

		const stringed3 = JSON.stringify(myLabel[0],undefined,2);
		console.log("Print first label: " + stringed3);
		console.log("First label name is: " + myLabel[0].name);



	for (const lbl in myLabel) {
		const stringed = JSON.stringify(lbl,undefined,2);
		console.log("each label name: " + lbl.name);
		console.log("each label stringged: " + stringed);
	}

	console.log("Retrieved labels OK: " + myLabel);
	
/*
	await octokit.rest.issues.removeLabel({
		owner: pr_owner,
		repo: pr_repo,
		issue_number: pull_request.number,
		labels: myLabel,
	});
	console.log("Removed label OK");

	await octokit.rest.issues.addLabels({
		owner: pr_owner,
		repo: pr_repo,
		issue_number: pull_request.number,
		labels: `bug`,
	});
	console.log("set label OK");
*/
	console.log("Hello, world!");
	} catch(error)
	{
		core.setFailed(error.message);
	}
}




run();