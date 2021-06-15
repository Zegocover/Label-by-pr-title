const core = require('@actions/core');
const github = require('@actions/github');

try {
  // Get PR title and body
  const pr_body = github.context.payload.pull_request.body;
  const pr_title = github.context.payload.pull_request.title; 
  console.log(`The comments of pull request is: #${pr_body}`);
  console.log(`The comments of pull request is: #${pr_title}`);
} catch (error) {
  console.log('Failed this test');
  core.setFailed(error.message);
}

function getPrNumber() {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
      return undefined;
  }
  return pullRequest.number;
}
