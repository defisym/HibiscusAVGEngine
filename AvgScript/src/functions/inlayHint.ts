import * as vscode from 'vscode';
import { commandParamList, inlayHintType, inlayHintMap } from '../lib/dict';
import { iterateLines, getAllParams, getMapValue, getCommandType } from '../lib/utilities';

export const inlayHint = vscode.languages.registerInlayHintsProvider('AvgScript', {
    provideInlayHints(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken) {
        let hints: vscode.InlayHint[] = [];

        iterateLines(document, (text, lineNumber
            , lineStart, lineEnd
            , firstLineNotComment) => {
            if (lineNumber >= range.start.line
                && lineNumber <= range.end.line) {
                if (text.startsWith("#")
                    || text.startsWith("@")) {
                    const params = getAllParams(text);
                    const command = params[0].substring(1);
                    const paramNum = params.length - 1;
                    const paramDefinition = getMapValue(command, commandParamList);

                    let contentStart: number = lineStart + command.length + 1;

                    if (paramDefinition === undefined) {
                        return;
                    }

                    const paramInlayHintType = paramDefinition.inlayHintType;

                    if (paramInlayHintType === undefined) {
                        return;
                    }

                    let curLinePrefix = params[0];

                    for (let j = 1; j < params.length; j++) {
                        let curParam = params[j];
                        let currentInlayHintType: number = paramInlayHintType[j - 1];

                        curLinePrefix = curLinePrefix + ":" + curParam;
                        const commandType = getCommandType(curLinePrefix);

                        if (currentInlayHintType === inlayHintType.ColorHex) {
                            if (j !== params.length - 1) {
                                currentInlayHintType = inlayHintType.ColorRGB_R;
                            }
                        }

                        const currentInlayHint = inlayHintMap.get(currentInlayHintType);

                        contentStart++;

                        if (currentInlayHint !== undefined) {
                            let hint = new vscode.InlayHint(new vscode.Position(lineNumber, contentStart)
                                , currentInlayHint + ":"
                                , vscode.InlayHintKind.Parameter);

                            hints.push(hint);
                        }

                        contentStart += curParam.length;
                    }
                }
            }
        });

        return hints;
    }
});