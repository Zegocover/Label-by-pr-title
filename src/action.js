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

	await octokit.rest.issues.createComment({
		...context.repo,
		issue_number: pull_request.number,
		body: '3Thank you for submitting a pull request! We will try to review this as soon as we can.'
	});	

	const pr_owner = context.repo.owner;
	const pr_repo = context.repo;
	const pr_number = pull_request.number;
	console.log("comment created successfully");
	console.log("PR owner is: " + pr_owner);
	console.log("PR repo is: " + pr_repo);
	console.log("PR number is: " + pr_number);

/*	const myLabel = pull_request.labels;
	for (const lbl in myLabel) {
		console.log("each label: " + lbl);
	}

	console.log("Retrieved labels OK: " + myLabel);
*/

	await octokit.rest.issues.addLabels({
		owner: pr_owner,
		repo: pr_repo,
		issue_number: pull_request.number,
		labels: 0,
	});
	console.log("set label OK");

	console.log("Hello, world!");
	} catch(error)
	{
		core.setFailed(error.message);
	}
}




run();