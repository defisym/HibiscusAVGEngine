import * as vscode from 'vscode';

import { activeEditor } from '../extension';
import { currentLineDialogue } from '../lib/dialogue';
import { iterateLines } from '../lib/iterateLines';
import { projectConfig } from './file';

export class Previewer {
    private bDocUpdated = false;
    private previousTimer = 0;
    private previousCursor: vscode.Position | undefined = undefined;
    private previousLineNumber = 0;

    private threshold = 1000;
    private previewCommandStrFinish = 'Hibiscus_Preview_Finish';
    private previewCommandStrPrefix = 'Hibiscus_Preview_';

    private getTime() {
        const now = new Date();

        return now.getTime();
    }

    docUpdated() {
        this.bDocUpdated = true;
        this.previousTimer = this.getTime();
    }

    async updatePreview() {
        if (projectConfig.Debug.Debug_Preview !== 1) {
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

        try {
            iterateLines(document, (text, lineNumber
                , lineStart, lineEnd
                , firstLineNotComment) => {
                if (currentLineDialogue(text)) {
                    previewLineNumber++;
                }

                if (lineNumber >= cursorAt) {
                    throw Boolean;
                }
            });
        } catch (err) {

        }

        if (!this.bDocUpdated && this.previousLineNumber === previewLineNumber) {
            console.log(this.previewCommandStrPrefix + 'NO_LINE_UPDATE');

            return;
        }

        this.previousLineNumber = previewLineNumber;

        const command = this.previewCommandStrPrefix + previewLineNumber.toString();
        console.log(command);

        await vscode.env.clipboard.writeText(command);

        this.bDocUpdated = false;
    }
}

export const previewer = new Previewer();

function refreshPreview() {
    previewer.updatePreview();
}

setInterval(refreshPreview, 500);
