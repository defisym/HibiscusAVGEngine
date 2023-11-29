import * as vscode from "vscode";
import { CacheInterface } from "./cacheInterface";
import { iterateLinesWithComment, LineInfo } from "./iterateLines";
import { ParseCommandResult } from './utilities';

interface CommentCache {
	comment: boolean[];
	result: ParseCommandResult[];
}

class LineCommentCache implements CacheInterface<CommentCache> {
	lineCommentCache = new Map<vscode.TextDocument, CommentCache>();

	parseDocument(document: vscode.TextDocument) {
		this.removeDocumentCache(document);
		this.lineCommentCache.set(document, { comment: [], result: [] });

		const curCache = this.lineCommentCache.get(document)!;

		iterateLinesWithComment(document, (lineInfo: LineInfo) => {
			let parseResult: ParseCommandResult = [undefined, undefined, undefined, undefined];

			if (!lineInfo.lineIsComment) {
				parseResult = [lineInfo.textNoComment.toLowerCase(),
				lineInfo.lineStart,
					"",
				-1,
				lineInfo.textNoComment];
			}

			curCache.comment.push(lineInfo.lineIsComment);
			curCache.result.push(parseResult);
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
}

export const lineCommentCache = new LineCommentCache();

export function currentLineNotComment(document: vscode.TextDocument, position: vscode.Position,
	callback: (text: string) => void = (text: string) => { }): ParseCommandResult {
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
