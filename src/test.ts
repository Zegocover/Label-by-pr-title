import {DefineLabelMatches} from "./labels";
import {LabelAndCriteria} from "./labels";



async function run()
{
	//Label associations
	const labels : LabelAndCriteria[] = DefineLabelMatches();
	for (let labelCriteria of labels)
	{
		console.log(`The label is: ${labelCriteria.name} and its criteria is: ${labelCriteria.criteria}`)
	}
}

run();