# Label-by-pr-title action
Add label given string match of PR title.

## Inputs

### `GITHUB_TOKEN`

**Required** The secret to access repo.

### `config`

**Optional** Provide path to *.yml file containing the labels and their matching criteria or ommit to use the actions default labels:\n
  bug,feat,hotfix,bugfix,refactor,chore\n
Note: Default labels criteria is the same as label name.


## Outputs

### `Labels`

The labels defined in config or defaulted in code.

## Example usage

on: [pull_request]

jobs:\n
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
