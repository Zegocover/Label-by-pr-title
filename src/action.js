const core = require('@actions/core');
const github = require('@actions/github');

async function run() 
{
	const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
	const octokit = github.getOctokit(GITHUB_TOKEN);
	const { context = {} } = github;
	const { pull_request } = context.payload;

	const labelGlobs = await getLabelGlobs(
		client,
		configPath
	      );

	      const labels = [];
	      const labelsToRemove = [];
	      for (const [label, globs] of labelGlobs.entries()) {
		core.debug(`processing ${label}`);
		if (checkGlobs(changedFiles, globs)) {
		  labels.push(label);
		} else if (pullRequest.labels.find((l) => l.name === label)) {
		  labelsToRemove.push(label);
		}
	      }
	  
	      if (labels.length > 0) {
		await addLabels(client, prNumber, labels);
	      }
	  
	console.log('Hello, world!');
}

async function addLabels(
	client,
	prNumber,
	labels
      ) {
	await client.issues.addLabels({
	  owner: github.context.repo.owner,
	  repo: github.context.repo.repo,
	  issue_number: prNumber,
	  labels: labels,
	});
      }      
run();