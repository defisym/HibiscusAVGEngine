import * as vscode from 'vscode';
import { iterateLines } from '../lib/utilities';

export const outline = vscode.languages.registerDocumentSymbolProvider('AvgScript'
    , {
        provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken) {
            let symbols: vscode.SymbolInformation[] = [];

            let prevSecName: string[] = [''];
            let prevSecRangeStart: number[] = [];

            let inComment: boolean = false;

            const beginRegex = /^#Begin/gi;
            const endRegex = /^#End/gi;
            const labelRegex = /^;.*/gi;
            const keyWordRegex = /^(((#CreateSwitch|#Call|#CMP|@SetBattleScript).*)|(.*JMP.*)|(#SkipAnchor|#Ret|#StopFF|#StopFastForward))/gi;

            iterateLines(document, (text, lineNumber
                , lineStart, lineEnd
                , firstLineNotComment) => {
                let item: vscode.SymbolInformation | undefined = undefined;
                let match: RegExpMatchArray | null;

                if ((match = text.match(beginRegex)) !== null) {
                    let beginName = text.substring("#Begin".length + 1).trim();

                    prevSecName.push(beginName);
                    prevSecRangeStart.push(lineNumber);
                }

                if ((match = text.match(endRegex)) !== null) {
                    if (prevSecName.length === 1) {
                        return;
                    }

                    let beginName = prevSecName.pop()!;

                    item = new vscode.SymbolInformation("Block: " + beginName
                        , vscode.SymbolKind.Namespace
                        , beginName
                        , new vscode.Location(document.uri
                            , new vscode.Range(
                                new vscode.Position(prevSecRangeStart.pop()!, 0)
                                , new vscode.Position(lineNumber, 0))));

                }

                if ((match = text.match(labelRegex)) !== null) {
                    let labelName = text.substring(text.indexOf(";") + 1);

                    item = new vscode.SymbolInformation("Label: " + labelName
                        , vscode.SymbolKind.String
                        , prevSecName[prevSecName.length - 1]
                        , new vscode.Location(document.uri, new vscode.Position(lineNumber, 0)));
                }

                if ((match = text.match(keyWordRegex)) !== null) {
                    let keyWord = match[0];

                    item = new vscode.SymbolInformation("KeyWord: " + keyWord
                        , vscode.SymbolKind.Function
                        , prevSecName[prevSecName.length - 1]
                        , new vscode.Location(document.uri, new vscode.Position(lineNumber, 0)));
                }

                if (item !== undefined) {
                    symbols.push(item);
                }
            });

            return symbols;
        }
    });