# Label-by-pr-title action
Add label given string match of PR title.

## Inputs

### `GITHUB_TOKEN`

**Required** The secret to access repo.

### `config`

**Required** The labels and their matching criteria


## Example usage

on: [pull_request]

jobs:
  label_my_pr_job:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v2
    - name: Display PR title
      id: myLabeler
      uses: ./
      with:
        GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
    - name: Get the output labels
      run: echo "The labels are ${{ steps.myLabeler.outputs.Labels}}"
