import * as vscode from "vscode";
import { CacheInterface } from "./cacheInterface";
import { iterateLinesWithComment, LineInfo } from "./iterateLines";

// text, lineStart, linePrefix, curPos(position - start), text lower
export type ParseCommentResult = undefined[] | [string, number, string, number, string];

class CommentCache {
	comment: boolean[] = [];
	result: ParseCommentResult[] = [];
	lineInfo: LineInfo[] = [];
}

class LineCommentCache implements CacheInterface<CommentCache> {
	lineCommentCache = new Map<vscode.TextDocument, CommentCache>();

	parseDocument(document: vscode.TextDocument) {
		this.removeDocumentCache(document);
		this.lineCommentCache.set(document, new CommentCache());

		const curCache = this.lineCommentCache.get(document)!;

		iterateLinesWithComment(document, (lineInfo: LineInfo) => {
			let parseResult: ParseCommentResult = [undefined, undefined, undefined, undefined];

			if (!lineInfo.lineIsComment) {
				parseResult = [lineInfo.textNoComment.toLowerCase(),
				lineInfo.lineStart,
					"",
				-1,
				lineInfo.textNoComment];
			}

			curCache.comment.push(lineInfo.lineIsComment);
			curCache.result.push(parseResult);
			curCache.lineInfo.push(lineInfo);
		});
	}

	removeDocumentCache(document: vscode.TextDocument) {
		this.lineCommentCache.delete(document);
	}
	updateDocumentCache(document: vscode.TextDocument,
		change: readonly vscode.TextDocumentContentChangeEvent[]) {
		this.removeDocumentCache(document);
	}
	getDocumentCache(document: vscode.TextDocument) {
		let curCache = this.lineCommentCache.get(document);

		if (curCache === undefined) {
			this.parseDocument(document);
		}

		curCache = this.lineCommentCache.get(document)!;

		return curCache;
	}

	// iterate document with cache
	iterateDocumentWithCache(document: vscode.TextDocument, cb: (lineInfo: LineInfo) => void) {
		let curCache = this.getDocumentCache(document);
		for (let lineNumber = 0; lineNumber < curCache.comment.length; lineNumber++) {
			cb(curCache.lineInfo[lineNumber]);
		}
	}

	// iterate document with cache
	iterateDocumentWithoutCache(document: vscode.TextDocument, cb: (lineInfo: LineInfo) => void) {
		let curCache = this.getDocumentCache(document);
		for (let lineNumber = 0; lineNumber < curCache.comment.length; lineNumber++) {
			if (curCache.comment[lineNumber]) { continue; }
			
			cb(curCache.lineInfo[lineNumber]);
		}
	}
}

export const lineCommentCache = new LineCommentCache();

export function currentLineNotComment(document: vscode.TextDocument, position: vscode.Position,
	callback: (text: string) => void = (text: string) => { }): ParseCommentResult {
	let curCache = lineCommentCache.getDocumentCache(document);

	const curLine = position.line;

	const bComment = curCache.comment[curLine];
	const praseResult = curCache.result[curLine];

	if (bComment) {
		return praseResult;
	}

	callback(praseResult[4]!);

	let curPos = position.character - praseResult[1]!;
	let curLinePrefix: string = praseResult[0]!.substring(0, curPos).trim();

	return [praseResult[0]!, praseResult[1]!, curLinePrefix, curPos, praseResult[4]!];
}
