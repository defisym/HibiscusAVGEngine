import * as vscode from 'vscode';

import { lineCommentCache } from '../lib/comment';
import { LineType } from '../lib/dialogue';
import { commandInfoList, inlayHintMap, InlayHintType } from '../lib/dict';
import { getAllParams, getCommandParamFileType } from '../lib/utilities';

export const inlayHint = vscode.languages.registerInlayHintsProvider('AvgScript',
	{
		provideInlayHints(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken) {
			let hints: vscode.InlayHint[] = [];

			let curCache = lineCommentCache.getDocumentCache(document);

			for (let lineNumber = range.start.line; lineNumber <= range.end.line; lineNumber++) {
				const lineInfo = curCache.lineInfo[lineNumber];
				if (lineInfo.lineIsComment && !lineInfo.lineNotCurLanguage) { continue; }

				const line = lineInfo.textNoCommentAndLangPrefix;
				const lineStart = lineInfo.lineStart + lineInfo.langPrefixLength;

				if (lineInfo.lineType !== LineType.command) { continue; }

				const params = getAllParams(line);
				const command = params[0].substring(1);
				const paramNum = params.length - 1;
				const paramDefinition = commandInfoList.getValue(command);;

				let contentStart: number = lineStart + command.length + 1;

				if (paramDefinition === undefined) {
					continue;
				}

				const paramInlayHintType = paramDefinition.inlayHintType;

				if (paramInlayHintType === undefined) {
					continue;
				}

				let curLinePrefix = params[0];

				for (let j = 1; j < params.length; j++) {
					let curParam = params[j];
					let currentInlayHintType: number = paramInlayHintType[j - 1];

					curLinePrefix = curLinePrefix + ":" + curParam;
					const commandType = getCommandParamFileType(curLinePrefix);

					if (currentInlayHintType === InlayHintType.ColorHex) {
						if (j !== params.length - 1) {
							currentInlayHintType = InlayHintType.ColorRGB_R;
						}
					}

					const currentInlayHint = inlayHintMap.get(currentInlayHintType);

					contentStart++;

					let extraInlayHintInfo = undefined;

					if (paramDefinition.inlayHintAddition !== undefined) {
						const curAddition = paramDefinition.inlayHintAddition[j - 1];

						if (curAddition !== undefined) {
							extraInlayHintInfo = getExtraInlayHintInfo(curAddition, curParam);
						}
					}

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

			return hints;
		}
	});

export const extraInlayHintInfoInvalid = 'Invalid';

export function getExtraInlayHintInfo(additionHint: Map<string, string>, param: string) {
	const ret = additionHint.getValue(param);

	return ret === undefined
		? extraInlayHintInfoInvalid
		: ret;
}