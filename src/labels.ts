
export type LabelAndCriteria = {
	label: string,
	criteria: string[]	
}


/* Define the array of labels and their matching string as: array[array[]]
*  [['labelname1','matchword1','matchword2'], ['labelname2','matchword3','matchword4']]
*  return: array[array[]]
*/
export function DefineLabelMatches() : LabelAndCriteria[]{
	//Label associations
	const bugFix : LabelAndCriteria   = {label:'bugfix', criteria:['bugfix1']};
	const feat : LabelAndCriteria     = {label:'feat', criteria:['feat']};
	const hotFix : LabelAndCriteria   = {label:'hotfix', criteria:['hotfix']};
	const refactor : LabelAndCriteria = {label:'refactor', criteria:['refactor']};
	const chore : LabelAndCriteria    = {label:'chore', criteria:['chore']};
	
	const labels : LabelAndCriteria[] = [];
	labels.push(bugFix);
	labels.push(feat);
	labels.push(hotFix);
	labels.push(refactor);
	labels.push(chore);

	return labels;
}

/* Define the array of labels and their matching string as: array[array[]]
*  [['labelname1','matchword1','matchword2'], ['labelname2','matchword3','matchword4']]
*  return: array[array[]]
*/
export function DefineLabelMatches2() : string[]{
	//Label associations
	const bugFixLabel = ['bugfix','bugfix'];
	const featLabel = ['feat','feat']
	const hotFixLabel = ['hotfix','hotfix']
	const refactorLabel = ['refactor','refactor']
	const choreLabel = ['chore','chore']

	const labels = [];
	labels.push(bugFixLabel);
	labels.push(featLabel);
	labels.push(hotFixLabel);
	labels.push(refactorLabel);
	labels.push(choreLabel);

	return bugFixLabel;
}