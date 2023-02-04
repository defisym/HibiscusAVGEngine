import * as vscode from 'vscode';
import { currentLineDialogue } from '../lib/dialogue';
import { commandInfoList, commandListInitialized, waitForCommandListInit } from '../lib/dict';
import { iterateLinesWithComment, LineInfo } from '../lib/iterateLines';
import { getAllParams } from '../lib/utilities';

class DocumentFormatter implements vscode.DocumentFormattingEditProvider {
    /**
    * Provide formatting edits for a whole document.
    *
    * @param document The document in which the command was invoked.
    * @param options Options controlling formatting.
    * @param token A cancellation token.
    * @return A set of text edits or a thenable that resolves to such. The lack of a result can be
    * signaled by returning `undefined`, `null`, or an empty array.
    */
    provideDocumentFormattingEdits(document: vscode.TextDocument
        , options: vscode.FormattingOptions
        , token: vscode.CancellationToken)
        : vscode.ProviderResult<vscode.TextEdit[]> {
        if (!commandListInitialized) {
            vscode.window.showInformationMessage('Waiting for command list update complete');
        }

        let result: vscode.TextEdit[] = [];

        // rules: #Begin +1, #End -1
        let indentLevel = 0;
        let indentLine = (text: string, level: number) => {
            let indentChar = '\t';
            let indentStr = '';

            for (let i = 0; i < level; i++) {
                indentStr += indentChar;
            }

            return indentStr + text;
        };

        iterateLinesWithComment(document, (info: LineInfo) => {
            let { lineIsComment,

                originText,
                textNoComment,

                lineNum,

                lineStart,
                lineEnd,

                firstLineNotComment } = info;

            if (!lineIsComment) {
                if (currentLineDialogue(textNoComment)) {
                    result.push(new vscode.TextEdit(new vscode.Range(lineNum, 0
                        , lineNum, originText.length)
                        , indentLine(originText.trim(), indentLevel)));
                }
                else {
                    const params = getAllParams(textNoComment);
                    const command = params[0].substring(1);

                    let w = commandInfoList;

                    const paramInfo = commandInfoList.getValue(command);

                    if (paramInfo === undefined) {
                        return;
                    }

                    if (paramInfo.indentOut) {
                        indentLevel--;
                    }

                    result.push(new vscode.TextEdit(new vscode.Range(lineNum, 0
                        , lineNum, originText.length)
                        , indentLine(originText.trim(), indentLevel)));

                    if (paramInfo.indentIn) {
                        indentLevel++;
                    }
                }
            }

        });

        return result;
    }
}

export const formatting = vscode.languages.registerDocumentFormattingEditProvider('AvgScript', new DocumentFormatter());