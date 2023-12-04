import * as vscode from "vscode";
import { CacheInterface } from "./cacheInterface";
import { iterateLinesWithComment, LineInfo } from "./iterateLines";

// text, lineStart, linePrefix, curPos(position - start), text lower
export interface ParseCommentResult {
	line: string,
	linePrefix: string
	lineRaw: string
	lineStart: number
	curPos: number
	langPrefixLength: number
};

class CommentCache {
	comment: boolean[] = [];
	result: (ParseCommentResult | undefined)[] = [];
	lineInfo: LineInfo[] = [];
}

class LineCommentCache implements CacheInterface<CommentCache> {
	lineCommentCache = new Map<vscode.Uri, CommentCache>();

	parseDocument(document: vscode.TextDocument) {
		this.removeDocumentCache(document);
		this.lineCommentCache.set(document.uri, new CommentCache());

		const curCache = this.lineCommentCache.get(document.uri)!;

		iterateLinesWithComment(document, (lineInfo: LineInfo) => {
			let parseResult: ParseCommentResult | undefined = undefined;

			if (!lineInfo.lineIsComment) {
				parseResult = {
					line: lineInfo.textNoCommentAndLangPrefix,
					linePrefix: "",
					lineRaw: lineInfo.textNoComment,
					lineStart: lineInfo.lineStart + lineInfo.langPrefixLength,
					curPos: -1,
					langPrefixLength: lineInfo.langPrefixLength
				};
			}

			curCache.comment.push(lineInfo.lineIsComment);
			curCache.result.push(parseResult);
			curCache.lineInfo.push(lineInfo);
		});
	}

	removeDocumentCache(document: vscode.TextDocument) {
		this.lineCommentCache.delete(document.uri);
	}
	updateDocumentCache(document: vscode.TextDocument,
		change: readonly vscode.TextDocumentContentChangeEvent[]) {
		this.removeDocumentCache(document);
	}
	getDocumentCache(document: vscode.TextDocument) {
		let curCache = this.lineCommentCache.get(document.uri);

		if (curCache === undefined) {
			this.parseDocument(document);
		}

		curCache = this.lineCommentCache.get(document.uri)!;

		return curCache;
	}

	// iterate document with cache
	iterateDocumentCacheWithComment(document: vscode.TextDocument, cb: (lineInfo: LineInfo) => void) {
		let curCache = this.getDocumentCache(document);
		for (let lineNumber = 0; lineNumber < curCache.comment.length; lineNumber++) {
			cb(curCache.lineInfo[lineNumber]);
		}
	}

	// iterate document with cache
	iterateDocumentCacheWithoutComment(document: vscode.TextDocument, cb: (lineInfo: LineInfo) => void) {
		let curCache = this.getDocumentCache(document);
		for (let lineNumber = 0; lineNumber < curCache.comment.length; lineNumber++) {
			// if (curCache.comment[lineNumber]) { continue; }
			const lineInfo = curCache.lineInfo[lineNumber];
			if (lineInfo.lineIsComment && !lineInfo.lineNotCurLanguage) { continue; }

			cb(curCache.lineInfo[lineNumber]);
		}
	}
}

export const lineCommentCache = new LineCommentCache();

export function currentLineNotComment(document: vscode.TextDocument, position: vscode.Position): ParseCommentResult | undefined {
	let curCache = lineCommentCache.getDocumentCache(document);

	const curLine = position.line;

	const bComment = curCache.comment[curLine];
	const parseResult = curCache.result[curLine];

	if (bComment) {
		return parseResult;
	}

	let { line, lineStart, linePrefix, curPos, lineRaw } = parseResult!;

	parseResult!.curPos = position.character - parseResult!.lineStart;
	parseResult!.linePrefix = parseResult!.line.substring(0, curPos).trim();

	return parseResult!;
}
