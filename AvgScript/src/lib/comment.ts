import * as vscode from "vscode";
import { CacheInterface } from "./cacheInterface";
import { iterateLinesWithComment, LineInfo } from "./iterateLines";

// text, lineStart, linePrefix, curPos(position - start), text lower
export type ParseCommentResult = [undefined, undefined, undefined, undefined, undefined]
	| [string, number, string, number, string];

class CommentCache {
	comment: boolean[] = [];
	result: ParseCommentResult[] = [];
	lineInfo: LineInfo[] = [];
}

class LineCommentCache implements CacheInterface<CommentCache> {
	lineCommentCache = new Map<vscode.Uri, CommentCache>();

	parseDocument(document: vscode.TextDocument) {
		this.removeDocumentCache(document);
		this.lineCommentCache.set(document.uri, new CommentCache());

		const curCache = this.lineCommentCache.get(document.uri)!;

		iterateLinesWithComment(document, (lineInfo: LineInfo) => {
			let parseResult: ParseCommentResult = [undefined, undefined, undefined, undefined, undefined];

			const result = lineInfo.textNoCommentAndLangPrefix;

			if (!lineInfo.lineIsComment) {
				parseResult = [result.toLowerCase(),
				lineInfo.lineStart + lineInfo.langPrefixLength,
					"",
				-1,
					result];
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
			if (curCache.comment[lineNumber]) { continue; }

			cb(curCache.lineInfo[lineNumber]);
		}
	}
}

export const lineCommentCache = new LineCommentCache();

export function currentLineNotComment(document: vscode.TextDocument, position: vscode.Position): ParseCommentResult {
	let curCache = lineCommentCache.getDocumentCache(document);

	const curLine = position.line;

	const bComment = curCache.comment[curLine];
	const parseResult = curCache.result[curLine];

	if (bComment) {
		return parseResult;
	}

	let curPos = position.character - parseResult[1]!;
	let curLinePrefix: string = parseResult[0]!.substring(0, curPos).trim();

	return [parseResult[0]!, parseResult[1]!, curLinePrefix, curPos, parseResult[4]!];
}
