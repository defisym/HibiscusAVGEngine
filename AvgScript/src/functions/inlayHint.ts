import * as vscode from 'vscode';

import { commandInfoList, inlayHintMap, InlayHintType } from '../lib/dict';
import { iterateLines } from "../lib/iterateLines";
import { getAllParams, getCommandType } from '../lib/utilities';
import { easing_getFuncName, easing_getModeName } from '../lib/easing';

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
                    const paramDefinition = commandInfoList.getValue(command);;

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

                        if (currentInlayHintType === InlayHintType.ColorHex) {
                            if (j !== params.length - 1) {
                                currentInlayHintType = InlayHintType.ColorRGB_R;
                            }
                        }

                        const currentInlayHint = inlayHintMap.get(currentInlayHintType);

                        contentStart++;

                        const extraInlayHintInfo = getExtraInlayHintInfo(currentInlayHintType, curParam);

                        if (currentInlayHint !== undefined) {
                            let hint = new vscode.InlayHint(new vscode.Position(lineNumber, contentStart)
                                , currentInlayHint
                                + (extraInlayHintInfo === undefined
                                    ? ''
                                    : '(' + extraInlayHintInfo + ')')
                                + ":"
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

export const extraInlayHintInfoInvalid = 'Invalid';

export function getExtraInlayHintInfo(type: InlayHintType, param: string) {
    switch (type) {
        case InlayHintType.Easing_FuncA:
        case InlayHintType.Easing_FuncB: {
            const type = parseInt(param);

            return easing_getFuncName(type);
        }
        case InlayHintType.Mode: {
            const type = parseInt(param);

            return easing_getModeName(type);
        }

        default:
            return undefined;
    }
}