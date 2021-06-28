"use strict";
exports.__esModule = true;
exports.DefineLabelMatches = void 0;
/* Define labels and their matching criteria as type LabelAndCriteria]
*  return: An array labels and their matching criteria
*/
function DefineLabelMatches() {
    //Label associations
    var bugFix = { name: 'bugfix', criteria: ['bugfix'] };
    var feat = { name: 'feat', criteria: ['feat'] };
    var hotFix = { name: 'hotfix', criteria: ['hotfix'] };
    var refactor = { name: 'refactor', criteria: ['refactor'] };
    var chore = { name: 'chore', criteria: ['chore'] };
    var labels = [];
    labels.push(bugFix);
    labels.push(feat);
    labels.push(hotFix);
    labels.push(refactor);
    labels.push(chore);
    return labels;
}
exports.DefineLabelMatches = DefineLabelMatches;
