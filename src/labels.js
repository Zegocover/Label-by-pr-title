/* Define the array of labels and their matching string as: array[array[]]
*  [['labelname1','matchword1','matchword2'], ['labelname2','matchword3','matchword4']]
*  return: array[array[]]
*/
export function DefineLabelMatches()
{
	//Label associations
	const bugFixLabel = ['bugfix','bugfix'];
	const featLabel = ['feat','feat','create']
	const hotFixLabel = ['hotfix','hotfix']
	const refactorLabel = ['refactor','refactor']
	const choreLabel = ['chore','chore']

	const labels = [];
	labels.push(bugFixLabel);
	labels.push(featLabel);
	labels.push(hotFixLabel);
	labels.push(refactorLabel);
	labels.push(choreLabel);

	return labels;
}