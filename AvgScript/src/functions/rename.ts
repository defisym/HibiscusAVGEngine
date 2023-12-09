import * as vscode from 'vscode';

import { currentLineNotComment, lineCommentCache } from '../lib/comment';
import { LineType } from '../lib/dialogue';
import { getAllParams, getIndexOfDelimiter, getNumberOfParam, getParamAtPosition } from '../lib/utilities';

export const rename = vscode.languages.registerRenameProvider('AvgScript',
	{
		provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken) {
			const edit = new vscode.WorkspaceEdit();

			const parseCommentResult = currentLineNotComment(document, position, true);

			if (parseCommentResult === undefined) {
				return undefined;
			}

			let { line, lineStart, linePrefix, lineType, curPos } = parseCommentResult;

			let word: string;

			let replaceToken = (origin: string) => {
				const suffixPos = origin.lastIndexOf('.');
				let originNoSuffix: string = origin;
				let originHasSuffix = suffixPos !== -1;

				if (originHasSuffix) {
					originNoSuffix = origin.substring(0, suffixPos);
					newName = newName + origin.substring(suffixPos);
				}

				lineCommentCache.iterateDocumentCacheWithoutComment(document, (lineInfo) => {
					let text = lineInfo.textNoCommentAndLangPrefix;
					let lineNumber = lineInfo.lineNum;
					let lineStart = lineInfo.lineStart + lineInfo.langPrefixLength;
					let lineEnd = lineInfo.lineEnd;

					const lineType = lineInfo.lineType;

					if (lineType === LineType.command || lineType === LineType.label) {
						const regex = new RegExp(originNoSuffix, "gi");
						let contentStart: number = 0;

						if (lineType === LineType.label) {
							contentStart = 1;
						} else if (getNumberOfParam(text) !== 0) {
							let delimiterPos = getIndexOfDelimiter(text, 0);

							if (delimiterPos === -1) {
								return;
							}

							contentStart = delimiterPos + 1;
						} else {
							return;
						}

						let params = getAllParams(text.substring(contentStart));
						let startPos = lineStart + contentStart;

						for (let i = 0; i < params.length; i++) {
							let curParam = params[i];

							const curSuffixPos = curParam.lastIndexOf('.');
							let curHasSuffix = curSuffixPos !== -1;

							let match = curParam.match(regex);
							if (match) {
								if (!originHasSuffix
									&& !curHasSuffix
									&& match[0] !== curParam) {
									continue;
								}

								let endPos = startPos
									+ (curHasSuffix
										? curParam.length
										: match[0].length);

								edit.replace(document.uri
									, new vscode.Range(lineNumber
										, startPos
										, lineNumber
										, endPos)
									, newName);
							}

							startPos += curParam.length;
						}
					}
				});

				return edit;
			};

			if (lineType === LineType.command) {
				if (getNumberOfParam(linePrefix!) === 0) {
					return undefined;
				}

				word = getParamAtPosition(line, curPos!)!;

				return replaceToken(word);
			} else if (lineType === LineType.label) {
				word = line.substring(line.indexOf(";") + 1);

				return replaceToken(word);
			}

			return undefined;
		}
	});
