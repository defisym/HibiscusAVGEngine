import * as vscode from 'vscode';
import { lineCommentCache } from '../lib/comment';
import { currentLineDialogue, currentLineLabel } from '../lib/dialogue';
import { commandListInitialized } from '../lib/dict';
import { LineInfo } from '../lib/iterateLines';
import { parseCommand } from '../lib/utilities';
import { confFormatRules_emptyLineAfterDialogue, confFormatRules_emptyLineBeforeComment, confFormatRules_emptyLineCommand, confFormatRules_emptyLineLabel, confFormatRules_formatEmptyLines, confFormatRules_removeEmptyLines } from './command';

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
        let emptyLineLabel = vscode.workspace.getConfiguration().get<boolean>(confFormatRules_emptyLineLabel, true);
        let emptyLineCommand = vscode.workspace.getConfiguration().get<boolean>(confFormatRules_emptyLineCommand, true);
        let removeEmptyLines = vscode.workspace.getConfiguration().get<boolean>(confFormatRules_removeEmptyLines, true);
        let formatEmptyLines = vscode.workspace.getConfiguration().get<boolean>(confFormatRules_formatEmptyLines, true);

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
        let newLineForDia: boolean = false;

        let previousLineInfo: LineInfo | undefined = undefined;
        let previousAddedNewLine: boolean = false;

        let resetFlags = () => {
            newLineForDia = false;
            previousAddedNewLine = false;
        };

        let formatPreviousLineValid = () => {
            return previousLineInfo !== undefined;
        };

        let formatPreviousLineNotComment = () => {
            return formatPreviousLineValid() && !previousLineInfo!.lineIsComment;
        };

        let formatPreviousLineDialogue = () => {
            return formatPreviousLineNotComment() && !previousLineInfo!.emptyLine && currentLineDialogue(previousLineInfo!.textNoComment);
        };

		lineCommentCache.iterateDocumentCacheWithComment(document, (info: LineInfo) => {
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

                let formatRemoveLine = (entireLine: boolean = true) => {
                    const range = entireLine
                        ? new vscode.Range(lineNum, 0
                            , lineNum + 1, 0)
                        : new vscode.Range(lineNum, 0
                            , lineNum, originText.length);

                    result.push(vscode.TextEdit.delete(range));
                };

                let formatEmptyLine = () => {
                    if (emptyLineCommand && formatPreviousLineValid()) {
                        let newLineAfter: boolean = false;

                        if (!formatPreviousLineDialogue()
                            && !previousLineInfo!.emptyLine) {
                            const previousTextNoComment = previousLineInfo!.textNoComment;
                            const { params, commandWithPrefix, command, paramInfo } = parseCommand(previousTextNoComment);

                            if ((paramInfo !== undefined && paramInfo.emptyLineAfter)
                                || (emptyLineLabel && currentLineLabel(previousTextNoComment))) {
                                newLineAfter = true;
                                formatNewLine(true);
                            }
                        }
                        if (!newLineAfter
                            && !newLineForDia
                            && !previousLineInfo!.emptyLine) {
                            const { params, commandWithPrefix, command, paramInfo } = parseCommand(textNoComment);


                            if ((paramInfo && paramInfo.emptyLineBefore)
                                || (emptyLineLabel && currentLineLabel(textNoComment))) {
                                formatNewLine(true);
                            }
                        }
                    }
                };

                if (emptyLine) {
                    if (removeEmptyLines
                        && formatPreviousLineNotComment()
                        && info.emptyLine
                        && previousLineInfo!.emptyLine
                        && !previousAddedNewLine) {
                        formatRemoveLine();
                    } else if (formatEmptyLines && originText.length !== 0) {
                        formatRemoveLine(false);
                    }

                    resetFlags();
                } else {
                    resetFlags();

                    if (!lineIsComment) {
                        if (currentLineDialogue(textNoComment)) {
                            formatEmptyLine();
                            formatIndent();
                        }
                        else {
                            newLineForDia = emptyLineAfterDialogue && formatPreviousLineDialogue();

                            if (newLineForDia) {
                                formatNewLine();
                            }

                            const { params, commandWithPrefix, command, paramInfo } = parseCommand(textNoComment);

                            if (paramInfo && paramInfo.indentOut) {
                                indentLevel--;
                            }

                            formatEmptyLine();
                            formatIndent();

                            if (paramInfo && paramInfo.indentIn) {
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