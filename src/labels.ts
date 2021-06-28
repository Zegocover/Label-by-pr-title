
export type LabelAndCriteria = {
	name: string,
	criteria: string[]
}


/* Define labels and their matching criteria as type LabelAndCriteria]
*  return: An array labels and their matching criteria
*/
export function DefineLabelMatches() : LabelAndCriteria[]{
	//Label associations
	const bugFix : LabelAndCriteria   = {name:'bugfix', criteria:['bugfix']};
	const feat : LabelAndCriteria     = {name:'feat', criteria:['feat']};
	const hotFix : LabelAndCriteria   = {name:'hotfix', criteria:['hotfix']};
	const refactor : LabelAndCriteria = {name:'refactor', criteria:['refactor']};
	const chore : LabelAndCriteria    = {name:'chore', criteria:['chore']};

	const labels : LabelAndCriteria[] = [];
	labels.push(bugFix);
	labels.push(feat);
	labels.push(hotFix);
	labels.push(refactor);
	labels.push(chore);

	return labels;
}