import * as vscode from 'vscode';

import { LineInfo, iterateLines, iterateLinesWithComment } from "./iterateLines";

export enum IterateType {
	withComment,
	withoutComment,
}

type IterateWithCommentCb = ((lineInfo: LineInfo) => void);
type IterateWithoutCommentCb = ((text: string, lineNum: number,
	lineStart: number, lineEnd: number,
	firstLineNotComment: number) => void);

type IsEqual<T, U> =
	(<T1>() => T1 extends T ? 1 : 2) extends
	(<T2>() => T2 extends U ? 1 : 2)
	? true
	: false;

export class IterateHandler {
	private lineCallBackWithComment: IterateWithCommentCb[] = [];
	private lineCallBackWithoutComment: IterateWithoutCommentCb[] = [];

	public hookCallbackWithComment(cb: IterateWithCommentCb) {
		this.lineCallBackWithComment.push(cb);
	}
	public hookCallbackWithoutComment(cb: IterateWithoutCommentCb) {
		this.lineCallBackWithoutComment.push(cb);
	}

	public iterateLineWithComment(document: vscode.TextDocument) {
		iterateLinesWithComment(document, (info: LineInfo) => {
			for (let cb of this.lineCallBackWithComment) {
				cb(info);
			}
		});
	}
	public iterateLineWithoutComment(document: vscode.TextDocument) {
		iterateLines(document, (text: string, lineNum: number,
			lineStart: number, lineEnd: number,
			firstLineNotComment: number) => {
			for (let cb of this.lineCallBackWithoutComment) {
				cb(text, lineNum, lineStart, lineEnd, firstLineNotComment);
			}
		});
	}
}

export const iterateHandler = new IterateHandler();