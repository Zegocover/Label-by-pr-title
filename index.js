const core = require('@actions/core');
const github = require('@actions/github');

try {
  console.log(`Reading from index.js`);
} catch (error) {
  console.log('Failed this test in index.js');
  core.setFailed(error.message);
}

