import * as vscode from 'vscode';
import { currentLocalCode } from '../functions/file';
import { LineType, currentLineType } from './dialogue';
import { InlayHintType } from './dict';
import { iterateScripts } from './iterateScripts';
import { getLangRegex, removeLangPrefix } from './regExp';

export interface LineInfo {
	emptyLine: boolean,

	lineType: LineType,
	lineIsComment: boolean,
	lineNotCurLanguage: boolean,

	originText: string
	textNoComment: string,
	textNoCommentAndLangPrefix: string,
	langPrefixLength: number

	lineNum: number,

	lineStart: number,
	lineEnd: number,

	firstLineNotComment: number | undefined
	inComment: boolean
}

export function iterateLinesWithComment(document: vscode.TextDocument,
	lineCallBack: (lineInfo: LineInfo) => void) {
	let inComment: boolean = false;

	let beginRegex = /^#Begin/gi;
	let endRegex = /^#End/gi;
	let labelRegex = /^;.*/gi;

	let commentRegex = /(\/\/.*)|(\(.*)|(\/\*(?!\*\/)[^\*\/]*)|((?!\/\*)[^\/\*]*\*\/)/gi;

	// line starts with // ( /*
	// remove back
	let commentRegexRepBack = /(\/\/.*)|(\(.*)|(\/\*(?!\*\/)[^\*\/]*)/gi;
	// line starts with ...*/
	// remove beginning
	let commentRegexRepFront = /((?!\/\*)[^\/\*]*\*\/)/gi;
	// block //
	let commentRegexEntire = /(\/\/.*)|(\(.*)|(\/\*(?!\*\/)[^\*\/]*)\*\//gi;

	let firstLineNotComment: number | undefined = undefined;

	const langReg = currentLocalCode !== undefined
		? getLangRegex(currentLocalCode)
		: undefined;

	for (let i = 0; i < document.lineCount; ++i) {
		const line = document.lineAt(i);

		if (line.isEmptyOrWhitespace) {
			lineCallBack(
				{
					emptyLine: true,

					lineType: LineType.invalid,
					lineIsComment: false,
					lineNotCurLanguage: false,

					originText: line.text,
					textNoComment: '',
					textNoCommentAndLangPrefix: '',
					langPrefixLength: 0,

					lineNum: i,

					lineStart: 0,
					lineEnd: line.text.length,

					firstLineNotComment: firstLineNotComment,
					inComment: inComment
				}
			);

			continue;
		}

		const text = line.text.replace(commentRegexEntire, "").trim();

		let textRemoveBack = text.replace(commentRegexRepBack, "").trim();
		let textRemoveFront = text;

		let textNoComment = textRemoveBack;

		// TODO ABC /* */ ACB
		if (inComment
			&& text.match(commentRegexRepFront)) {
			inComment = false;
			textRemoveFront = text.replace(commentRegexRepFront, "").trim();
			textNoComment = textRemoveBack.replace(commentRegexRepFront, "").trim();
		}

		if (!inComment
			&& textNoComment.length > 0) {
			if (firstLineNotComment === undefined) {
				firstLineNotComment = i;
			}
		}

		const lineStart: number = line.firstNonWhitespaceCharacterIndex
			+ text.length - textRemoveFront.length;
		const lineEnd: number = lineStart + textNoComment.length;

		const bNotCurrentLanguage = langReg !== undefined
			? textNoComment.matchEntire(langReg)
			: false;
		const textNoCommentAndLangPrefix = removeLangPrefix(textNoComment);

		lineCallBack(
			{
				emptyLine: false,

				lineType: currentLineType(textNoCommentAndLangPrefix),
				lineIsComment: inComment || textNoComment.empty() || bNotCurrentLanguage,
				lineNotCurLanguage: bNotCurrentLanguage,

				originText: line.text,
				textNoComment: textNoComment,
				textNoCommentAndLangPrefix: textNoCommentAndLangPrefix,
				langPrefixLength: textNoComment.length - textNoCommentAndLangPrefix.length,

				lineNum: i,

				lineStart: lineStart,
				lineEnd: lineEnd,

				firstLineNotComment: firstLineNotComment,
				inComment: inComment
			}
		);

		if (!inComment
			&& !text.match(/\*\//gi)
			&& text.match(/\/\*/gi)) {
			inComment = true;;
		}

	}
}

// iterateLines(document, (text, lineNumber
//     , lineStart, lineEnd
//     , firstLineNotComment) => {
//     });

export function iterateLines(document: vscode.TextDocument,
	callBack: (text: string, lineNum: number,
		lineStart: number, lineEnd: number,
		firstLineNotComment: number) => void) {
	iterateLinesWithComment(document, (info: LineInfo) => {
		let { lineIsComment,

			originText,
			textNoComment,
			textNoCommentAndLangPrefix,

			lineNum,

			lineStart,
			lineEnd,

			firstLineNotComment } = info;

		if (!lineIsComment) {
			callBack(textNoCommentAndLangPrefix, lineNum,
				lineStart, lineEnd,
				firstLineNotComment!);
		}
	});
}

export async function iterateAllLines(callBack: (text: string, lineNum: number,
	lineStart: number, lineEnd: number,
	firstLineNotComment: number) => void) {
	await iterateScripts((script: string, document: vscode.TextDocument) => { },
		(initScript: string,
			script: string,
			line: string, lineNumber: number,
			lineStart: number, lineEnd: number,
			firstLineNotComment: number) => {
			callBack(line, lineNumber,
				lineStart, lineEnd,
				firstLineNotComment);
		},
		(initScript: string,
			script: string, lineNumber: number, line: string,
			currentType: InlayHintType, currentParam: string) => { });
};
