"use strict";
exports.__esModule = true;
exports.DefineLabelMatches = void 0;
/* Define the array of labels and their matching string as: array[array[]]
*  [['labelname1','matchword1','matchword2'], ['labelname2','matchword3','matchword4']]
*  return: array[array[]]
*/
function DefineLabelMatches() {
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
    return labels;
}
exports.DefineLabelMatches = DefineLabelMatches;
