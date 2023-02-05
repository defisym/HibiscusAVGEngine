import * as vscode from 'vscode';
import { currentLineDialogue } from '../lib/dialogue';
import { commandInfoList, commandListInitialized, waitForCommandListInit } from '../lib/dict';
import { iterateLinesWithComment, LineInfo } from '../lib/iterateLines';
import { getAllParams, parseCommand } from '../lib/utilities';
import { confFormatRules_emptyLineAfterDialogue, confFormatRules_emptyLineBeforeComment, confFormatRules_emptyLineCommand, confFormatRules_removeEmptyLines } from './command';

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

        let emptyLineAfterDialogue = vscode.workspace.getConfiguration().get<boolean>(confFormatRules_emptyLineAfterDialogue, true);
        let emptyLineBeforeComment = vscode.workspace.getConfiguration().get<boolean>(confFormatRules_emptyLineBeforeComment, true);
        let emptyLineCommand = vscode.workspace.getConfiguration().get<boolean>(confFormatRules_emptyLineCommand, true);
        let removeEmptyLines = vscode.workspace.getConfiguration().get<boolean>(confFormatRules_removeEmptyLines, true);

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

        let newLine: boolean = false;
        let previousLineInfo: LineInfo | undefined = undefined;
        let previousAddedNewLine: boolean = false;

        let formatPreviousLineValid = () => {
            return previousLineInfo !== undefined;
        };

        let formatPreviousLineNotComment = () => {
            return formatPreviousLineValid() && !previousLineInfo!.lineIsComment;
        };

        let formatPreviousLineDialogue = () => {
            return formatPreviousLineNotComment() && currentLineDialogue(previousLineInfo!.textNoComment);
        };

        iterateLinesWithComment(document
            , (info: LineInfo) => {
                let {
                    emptyLine,

                    lineIsComment,

                    originText,
                    textNoComment,

                    lineNum,

                    lineStart,
                    lineEnd,

                    firstLineNotComment } = info;

                let formatIndent = () => {
                    result.push(new vscode.TextEdit(new vscode.Range(lineNum, 0
                        , lineNum, originText.length)
                        , indentLine(originText.trim(), indentLevel)));
                };

                let formatNewLine = (after: boolean = true) => {
                    result.push(vscode.TextEdit.insert(new vscode.Position(lineNum + (after ? 0 : -1), 0)
                        , '\r\n'));
                    previousAddedNewLine = true;
                };

                if (emptyLine) {
                    if (removeEmptyLines
                        && formatPreviousLineNotComment()
                        && info.emptyLine
                        && previousLineInfo!.emptyLine
                        && !previousAddedNewLine) {
                        previousAddedNewLine = false;
                        result.push(vscode.TextEdit.delete(new vscode.Range(lineNum, 0
                            , lineNum + 1, 0)));
                    }
                } else {
                    if (!lineIsComment) {
                        if (currentLineDialogue(textNoComment)) {
                            formatIndent();
                        }
                        else {
                            const newLineForDia = emptyLineAfterDialogue && formatPreviousLineDialogue();

                            if (newLineForDia) {
                                formatNewLine();
                            }

                            const { params, command, paramInfo } = parseCommand(textNoComment);

                            if (paramInfo === undefined) {
                                return;
                            }

                            if (paramInfo.indentOut) {
                                indentLevel--;
                            }

                            if (emptyLineCommand) {
                                let newLineAfter: boolean = false;

                                if (!formatPreviousLineDialogue()
                                    && !previousLineInfo!.emptyLine) {
                                    const { params, command, paramInfo } = parseCommand(previousLineInfo!.textNoComment);

                                    if (paramInfo !== undefined) {
                                        if (paramInfo.emptyLineAfter) {
                                            newLineAfter = true;
                                            formatNewLine(true);
                                        }
                                    }
                                }
                                if (!newLineAfter
                                    && !newLineForDia
                                    && !previousLineInfo!.emptyLine) {
                                    if (paramInfo.emptyLineBefore) {
                                        formatNewLine(true);
                                    }
                                }
                            }

                            formatIndent();

                            if (paramInfo.indentIn) {
                                indentLevel++;
                            }
                        }
                    } else {
                        if (emptyLineBeforeComment
                            && formatPreviousLineNotComment()
                            && !previousLineInfo!.emptyLine) {
                            formatNewLine();
                        }

                        formatIndent();
                    }
                }

                previousLineInfo = info;

            });

        return result;
    }
}

export const formatting = vscode.languages.registerDocumentFormattingEditProvider('AvgScript', new DocumentFormatter());