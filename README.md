# Label-by-pr-title action
Add label given string match of PR title

## Inputs

### `GITHUB_TOKEN`

**Required** The secret to access repo.

### `config`

**Required** The labels and their matching criteria


## Example usage

uses: actions/Label-by-pr-title@v1.0
with:
  GITHUB_TOKEN:  ${{secrets.GITHUB_TOKEN}
