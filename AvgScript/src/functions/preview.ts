import * as vscode from 'vscode';

import { activeEditor } from '../extension';
import { lineCommentCache } from '../lib/comment';
import { LineType } from '../lib/dialogue';
import { confPreview_AlwaysSendingMessage } from './command';
import { basePath, basePathUpdated, projectConfig } from './file';

export class Previewer {
	private bDebugging = false;

	private bDocUpdated = false;
	private previousTimer = 0;
	private previousCursor: vscode.Position | undefined = undefined;
	private previousLineNumber = 0;
	private previousScript = '';

	private threshold = 1000;
	private previewCommandStrFinish = 'Hibiscus_Preview_Finish';
	private previewCommandStrPrefix = 'Hibiscus_Preview_';

	private getTime() {
		const now = new Date();

		return now.getTime();
	}

	constructor(period: number = 500) {
		setInterval(() => {
			this.updatePreview();
		}, period);
	}
	debugUpdate(bState: boolean) {
		this.bDebugging = bState;
	}

	docUpdated() {
		this.bDocUpdated = true;
		this.previousTimer = this.getTime();
	}

	async updatePreview() {
		let alwaysSending = vscode.workspace.getConfiguration().get<boolean>(confPreview_AlwaysSendingMessage, false);

		if (!this.bDebugging && !alwaysSending) {
			return;
		}

		const preview = projectConfig.Debug.Debug_Preview;

		if (preview !== '1') {
			console.log(this.previewCommandStrPrefix + 'NOT_ENABLE');

			return;
		}

		if (await vscode.env.clipboard.readText() !== this.previewCommandStrFinish) {
			console.log(this.previewCommandStrPrefix + 'NOT_COMPLETE');

			return;
		}

		if (!activeEditor) {
			console.log(this.previewCommandStrPrefix + 'INVALID_EDITOR');

			return;
		}

		const bResult = await activeEditor.document.save();

		if (!bResult) {
			console.log(this.previewCommandStrPrefix + 'INVALID_FILE');

			return;
		}

		const document = activeEditor.document;

		const cursor = activeEditor.selection.active;

		const timePassed = this.getTime() - this.previousTimer;

		if (!document.languageId.iCmp('AvgScript')) {
			console.log(this.previewCommandStrPrefix + 'INVALID_SCRIPT');

			return;
		}

		if (timePassed < this.threshold) {
			console.log(this.previewCommandStrPrefix + 'INVALID_DELAY');

			return;
		}

		if (!this.bDocUpdated && cursor === this.previousCursor) {
			console.log(this.previewCommandStrPrefix + 'NO_CURSOR_UPDATE');

			return;
		}

		this.previousCursor = activeEditor.selection.active;

		const cursorAt = cursor.line;
		let previewLineNumber = 0;

		if (!basePathUpdated) { return; }

		const previewScript = document.fileName.right(basePath.length + 1);

		let bReached = false;
		let bReachedBeforeText = false;

		let curCache = lineCommentCache.getDocumentCache(document);
		for (let lineNumber = 0; lineNumber < curCache.comment.length; lineNumber++) {
			if (curCache.comment[lineNumber]) { continue; }

			const parseResult = curCache.result[lineNumber]!;
			let { line, lineStart, linePrefix, lineType, curPos } = parseResult;

			const bCurLineText = lineType === LineType.dialogue;

			if (lineNumber >= cursorAt) {
				bReached = true;
				bReachedBeforeText = bCurLineText;
			}

			if (bCurLineText) {
				if (!bReachedBeforeText) {
					previewLineNumber++;
				}

				if (bReached) {
					break;
				}
			}
		}

		if (!this.bDocUpdated && this.previousLineNumber === previewLineNumber && this.previousScript.iCmp(previewScript)) {
			console.log(this.previewCommandStrPrefix + 'NO_UPDATE');

			return;
		}

		this.previousLineNumber = previewLineNumber;
		this.previousScript = previewScript;

		const command = this.previewCommandStrPrefix + this.previousScript + '_' + previewLineNumber.toString();
		console.log(command);

		await vscode.env.clipboard.writeText(command);

		this.bDocUpdated = false;
	}
}

export const previewer = new Previewer();