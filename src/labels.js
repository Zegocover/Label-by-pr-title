"use strict";
exports.__esModule = true;
exports.DefineLabelMatches2 = exports.DefineLabelMatches = void 0;
/* Define the array of labels and their matching string as: array[array[]]
*  [['labelname1','matchword1','matchword2'], ['labelname2','matchword3','matchword4']]
*  return: array[array[]]
*/
function DefineLabelMatches() {
    //Label associations
    var bugFix = { label: 'bugfix', criteria: ['bugfix1'] };
    var feat = { label: 'feat', criteria: ['feat'] };
    var hotFix = { label: 'hotfix', criteria: ['hotfix'] };
    var refactor = { label: 'refactor', criteria: ['refactor'] };
    var chore = { label: 'chore', criteria: ['chore'] };
    var labels = [];
    labels.push(bugFix);
    labels.push(feat);
    labels.push(hotFix);
    labels.push(refactor);
    labels.push(chore);
    return labels;
}
exports.DefineLabelMatches = DefineLabelMatches;
/* Define the array of labels and their matching string as: array[array[]]
*  [['labelname1','matchword1','matchword2'], ['labelname2','matchword3','matchword4']]
*  return: array[array[]]
*/
function DefineLabelMatches2() {
    //Label associations
    var bugFixLabel = ['bugfix', 'bugfix'];
    var featLabel = ['feat', 'feat'];
    var hotFixLabel = ['hotfix', 'hotfix'];
    var refactorLabel = ['refactor', 'refactor'];
    var choreLabel = ['chore', 'chore'];
    var labels = [];
    labels.push(bugFixLabel);
    labels.push(featLabel);
    labels.push(hotFixLabel);
    labels.push(refactorLabel);
    labels.push(choreLabel);
    return bugFixLabel;
}
exports.DefineLabelMatches2 = DefineLabelMatches2;
