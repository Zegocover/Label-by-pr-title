const core = require('@actions/core');
const github = require('@actions/github');

async function run() 
{
	try
	{
	const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
	const octokit = github.getOctokit(GITHUB_TOKEN);
	const { context = {} } = github;
	const { pull_request } = context.payload;
	const bugLabel = String["bug"];

	await octokit.rest.issues.createComment({
		...context.repo,
		issue_number: pull_request.number,
		body: '2Thank you for submitting a pull request! We will try to review this as soon as we can.'
	});	

	context.pull_request.addLabels({
		...context.repo,
		issue_number: pull_request.number,
		labels: String["bug"],
	})


	await octokit.rest.issues.addLabels({
		...context.repo,
		issue_number: pull_request.number,
		labels: String["bug"],
	});
	  
	console.log('Hello, world!');
	} catch(error)
	{
		core.setFailed(error.message);
	}
}




run();