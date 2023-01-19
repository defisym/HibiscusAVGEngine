import * as vscode from 'vscode';

import { commandInfoList, InlayHintType } from '../lib/dict';
import { iterateLines } from "../lib/iterateLines";
import { regexRep } from '../lib/regExp';
import { currentLineNotComment, getAllParams } from "../lib/utilities";

export let labelCompletions: vscode.CompletionItem[] = [];
export let labelJumpMap: Map<string, number> = new Map();

export function getLabelPos(input: string) {
    for (let i in labelCompletions) {
        if (i === "empty") {
            continue;
        }

        let label = labelCompletions[i].label;
        if (typeof label === "string") {
            if (label.iCmp(input)) {
                return i;
            }
        }
        else {
            if (label.label.iCmp(input)) {
                return i;
            }
        }
    }

    return -1;
}

export function getLabelComment(input: string) {
    for (let labelCompletion of labelCompletions) {
        let label = labelCompletion.label;
        if (typeof label === "string") {
            if (label.iCmp(input)) {
                return label;
            }
        }
        else {
            if (label.label.iCmp(input)) {
                return label.label + "\t" + label.description;
            }
        }
    }

    return "标签不存在";
}

export function getLabelCompletion(document: vscode.TextDocument) {
    labelCompletions = [];
    labelJumpMap.clear();

    iterateLines(document, (text, lineNumber
        , lineStart, lineEnd
        , firstLineNotComment) => {
        if (text.match(/(;.*)/gi)) {
            let label = text.substring(text.indexOf(";") + 1);
            let item: vscode.CompletionItem = new vscode.CompletionItem({
                label: label
                // , detail: fileNameSuffix
                , description: "at line " + lineNumber
            });

            item.kind = vscode.CompletionItemKind.Reference;

            item.insertText = label;

            labelCompletions.push(item);
            labelJumpMap.set(label, lineNumber);
        }
    });
}

export function getLabelJumpMap(document: vscode.TextDocument) {
    let labelJumpMap: Map<string, number> = new Map();

    iterateLines(document, (text, lineNumber
        , lineStart, lineEnd
        , firstLineNotComment) => {
        if (text.match(/(;.*)/gi)) {
            let label = text.substring(text.indexOf(";") + 1);
            labelJumpMap.set(label, lineNumber);
        }
    });

    return labelJumpMap;
}

export const labelDefinition = vscode.languages.registerDefinitionProvider('AvgScript',
    {
        provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
            let definitions: vscode.Location[] = [];

            let [line, lineStart, curLinePrefix, curPos] = currentLineNotComment(document, position);

            if (line === undefined) {
                return undefined;
            }

            const params = getAllParams(line);
            const paramNum = params.length - 1;

            if (line.startsWith("#")
                || line.startsWith("@")) {
                const command = params[0].substring(1);
                const paramDefinition = commandInfoList.getValue(command);

                if (paramDefinition === undefined) {
                    return;
                }

                const paramFormat = paramDefinition.inlayHintType;

                if (paramFormat === undefined) {
                    return;
                }

                let contentStart: number = lineStart! + command.length + 1;

                for (let j = 1; j < params.length; j++) {
                    let curParam = params[j];
                    let currentType = paramFormat[j - 1];

                    contentStart++;

                    if (curParam.match(regexRep)) {
                        continue;
                    }

                    if (currentType === InlayHintType.Label) {
                        let curLabel = curParam;

                        labelJumpMap.forEach((line, label) => {
                            if (curLabel.iCmp(label)) {
                                let link = new vscode.Location(document.uri
                                    , new vscode.Position(line, 0));

                                definitions.push(link);
                            }
                        });
                    }

                    contentStart += curParam.length;
                }
            }

            // if (getType(line) !== FileType.label) {
            // 	return undefined;
            // }

            // let curLabel = getNthParam(line, 1);

            // labelJumpMap.forEach((line, label) => {
            // 	if (curLabel === label) {
            // 		let link = new vscode.Location(document.uri
            // 			, new vscode.Position(line, 0));

            // 		definitions.push(link);
            // 	}
            // });

            return definitions;
        }
    });

export const labelReference = vscode.languages.registerReferenceProvider(
    'AvgScript', {
    provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken) {
        let references: vscode.Location[] = [];

        let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

        if (line === undefined) {
            return undefined;
        }

        if (line[0] !== ';') {
            return undefined;
        }

        let label = line.substring(line.indexOf(";") + 1);

        iterateLines(document, (text, lineNumber
            , lineStart, lineEnd
            , firstLineNotComment) => {
            const params = getAllParams(text);
            const paramNum = params.length - 1;

            if (text.startsWith("#")
                || text.startsWith("@")) {
                const command = params[0].substring(1);
                const paramDefinition = commandInfoList.getValue(command);

                if (paramDefinition === undefined) {
                    return;
                }

                const paramFormat = paramDefinition.inlayHintType;

                if (paramFormat === undefined) {
                    return;
                }

                let contentStart: number = lineStart + command.length + 1;

                for (let j = 1; j < params.length; j++) {
                    let curParam = params[j];
                    let currentType = paramFormat[j - 1];

                    contentStart++;

                    if (curParam.match(regexRep)) {
                        continue;
                    }

                    if (currentType === InlayHintType.Label) {
                        if (curParam.iCmp(label)) {
                            let link = new vscode.Location(document.uri
                                , new vscode.Position(lineNumber, 0));

                            references.push(link);
                        }
                    }

                    contentStart += curParam.length;
                }
            }


            // if (getType(text) === FileType.label) {
            // 	let curLabel = getNthParam(text, 1);

            // 	if (curLabel === label) {
            // 		let link = new vscode.Location(document.uri
            // 			, new vscode.Position(lineNumber, 0));

            // 		references.push(link);
            // 	}
            // }
        });

        return references;
    }
});