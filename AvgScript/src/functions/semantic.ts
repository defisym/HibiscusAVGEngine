import * as vscode from 'vscode';
import { lineCommentCache } from '../lib/comment';
import { LineType, currentLineType } from '../lib/dialogue';
import { commandInfoList } from '../lib/dict';
import { LineInfo } from '../lib/iterateLines';
import { regexHexColor, regexNumber } from '../lib/regExp';
import { keyWordDialogue, keyWordEffect, keyWordMedia, keyWordPreobj, keyWordRegion, keyWordSystem, keyWordValues } from '../lib/semanticRegex';
import { getAllParams } from '../lib/utilities';

const tokenLegend = ['comments', 'labels', 'operators', 'params',
	'numbers_dec', 'numbers_hex',
	'keyword', 'keywords_region', 'keywords_system', 'keywords_values', 'keywords_dialogue', 'keywords_media', 'keywords_effect', 'keywords_preobj', 'keywords_undefined',
	'dialogue_name', 'dialogue_dialogue',
	'language_prefix', 'language_region'];
const tokenLegendMap = new Map<string, number>();

tokenLegend.forEach((tokenType, index) => {
	tokenLegendMap.set(tokenType, index);
});

const semanticTokensLegend = new vscode.SemanticTokensLegend(tokenLegend);

function parseLine(lineInfo: LineInfo, document: vscode.TextDocument, builder: vscode.SemanticTokensBuilder) {
	const line = lineInfo.lineNum;

	if (lineInfo.emptyLine) { return; }

	const textLine = document.lineAt(line);
	const lineStart = textLine.firstNonWhitespaceCharacterIndex;
	const lineLength = textLine.text.length;
	const lineEnd = lineLength;

	// line has comment
	if (lineInfo.originText.length !== lineInfo.textNoComment.length) {
		// entire line is comment, continue
		if (lineInfo.lineIsComment) {
			builder.push(line,
				lineStart, lineLength,
				tokenLegendMap.get('comments')!);

			return;
		}

		// only part is comment, 
		if (lineInfo.lineStart !== lineStart) {
			builder.push(line,
				lineStart, lineInfo.lineStart - lineStart,
				tokenLegendMap.get('comments')!);
		}

		if (lineInfo.lineEnd !== lineEnd) {
			builder.push(line,
				lineInfo.lineEnd, lineEnd - lineInfo.lineEnd,
				tokenLegendMap.get('comments')!);
		}

		// if nothing left, continue
		if (lineInfo.textNoComment.empty()) { return; }
	}

	// language prefix
	if (lineInfo.langPrefixLength !== 0) {
		const langLength = 4;
		let langOffset = 0;

		// lang prefix
		let langStart = lineInfo.lineStart;
		builder.push(line,
			langStart + langOffset, langLength,
			tokenLegendMap.get('language_prefix')!);

		// operator [
		langOffset += langLength;
		builder.push(line,
			langStart + langOffset, 1,
			tokenLegendMap.get('operators')!);

		// lang region
		const regionStart = langOffset;
		while (lineInfo.textNoComment.charAt(langOffset) !== ']') {
			langOffset++;
		}

		if (langOffset !== regionStart) {
			builder.push(line,
				langStart + regionStart, langOffset - regionStart,
				tokenLegendMap.get('language_region')!);
		}

		// operator ]
		builder.push(line,
			langStart + langOffset, 1,
			tokenLegendMap.get('operators')!);
	}

	const lineType = currentLineType(lineInfo.textNoCommentAndLangPrefix);
	const noLangPrefixStart = lineInfo.lineStart + lineInfo.langPrefixLength;
	const noLangPrefixLength = lineInfo.textNoCommentAndLangPrefix.length;
	const operators = ['=', '|', ':', '/n', '\\n', '$', '&', '<', '>', '[', ']'];

	let highlightOperator = (start: number, content: string, defaultTokenType: number | undefined = undefined) => {
		const tokenType = tokenLegendMap.get('operators')!;

		for (let lineOffset = 0; lineOffset < content.length; lineOffset++) {
			const curChar = content.charAt(lineOffset);

			const curTokenType = operators.includes(curChar) ? tokenType : defaultTokenType;

			if (curTokenType === undefined) { continue; }

			builder.push(line,
				start + lineOffset, 1,
				curTokenType);
		}
	};

	switch (lineType) {
		case LineType.label: {
			builder.push(line,
				noLangPrefixStart, noLangPrefixLength,
				tokenLegendMap.get('labels')!);

			break;
		}
		case LineType.dialogue: {
			highlightOperator(noLangPrefixStart, lineInfo.textNoCommentAndLangPrefix);

			break;
		}
		case LineType.command: {
			const w = commandInfoList;

			const params = getAllParams(lineInfo.textNoCommentAndLangPrefix);
			const prefix = params[0][0];
			const command = params[0].substring(1);
			const paramNum = params.length - 1;
			const paramDefinition = commandInfoList.getValue(command);

			const commandWithPrefix = params[0];
			const commandWithPrefixLength = commandWithPrefix.length;

			// command
			do {
				if (commandWithPrefix.matchStart(keyWordRegion)) {
					builder.push(line,
						noLangPrefixStart, commandWithPrefixLength,
						tokenLegendMap.get('keywords_region')!);

					break;
				}

				if (commandWithPrefix.matchStart(keyWordSystem)) {
					builder.push(line,
						noLangPrefixStart, commandWithPrefixLength,
						tokenLegendMap.get('keywords_system')!);

					break;
				}

				if (commandWithPrefix.matchStart(keyWordValues)) {
					builder.push(line,
						noLangPrefixStart, commandWithPrefixLength,
						tokenLegendMap.get('keywords_values')!);

					break;
				}

				if (commandWithPrefix.matchStart(keyWordDialogue)) {
					builder.push(line,
						noLangPrefixStart, commandWithPrefixLength,
						tokenLegendMap.get('keywords_dialogue')!);

					break;
				}

				if (commandWithPrefix.matchStart(keyWordMedia)) {
					builder.push(line,
						noLangPrefixStart, commandWithPrefixLength,
						tokenLegendMap.get('keywords_media')!);

					break;
				}

				if (commandWithPrefix.matchStart(keyWordEffect)) {
					builder.push(line,
						noLangPrefixStart, commandWithPrefixLength,
						tokenLegendMap.get('keywords_effect')!);

					break;
				}

				if (commandWithPrefix.matchStart(keyWordPreobj)) {
					builder.push(line,
						noLangPrefixStart, commandWithPrefixLength,
						tokenLegendMap.get('keywords_preobj')!);

					break;
				}

				builder.push(line,
					noLangPrefixStart, commandWithPrefixLength,
					tokenLegendMap.get('keywords_undefined')!);
			} while (false);

			// each param
			let lineOffset = commandWithPrefixLength;

			for (let paramIdx = 1; paramIdx <= paramNum; paramIdx++) {
				// delimiter
				builder.push(line,
					noLangPrefixStart + lineOffset, 1,
					tokenLegendMap.get('operators')!);

				lineOffset++;
				const curParam = params[paramIdx];
				const curParamLength = curParam.length;

				if (curParam.matchEntire(regexNumber)) {
					builder.push(line,
						noLangPrefixStart + lineOffset, curParamLength,
						tokenLegendMap.get('numbers_dec')!);
				}

				if (curParam.matchEntire(regexHexColor)) {
					builder.push(line,
						noLangPrefixStart + lineOffset, curParamLength,
						tokenLegendMap.get('numbers_hex')!);
				}

				highlightOperator(noLangPrefixStart + lineOffset, curParam, tokenLegendMap.get('params')!);

				lineOffset += curParamLength;
			}

			break;
		}
	}

}

class RangeSemanticProvider implements vscode.DocumentRangeSemanticTokensProvider {
	provideDocumentRangeSemanticTokens(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SemanticTokens> {
		const builder = new vscode.SemanticTokensBuilder();
		const curCache = lineCommentCache.getDocumentCache(document);

		for (let line = range.start.line; line < range.end.line; line++) {
			const lineInfo = curCache.lineInfo[line];
			parseLine(lineInfo, document, builder);
		}

		return builder.build();
	}
}
const rangeSemanticProviderClass = new RangeSemanticProvider();

export const rangeSemanticProvider = vscode.languages.registerDocumentRangeSemanticTokensProvider('AvgScript', rangeSemanticProviderClass, semanticTokensLegend);

class SemanticProvider implements vscode.DocumentSemanticTokensProvider {
	provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SemanticTokens> {
		const builder = new vscode.SemanticTokensBuilder();

		lineCommentCache.iterateDocumentCacheWithComment(document, (lineInfo: LineInfo) => {
			parseLine(lineInfo, document, builder);
		});

		return builder.build();
	}
}

const semanticProviderClass = new SemanticProvider();

export const semanticProvider = vscode.languages.registerDocumentSemanticTokensProvider('AvgScript', semanticProviderClass, semanticTokensLegend);