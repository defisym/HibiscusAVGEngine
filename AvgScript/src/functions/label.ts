import * as vscode from 'vscode';

import { commandParamList, inlayHintType } from '../lib/dict';
import { regexRep } from '../lib/regExp';
import { currentLineNotComment, getAllParams, getMapValue, iterateLines } from "../lib/utilities";

export let labelCompletions: vscode.CompletionItem[] = [];
export let labelJumpMap: Map<string, number> = new Map();

export function getLabelPos(input: string) {
    for (let i in labelCompletions) {
        let label = labelCompletions[i].label;
        if (typeof label === "string") {
            if (label.toLowerCase() === input.toLowerCase()) {
                return i;
            }
        }
        else {
            if (label.label.toLowerCase() === input.toLowerCase()) {
                return i;
            }
        }
    }

    return -1;
}

export function getLabelComment(input: string) {
    for (let i in labelCompletions) {
        let label = labelCompletions[i].label;
        if (typeof label === "string") {
            if (label.toLowerCase() === input.toLowerCase()) {
                return label;
            }
        }
        else {
            if (label.label.toLowerCase() === input.toLowerCase()) {
                return label.label + "\t" + label.description;
            }
        }
    }

    return "标签不存在";
}

export function getLabelCompletion(labelCompletions: vscode.CompletionItem[]
    , document: vscode.TextDocument) {
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
                const paramDefinition = getMapValue(command, commandParamList);

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

                    if (currentType === inlayHintType.Label) {
                        let curLabel = curParam;

                        labelJumpMap.forEach((line, label) => {
                            if (curLabel.toLowerCase() === label.toLowerCase()) {
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
                const paramDefinition = getMapValue(command, commandParamList);

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

                    if (currentType === inlayHintType.Label) {
                        if (curParam.toLowerCase() === label.toLowerCase()) {
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