const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const yaml = require('js-yaml');

async function run()
{
	//Label associations
	const labels = DefineLabelMatches();
	const labelsMatched = [];
	const dummy_labelsMatched = ['bug','enhancement','help required'];

	try
	{
		const arr = ['a','b','c'];
var myVal = Object.prototype.toString.call(arr);
console.log(`IS this an array? ${Array.isArray(arr)}`);
console.log(myVal);
if (myVal.Map(String.toLowerCase.match(/^(array)$/) ))
{console.log("This is an array");}
 else {console.log("This is not an array");}

 /*
	const pr_Title	= "This is the name of my PR request";


	console.log("PR Title is: " + pr_Title);
	for (let i = 0; i < labels.length; i++) {
		// get the size of the inner array
		var innerArrayLength = labels[i].length;
		// loop the inner array
		for (let j = 1; j < innerArrayLength; j++) {
		    	var lbl = labels[i][j];
			console.log(`Label is ${lbl.toString()}`);
			if (Str_Match(pr_Title,lbl))
			{
				console.log(`Matched... \n\t Add ${labels[i][0]} to PR`);
				labelsMatched.push(labels[i][0]);
			} 
			else {		
				console.log("Did not match");
			}
		}	
	}
	const pr_Labels = ['bug','enhancement'];
	//check labelsMatched are included on PR
	console.log("This pull request has labels: " + pr_Labels.toString());
	for (const label of pr_Labels)
	{
		console.log(`Is label [${label}] in the labelsMatched array? [${dummy_labelsMatched.toString()}]`);
		if (Arr_Match(dummy_labelsMatched,label))
		{
			RemoveFromArray(dummy_labelsMatched, label);
		}
	}

	console.log(`Labels to add to my PR [${dummy_labelsMatched.toString()}]`);*/

	/*
	for (const lbl of bugLabel)
	{
		console.log(`Label is ${lbl.toString()}`);
		if (Str_Match(pr_Title,lbl))
		{
			console.log("Matched... Add bug to PR");
		} 
		else {		
			console.log("Did not match");
		}
	}*/
/*

		const readable_Labels = JSON.stringify(allMyLabels,undefined,2);
	//	console.log("Print all labels: " + readable_Labels);
	const first_Label = JSON.stringify(allMyLabels[0],undefined,2);
	console.log("Print first label: " + first_Label);

	await octokit.rest.issues.createComment({
		...context.repo,
		issue_number: pull_request.number,
		body: '3Thank you for submitting a pull request! We will try to review this as soon as we can.'
	});

	await octokit.rest.issues.addLabels({
		owner: pr_owner,
		repo: pr_repo,
		issue_number: pull_request.number,
		labels: `bug`,
	});
	console.log("set label OK");
*/
	} catch(error)
	{
		core.setFailed(error.message);
	}
}

function RemoveFromArray(dummy_labelsMatched, label) {
	const index = dummy_labelsMatched.indexOf(label);
	console.log(`Yes... at index ${index}`);

	if (index > -1) {
		dummy_labelsMatched.splice(index, 1);
	}

	else {
		console.log("Cannot remove this label");
	}
}

function DefineLabelMatches()
{
	//Label associations
	const tempbugLabel = ['name','fix','this'];
	const bugLabel = ['bug', tempbugLabel.join(',')];
	const enhancementLabel = ['enhancement','enhance', 'new','feature']
	const labels = [];
	labels.push(bugLabel);
	labels.push(enhancementLabel);	
	return labels
}

function Str_Match(strBase, strMatch)
{
	if (strBase.toLowerCase().startsWith(strMatch.toLowerCase()))
	{
		return true;
	}
	else { return false; }
}

function Arr_Match(arrBase, strMatch)
{
	for (let item of arrBase)
	{
		if (Str_Match(item,strMatch))
		{
			console.log(`Matched ${strMatch} in array`)
			return true;
		}
	}
	return false;
}

run();