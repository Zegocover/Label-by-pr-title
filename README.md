# Label-by-pr-title action
Add label given string match of PR title

## Inputs

### `GITHUB_TOKEN`

**Required** The secret to access repo.


## Example usage

uses: actions/Label-by-pr-title@v1.1
with:
  GITHUB_TOKEN:  ${{secrets.GITHUB_TOKEN}
