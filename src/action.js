"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core = require("@actions/core");
var github = require("@actions/github");
var yaml = require("js-yaml");
var labels_1 = require("./labels");
var UseDefaultLabels = false;
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var GITHUB_TOKEN, configPath, octokit, pr_No, labels, pr_Title, labelsToAdd, outputLabels, repo_Labels, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
                    configPath = core.getInput('config');
                    octokit = github.getOctokit(GITHUB_TOKEN);
                    pr_No = (_a = github.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number;
                    // ensure pr_No is not undefined type
                    if (!pr_No) {
                        console.log("Failed to retrieve PR number from payload");
                        return [2 /*return*/];
                    }
                    console.log("PR number is: " + pr_No);
                    console.log("Get label config file: " + configPath);
                    UseDefaultLabels = configPath === "N/A";
                    if (!UseDefaultLabels) {
                        console.log("Get label config file: " + configPath);
                    }
                    return [4 /*yield*/, GetLabels(octokit, configPath)];
                case 1:
                    labels = _b.sent();
                    return [4 /*yield*/, GetPRData(octokit, pr_No)];
                case 2:
                    pr_Title = (_b.sent()).title;
                    labelsToAdd = MatchLabelsWithTitle(pr_Title, labels);
                    outputLabels = LabelsToOutput(labels);
                    core.setOutput("Labels", outputLabels);
                    if (!(labelsToAdd.length > 0)) return [3 /*break*/, 8];
                    console.log("Validate label with repo");
                    return [4 /*yield*/, GetAllLabelsFromRepo(octokit)];
                case 3:
                    repo_Labels = _b.sent();
                    if (!AreLabelsValid(labelsToAdd, repo_Labels)) {
                        throw new Error("Label does not exist on repo. Ensure the following labels are available on repo: \n\t " + outputLabels);
                    }
                    console.log("Label " + labelsToAdd.toString() + " is valid for this repo");
                    return [4 /*yield*/, LabelExistOnPullRequest(octokit, pr_No, labelsToAdd)];
                case 4:
                    //Is the label on the pull request already?
                    labelsToAdd = _b.sent();
                    if (!(labelsToAdd.length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, AddLabel(octokit, pr_No, labelsToAdd)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    console.log("No new labels added to PR");
                    _b.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    console.log("No labels to add to PR");
                    _b.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_1 = _b.sent();
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/* Add labels to pull request.
*/
function AddLabel(octokit, prNumber, labelsToAdd) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Label to add to PR: " + labelsToAdd);
                    return [4 /*yield*/, octokit.rest.issues.addLabels({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            issue_number: prNumber,
                            labels: labelsToAdd
                        })];
                case 1:
                    _a.sent();
                    console.log("Labels added");
                    return [2 /*return*/];
            }
        });
    });
}
/* Remove labels from labelsToAdd if they exist on pull request
*  Return: labelsToAdd
*/
function LabelExistOnPullRequest(octokit, pr_No, labelsToAdd) {
    return __awaiter(this, void 0, void 0, function () {
        var pr_Labels, _i, pr_Labels_1, label, name_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GetPRData(octokit, pr_No)];
                case 1:
                    pr_Labels = (_a.sent()).labels;
                    if (pr_Labels.length > 0) {
                        console.log("This PR has labels, checking...");
                        for (_i = 0, pr_Labels_1 = pr_Labels; _i < pr_Labels_1.length; _i++) {
                            label = pr_Labels_1[_i];
                            name_1 = typeof (label) === "string" ? label : label.name;
                            if (!name_1) {
                                continue;
                            }
                            if (Arr_Match(labelsToAdd, name_1)) {
                                console.log("Label " + name_1 + " already added to PR");
                                RemoveFromArray(labelsToAdd, name_1);
                            }
                        }
                    }
                    return [2 /*return*/, labelsToAdd];
            }
        });
    });
}
/* Get the labels and their matching criteria from a file
*  or function.
*  Return Labels and matching criteria as LabelAndCriteria[]
*/
function GetLabels(octokit, configPath) {
    return __awaiter(this, void 0, void 0, function () {
        var labels, configContent, encodedFileContent, yamlFileContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    labels = [];
                    if (!UseDefaultLabels) return [3 /*break*/, 2];
                    return [4 /*yield*/, GetConfigContent(octokit, configPath)];
                case 1:
                    configContent = _a.sent();
                    encodedFileContent = Buffer.from(configContent.data.content, configContent.data.encoding);
                    yamlFileContent = yaml.load(encodedFileContent);
                    labels = GetLabelsFromFile(yamlFileContent);
                    return [3 /*break*/, 3];
                case 2:
                    labels = labels_1.DefineLabelMatches();
                    _a.label = 3;
                case 3: return [2 /*return*/, labels];
            }
        });
    });
}
/* Define the labels to output
*  Return string of labels
*/
function LabelsToOutput(labelAndMatchCriteria) {
    var outputLabels = [];
    for (var _i = 0, labelAndMatchCriteria_1 = labelAndMatchCriteria; _i < labelAndMatchCriteria_1.length; _i++) {
        var labelData = labelAndMatchCriteria_1[_i];
        outputLabels.push(labelData.name);
    }
    return outputLabels.join(',');
}
/* Get labels and their matching criteria
*  from yamlFileContent: [object Object]
*  return the array of labels and their matching criteria
*  E.g. Array of [[label1,'matchA','matchB'],['label2','matchC'],...]
*  Return Labels and matching criteria as LabelAndCriteria[]
*/
function GetLabelsFromFile(yamlFileContent) {
    var labels = [];
    for (var tag in yamlFileContent) {
        if (typeof yamlFileContent[tag] === "string") {
            labels.push({ name: tag, criteria: yamlFileContent[tag] });
        }
        else if (Array.isArray([yamlFileContent[tag]])) {
            var labelCriteria = yamlFileContent[tag].toString().split(',');
            labels.push({ name: tag, criteria: labelCriteria });
        }
        else {
            console.log("Unknown value type for label " + tag + ". Expecting string or array of globs)");
        }
    }
    return labels;
}
/* Validate labels to add to PR with
*  repository defined labels.
*  I.e. We dont want to create new labels
*  Return True|False
*/
function AreLabelsValid(labelsToAdd, repo_Labels) {
    for (var _i = 0, labelsToAdd_1 = labelsToAdd; _i < labelsToAdd_1.length; _i++) {
        var lbl = labelsToAdd_1[_i];
        if (!Arr_Match(repo_Labels, lbl)) {
            return false;
        }
    }
    return true;
}
/* Request content from github repo from the path
*  containing pr_label_config.yml
*  Return the octokit response
*/
function GetConfigContent(octokit, path) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.rest.repos.getContent({
                        owner: github.context.repo.owner,
                        repo: github.context.repo.repo,
                        path: path,
                        ref: github.context.sha
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response];
            }
        });
    });
}
/* Get the PR Title from PR number
* Return pull request data property
*/
function GetPRData(octokit, pr_No) {
    return __awaiter(this, void 0, void 0, function () {
        var pullRequest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.rest.issues.get({
                        owner: github.context.repo.owner,
                        repo: github.context.repo.repo,
                        issue_number: pr_No
                    })];
                case 1:
                    pullRequest = _a.sent();
                    return [2 /*return*/, pullRequest.data];
            }
        });
    });
}
/* Request labels data from repository
*  Return string[] of label names
*/
function GetAllLabelsFromRepo(octokit) {
    return __awaiter(this, void 0, void 0, function () {
        var repo_Labels, lbl_obj, _i, _a, lblObj;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    repo_Labels = [];
                    return [4 /*yield*/, octokit.rest.issues.listLabelsForRepo({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo
                        })];
                case 1:
                    lbl_obj = _b.sent();
                    for (_i = 0, _a = lbl_obj.data; _i < _a.length; _i++) {
                        lblObj = _a[_i];
                        //Add label name to array
                        repo_Labels.push(lblObj.name);
                    }
                    return [2 /*return*/, repo_Labels];
            }
        });
    });
}
/* Match the first word in pr_Title with the label's matching
*  criteria.
*  Return string[] of matched labels, otherwise empty
* Remarks - Return is currently limited to first match
*/
function MatchLabelsWithTitle(pr_Title, labels) {
    var matchedLabels = [];
    console.log("Matching label criteria with PR title: " + pr_Title);
    for (var _i = 0, labels_2 = labels; _i < labels_2.length; _i++) {
        var labelData = labels_2[_i];
        if (Str_Match(pr_Title, labelData.name)) {
            console.log("Matched... Add Label: [" + labelData.name + "] to pull request");
            matchedLabels.push(labelData.name);
            return matchedLabels;
        }
    }
    //only reach here if no label is matched
    return matchedLabels;
}
/* Remove strMatch from arr if it exists
*/
function RemoveFromArray(arr, strMatch) {
    var lowercaseArr = arr.map(function (value) {
        return value.toLowerCase();
    });
    var index = lowercaseArr.indexOf(strMatch.toLowerCase());
    if (index > -1) {
        arr.splice(index, 1);
    }
}
/* Given string strBase does it start with strMatch
*  returns: True|False
*/
function Str_Match(strBase, strMatch) {
    if (strBase.toLowerCase().startsWith(strMatch.toLowerCase())) {
        return true;
    }
    else {
        return false;
    }
}
/* Given array arrBase for each item, does it start with strMatch
*  returns: True|False
*/
function Arr_Match(arrBase, strMatch) {
    for (var _i = 0, arrBase_1 = arrBase; _i < arrBase_1.length; _i++) {
        var item = arrBase_1[_i];
        if (Str_Match(item, strMatch)) {
            return true;
        }
    }
    return false;
}
run();
