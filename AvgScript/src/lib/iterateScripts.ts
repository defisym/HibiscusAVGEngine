import * as vscode from 'vscode';

import { projectConfig, scriptPath } from '../functions/file';
import { InlayHintType, commandInfoList } from './dict';
import { iterateLines } from './iterateLines';
import { getAllParams, sleep } from './utilities';

// await iterateScripts((script: string, document: vscode.TextDocument) => { },
//     (initScript: string,
//         script: string,
//         line: string, lineNumber: number,
//         lineStart: number, lineEnd: number,
//         firstLineNotComment: number) => { },
//     (initScript: string,
//         script: string, lineNumber: number, line: string,
//         currentType: InlayHintType, currentParam: string) => { });

export async function iterateScripts(
    newScriptCallback: (script: string, document: vscode.TextDocument) => void,
    lineCallBack: (initScript: string,
        script: string,
        line: string, lineNumber: number,
        lineStart: number, lineEnd: number,
        firstLineNotComment: number) => void,
    paramCallback: (initScript: string,
        script: string, lineNumber: number, line: string,
        currentType: InlayHintType, currentParam: string) => void) {
    // get settings
    do {
        await sleep(50);
    } while (projectConfig === undefined);

    let initSettings: string = projectConfig.System.Initial_AVG;
    let initScript = initSettings.substring(initSettings.lastIndexOf('\\') + 1);

    // generate ref list
    let scripts: string[] = [initScript];
    let scannedScripts: string[] = [];

    let praseScript = async (scripts: string[]) => {
        let referredScripts: string[] = [];

        for (let script of scripts) {
            let filePath = scriptPath + '\\' + script;

            if (!filePath.substring(filePath.length - 4).iCmp('.asc')) {
                filePath += '.asc';
            }

            let document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));

            newScriptCallback(script, document);

            iterateLines(document, (text, lineNumber,
                lineStart, lineEnd,
                firstLineNotComment) => {
                lineCallBack(initScript,
                    script,
                    text, lineNumber,
                    lineStart, lineEnd,
                    firstLineNotComment);

                const params = getAllParams(text);
                const command = params[0].substring(1);

                let commandInfo = commandInfoList.getValue(command);

                if (commandInfo === undefined) {
                    return;
                }

                let inlayHintType = commandInfo.inlayHintType;

                if (inlayHintType === undefined) {
                    return;
                }

                const itNum = Math.min(inlayHintType.length, params.length - 1);

                for (let i = 0; i < itNum; i++) {
                    const currentType = inlayHintType[i];
                    let currentParam = params[i + 1];

                    if (currentType === InlayHintType.Chapter
                        && !scannedScripts.hasValue(currentParam)) {
                        scannedScripts.push(currentParam);
                        referredScripts.push(currentParam);
                    }

                    paramCallback(initScript,
                        script, lineNumber, text,
                        currentType, currentParam);
                }
            });
        }

        if (referredScripts.length === 0) {
            return;
        } else {
            await praseScript(referredScripts);
        }
    };

    await praseScript(scripts);
}
