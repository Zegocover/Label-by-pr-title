# Label-by-pr-title action
Label pull request when the title starts with a specific word.

**Note:** If the label does not exist on the repo, it will be added to it.

## Inputs

### `GITHUB_TOKEN`

**Required** The secret to access repo.

### `config`

**Optional** Provide path to *.yml file containing the label configurations. The config file must specify labels and their matching criteria in the following format.

```yaml
Label1:
  - ['word1']
Label2:
  - ['word2','word3']
```

If config file is not specified then the default label configuration below will be used. 

```yaml
feat:
  - ['feat']
hotfix:
  - ['hotfix']
bugfix:
  - ['bugfix']
refactor:
  - ['refactor']
chore:
  - ['chore']
```

## Outputs

### `Labels`

The labels read from file or default configuration

## Example usage

```
on: [pull_request]

jobs:
  label_my_pr_job:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v2
    - name: Display PR title
      id: myLabeler
      uses: Zegocover/Label-by-pr-title@v1.5
      with:
        GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
    - name: Get the output labels
      run: echo "The labels are ${{ steps.myLabeler.outputs.Labels}}"
```
