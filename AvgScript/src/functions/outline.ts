import * as vscode from 'vscode';
import { LineType } from '../lib/dialogue';

import { lineCommentCache } from '../lib/comment';
import { beginRegex, endRegex } from '../lib/regExp';
import { parseCommand } from '../lib/utilities';

export const outline = vscode.languages.registerDocumentSymbolProvider('AvgScript',
	{
		provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken) {
			let symbols: vscode.SymbolInformation[] = [];

			let prevSecName: string[] = [''];
			let prevSecRangeStart: number[] = [];

			let inComment: boolean = false;

			const labelRegex = /^;.*/gi;

			lineCommentCache.iterateDocumentCacheWithoutComment(document, (lineInfo) => {
				let text = lineInfo.textNoCommentAndLangPrefix;
				let lineNumber = lineInfo.lineNum;
				let lineStart = lineInfo.lineStart;
				let lineEnd = lineInfo.lineEnd;

				let item: vscode.SymbolInformation | undefined = undefined;
				let match: RegExpMatchArray | null;

				do {
					if ((match = text.match(beginRegex)) !== null) {
						let beginName = text.substring("#Begin".length + 1).trim();

						prevSecName.push(beginName);
						prevSecRangeStart.push(lineNumber);

						break;
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

						break;
					}

					if (lineInfo.lineType === LineType.label) {
						let labelName = text.substring(1);

						item = new vscode.SymbolInformation("Label: " + labelName
							, vscode.SymbolKind.String
							, prevSecName[prevSecName.length - 1]
							, new vscode.Location(document.uri, new vscode.Position(lineNumber, 0)));

						break;
					}

					const { params, commandWithPrefix, command, paramInfo } = parseCommand(text);

					if (paramInfo === undefined) {
						return;
					}

					if (paramInfo.outlineKeyword) {
						let keyWord = commandWithPrefix;

						item = new vscode.SymbolInformation("KeyWord: " + /*keyWord*/text
							, vscode.SymbolKind.Function
							, prevSecName[prevSecName.length - 1]
							, new vscode.Location(document.uri, new vscode.Position(lineNumber, 0)));

						break;
					}
				} while (0);

				if (item !== undefined) {
					symbols.push(item);
				}
			});

			return symbols;
		}
	});