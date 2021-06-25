import {TestDefineLabelMatches} from "./labels";
import {LabelAndCriteria} from "./labels";



async function run()
{
	//Label associations
	const labels : LabelAndCriteria[] = TestDefineLabelMatches();
	for (let labelCriteria of labels)
	{
		console.log(`The label is: ${labelCriteria.label} and its criteria is: ${labelCriteria.criteria}`)
	}
}

run();