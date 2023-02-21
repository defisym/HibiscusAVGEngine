import * as vscode from 'vscode';
import { InlayHintType } from './dict';
import { iterateScripts } from './iterateScripts';

export async function iterateParams(
    newScriptCallback: (script: string, document: vscode.TextDocument) => void,
    paramCallback: (initScript: string,
        script: string, lineNumber: number,
        currentType: InlayHintType, currentParam: string) => void) {
    await iterateScripts((script: string, document: vscode.TextDocument) => {
        newScriptCallback(script, document);
    },
        (initScript: string,
            script: string,
            line: string, lineNumber: number,
            lineStart: number, lineEnd: number,
            firstLineNotComment: number) => { },
        (initScript: string,
            script: string, lineNumber: number, line: string,
            currentType: InlayHintType, currentParam: string) => {
            paramCallback(initScript,
                script, lineNumber,
                currentType, currentParam);
        });
}