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
var actions_toolkit_1 = require("actions-toolkit");
var yaml = require("js-yaml");
var labels_1 = require("./labels");
actions_toolkit_1.Toolkit.run(function (tools) { return __awaiter(void 0, void 0, void 0, function () {
    //#endregion
    //#region Github calls
    /* Find the last event and return its data
    */
    function GetLastEvent(pr_No, timestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var pageNo, link, events, lastIndex, lastEvent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pageNo = 0;
                        _a.label = 1;
                    case 1:
                        pageNo++;
                        return [4 /*yield*/, tools.github.issues.listEvents({
                                owner: tools.context.repo.owner,
                                repo: tools.context.repo.repo,
                                issue_number: pr_No,
                                page: pageNo
                            })];
                    case 2:
                        events = _a.sent();
                        link = events.headers.link;
                        if (!link) {
                            tools.exit.failure("link is undefined for page " + pageNo);
                            return [3 /*break*/, 4];
                        }
                        _a.label = 3;
                    case 3:
                        if (link.includes("rel=\"next\"")) return [3 /*break*/, 1];
                        _a.label = 4;
                    case 4:
                        lastIndex = events.data.length - 1;
                        lastEvent = events.data[lastIndex];
                        return [2 /*return*/, lastEvent];
                }
            });
        });
    }
    /* Retrieve labels added by this action from the Labelled event
    */
    function GetLabelsFromEvent(pr_No, actionStartTime) {
        return __awaiter(this, void 0, void 0, function () {
            var labels, lastEvent, lastEventTime, lastEventData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        labels = [];
                        return [4 /*yield*/, GetLastEvent(pr_No, actionStartTime)];
                    case 1:
                        lastEvent = _a.sent();
                        lastEventTime = Math.round(new Date(lastEvent.created_at).getTime() / 1000);
                        if (!(lastEvent.event == 'labeled' && lastEventTime >= actionStartTime)) return [3 /*break*/, 3];
                        tools.log("Found labeled event added by this action");
                        return [4 /*yield*/, tools.github.issues.getEvent({
                                owner: tools.context.repo.owner,
                                repo: tools.context.repo.repo,
                                event_id: lastEvent.id
                            })];
                    case 2:
                        lastEventData = _a.sent();
                        labels = lastEventData.data.issue.labels;
                        return [3 /*break*/, 4];
                    case 3:
                        tools.exit.failure("No labeled event was created by this action");
                        _a.label = 4;
                    case 4: return [2 /*return*/, labels];
                }
            });
        });
    }
    /*
    * Ensure PR has only one config label
    */
    function ValidatePRLabel(pr_No, labelAdded, outputLabels, actionStartTime) {
        return __awaiter(this, void 0, void 0, function () {
            var pr_LabelsData, configLabels, labelMatchCount, pr_LabelNames, labelIterator, _i, labelIterator_1, label, name_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, GetPRData(pr_No)];
                    case 1:
                        pr_LabelsData = (_a.sent()).labels;
                        configLabels = outputLabels.split(',').map(function (i) { return i.trim(); });
                        labelMatchCount = 0;
                        pr_LabelNames = [];
                        labelIterator = [];
                        if (!(pr_LabelsData.length > 0)) return [3 /*break*/, 2];
                        tools.log("Pull request has labels");
                        labelIterator = pr_LabelsData;
                        return [3 /*break*/, 4];
                    case 2:
                        tools.log("No labels retrieved on pull request. Attempt to retrieve labeled event data created by this action.");
                        return [4 /*yield*/, GetLabelsFromEvent(pr_No, actionStartTime)];
                    case 3:
                        /* PR data when labels are manually removed such that no labels exist, this action will add the label
                        * but fail to retrieve labels from GetPRData(). This is a known limitation cref:
                        * https://github.community/t/previous-job-runs-should-be-overridden-by-subsequent-runs/17522
                        * workaround: Find the labeled event that was created by this action and retrieve the labels from
                        * event data.
                        */
                        labelIterator = _a.sent();
                        if (labelIterator.length == 0) {
                            tools.exit.failure("No labels found on labeled event");
                        }
                        _a.label = 4;
                    case 4:
                        for (_i = 0, labelIterator_1 = labelIterator; _i < labelIterator_1.length; _i++) {
                            label = labelIterator_1[_i];
                            name_1 = typeof (label) === "string" ? label : label.name;
                            if (!name_1) {
                                continue;
                            }
                            pr_LabelNames.push(name_1);
                            tools.log("PR Label: " + name_1);
                            //Match PR labels with the config labels
                            if (Arr_Match(configLabels, name_1)) {
                                labelMatchCount++;
                            }
                        }
                        if (labelMatchCount != 1) {
                            tools.exit.failure("Exactly one config label expected.\n\t\t\t\n Expected: " + labelAdded.join(',') + "\n Actual: " + pr_LabelNames.join(','));
                            return [2 /*return*/];
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    /* Remove labels from labelsToAdd if they exist on pull request
    *  Return: labelsToAdd
    */
    function LabelExistOnPullRequest(pr_No, labelsToAdd, pr_Labels) {
        return __awaiter(this, void 0, void 0, function () {
            var checkedLabels, _i, pr_Labels_1, label, name_2;
            return __generator(this, function (_a) {
                checkedLabels = labelsToAdd.slice();
                if (pr_Labels.length > 0) {
                    tools.log("This PR has labels, checking...");
                    for (_i = 0, pr_Labels_1 = pr_Labels; _i < pr_Labels_1.length; _i++) {
                        label = pr_Labels_1[_i];
                        name_2 = typeof (label) === "string" ? label : label.name;
                        if (!name_2) {
                            continue;
                        }
                        if (Arr_Match(labelsToAdd, name_2)) {
                            tools.log("Label " + name_2 + " already added to PR");
                            RemoveFromArray(checkedLabels, name_2);
                        }
                    }
                }
                return [2 /*return*/, checkedLabels];
            });
        });
    }
    /* Add labels to pull request.
    */
    function AddLabel(prNumber, labelsToAdd) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tools.log("Label to add to PR: " + labelsToAdd);
                        return [4 /*yield*/, tools.github.issues.addLabels({
                                owner: tools.context.repo.owner,
                                repo: tools.context.repo.repo,
                                issue_number: prNumber,
                                labels: labelsToAdd
                            })];
                    case 1:
                        _a.sent();
                        tools.log("Labels added");
                        return [2 /*return*/];
                }
            });
        });
    }
    /* Get the PR Title from PR number
    * Return pull request data property
    */
    function GetPRData(pr_No) {
        return __awaiter(this, void 0, void 0, function () {
            var pullRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tools.log("Get pull request data");
                        return [4 /*yield*/, tools.github.issues.get({
                                owner: tools.context.repo.owner,
                                repo: tools.context.repo.repo,
                                issue_number: pr_No
                            })];
                    case 1:
                        pullRequest = _a.sent();
                        return [2 /*return*/, pullRequest.data];
                }
            });
        });
    }
    /* Request content from github repo from the path
    *  containing yml config file
    *  Return the octokit response
    */
    function GetConfigContent(path) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tools.github.repos.getContent({
                            owner: tools.context.repo.owner,
                            repo: tools.context.repo.repo,
                            path: path,
                            ref: tools.context.sha
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    }
    //#endregion
    //#region Data manipulation
    /* Get the labels and their matching criteria from a file
    *  or function.
    *  Return Labels and matching criteria as LabelAndCriteria[]
    */
    function GetLabels(configPath, useDefaultLabels) {
        return __awaiter(this, void 0, void 0, function () {
            var labels, configContent, encodedFileContent, yamlFileContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        labels = [];
                        if (!useDefaultLabels) return [3 /*break*/, 1];
                        tools.log("Get label defaults");
                        labels = labels_1.DefineLabelMatches();
                        return [3 /*break*/, 3];
                    case 1:
                        tools.log("Get label config file: " + configPath);
                        return [4 /*yield*/, GetConfigContent(configPath)];
                    case 2:
                        configContent = _a.sent();
                        encodedFileContent = Buffer.from(configContent.data.content, configContent.data.encoding);
                        yamlFileContent = yaml.load(encodedFileContent);
                        labels = GetLabelsFromFile(yamlFileContent);
                        _a.label = 3;
                    case 3: return [2 /*return*/, labels];
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
        tools.log("Matching label criteria with PR title: " + pr_Title);
        for (var _i = 0, labels_2 = labels; _i < labels_2.length; _i++) {
            var labelData = labels_2[_i];
            for (var _a = 0, _b = labelData.criteria; _a < _b.length; _a++) {
                var criterion = _b[_a];
                if (Str_Match(pr_Title, criterion)) {
                    tools.log("Matched... Add Label: [" + labelData.name + "] to pull request");
                    matchedLabels.push(labelData.name);
                    return matchedLabels;
                }
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
    /* Given string strBase does it (default) start with || matches strMatch
    *  returns: True|False
    */
    function Str_Match(strBase, strMatch, exactMatch) {
        if (exactMatch === void 0) { exactMatch = false; }
        if ((!exactMatch && strBase.toLowerCase().startsWith(strMatch.toLowerCase())) ||
            (exactMatch && strBase.toLowerCase() === strMatch.toLowerCase())) {
            return true;
        }
        else {
            return false;
        }
    }
    /* Given array arrBase for each item, does it starts with || matches (default) strMatch
    *  returns: True|False
    */
    function Arr_Match(arrBase, strMatch, exactMatch) {
        if (exactMatch === void 0) { exactMatch = true; }
        for (var _i = 0, arrBase_1 = arrBase; _i < arrBase_1.length; _i++) {
            var item = arrBase_1[_i];
            if (Str_Match(item, strMatch, exactMatch)) {
                return true;
            }
        }
        return false;
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
                tools.log("Unknown value type for label " + tag + ". Expecting string or array)");
            }
        }
        return labels;
    }
    var configPath, PRLabelCheck, pr_No, useDefaultLabels, actionStartTime, labels, outputLabels, pr_Data, pr_Title, pr_Labels, labelsToAdd, addLabelToPR;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                configPath = tools.inputs.config;
                PRLabelCheck = !!tools.inputs.pr_label_check;
                pr_No = (_a = tools.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number;
                useDefaultLabels = configPath === "N/A";
                actionStartTime = Math.floor(Date.now() / 1000);
                if (!configPath) {
                    tools.exit.failure("Config parameter is undefined");
                    return [2 /*return*/];
                }
                if (!pr_No) {
                    tools.exit.failure("Did not provide pr number");
                    return [2 /*return*/];
                }
                tools.log.note("PR number is: " + pr_No);
                return [4 /*yield*/, GetLabels(configPath, useDefaultLabels)];
            case 1:
                labels = _b.sent();
                outputLabels = LabelsToOutput(labels);
                tools.log.note("Config labels: " + outputLabels);
                return [4 /*yield*/, GetPRData(pr_No)];
            case 2:
                pr_Data = (_b.sent());
                pr_Title = pr_Data.title;
                pr_Labels = pr_Data.labels;
                labelsToAdd = MatchLabelsWithTitle(pr_Title, labels);
                tools.outputs.Labels = outputLabels;
                if (!(labelsToAdd.length > 0)) return [3 /*break*/, 7];
                return [4 /*yield*/, LabelExistOnPullRequest(pr_No, labelsToAdd, pr_Labels)];
            case 3:
                addLabelToPR = _b.sent();
                if (!(addLabelToPR.length > 0)) return [3 /*break*/, 5];
                return [4 /*yield*/, AddLabel(pr_No, addLabelToPR)];
            case 4:
                _b.sent();
                return [3 /*break*/, 6];
            case 5:
                //Label already exists on PR
                tools.log("No new labels added to PR");
                _b.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                // no label criteria matched with PR Title
                tools.log("No labels to add to PR");
                _b.label = 8;
            case 8:
                if (!PRLabelCheck) return [3 /*break*/, 10];
                tools.log("Checking PR to ensure only one config label has been added");
                return [4 /*yield*/, ValidatePRLabel(pr_No, labelsToAdd, outputLabels, actionStartTime)];
            case 9:
                _b.sent();
                _b.label = 10;
            case 10:
                tools.exit.success("Action complete");
                return [2 /*return*/];
        }
    });
}); });
