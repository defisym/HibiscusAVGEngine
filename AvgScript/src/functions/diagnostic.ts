import * as vscode from 'vscode';

import { activeEditor} from '../extension';
import { settingsParamDocList, commandParamList, internalKeywordList, deprecatedKeywordList, sharpKeywordList, atKeywordList, internalImageID, ParamType, inlayHintType } from '../lib/dict';
import { regexRep, regexNumber, regexHexColor } from '../lib/regExp';
import { iterateLines, getMapValue, getAllParams, arrayHasValue, matchEntire, getCommandType, fileExists } from '../lib/utilities';
import { commandUpdateCommandExtension } from './command';
import { fileListInitialized, currentLocalCode, currentLocalCodeDisplay } from './file';
import { getLabelCompletion, labelCompletions } from './label';

export let timeout: NodeJS.Timer | undefined = undefined;

export const diagnosticsCollection = vscode.languages.createDiagnosticCollection('AvgScript');
export const nonActiveLanguageDecorator = vscode.window.createTextEditorDecorationType({
    opacity: '0.5',
});

export function updateDiagnostics(document: vscode.TextDocument, checkFile: boolean = false) {
    if (document.languageId !== 'AvgScript') {
        return;
    }

    let diagnostics: vscode.Diagnostic[] = [];
    let labels: string[] = [];
    let blockCount: number = 0;
    let blockPos: vscode.Range[] = [];

    let settings = false;
    let liteMode = false;
    let EOF = false;
    let nextJMP = false;

    iterateLines(document, (text, lineNumber
        , lineStart, lineEnd
        , firstLineNotComment) => {
        if (text.startsWith(";")) {
            if (labels.includes(text)) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
                    , "Duplicated Label: " + text.substring(1)
                    , vscode.DiagnosticSeverity.Warning));

                return;
            }

            labels.push(text);
        }

        if (text.startsWith("#")
            || text.startsWith("@")) {

            if (text.match(/#Settings/gi)) {
                let start = text.indexOf('=');
                let params = text.substring(start + 1).split('|');

                start += lineStart;

                for (let settingsParam in params) {
                    let cutSettingsParam = params[settingsParam];
                    let cutSettingsParamLength = cutSettingsParam.length;

                    start++;

                    if (getMapValue(cutSettingsParam, settingsParamDocList) === undefined) {
                        diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, start, lineNumber, start + cutSettingsParamLength)
                            , "Invalid Setting Param: " + cutSettingsParam
                            , vscode.DiagnosticSeverity.Warning));
                    }

                    start += cutSettingsParamLength;
                }

                if (lineNumber !== firstLineNotComment) {
                    diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
                        , "Settings Not At First Line"
                        , vscode.DiagnosticSeverity.Error));
                }

                if (!settings && text.match(/Lite/gi)) {
                    liteMode = true;
                }

                if (settings) {
                    diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
                        , "Duplicated Setting"
                        , vscode.DiagnosticSeverity.Error));
                }

                settings = true;

                return;
            }

            if (text.match(/#EOF/gi)) {
                EOF = true;
                return;
            }
            if (text.match(/(#CJMP|#JMPCha|#FJMP|#JMPFra)/gi)) {
                nextJMP = true;
            }

            if (text.match(/#Begin/gi)) {
                blockCount++;
                blockPos.push(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd));

                return;
            }

            if (text.match(/#End/gi)) {
                if (blockCount === 0) {
                    diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
                        , "End Without Begin"
                        , vscode.DiagnosticSeverity.Warning));

                    return;
                }

                blockCount--;
                blockPos.pop();

                return;
            }

            const params = getAllParams(text);
            const prefix = params[0][0];
            const command = params[0].substring(1);
            const paramNum = params.length - 1;
            const paramDefinition = getMapValue(command, commandParamList);

            let contentStart: number = lineStart + command.length + 1;

            if (arrayHasValue(command, internalKeywordList)) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, contentStart)
                    , "User Shouldn't Use Internal Command: " + params[0]
                    , vscode.DiagnosticSeverity.Error));
            }

            if (arrayHasValue(command, deprecatedKeywordList)) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, contentStart)
                    , "Deprecated Command: " + params[0]
                    , vscode.DiagnosticSeverity.Warning));
            }

            let checkImageID = false;
            let checkPos = 0;

            enum ImageBehavior {
                create,
                destroy
            }

            let imageBehavior;

            // check internal ID for @Char
            if (matchEntire(params[0], /(@Char|@Character)/gi)) {
                checkImageID = true;
                imageBehavior = ImageBehavior.create;
                checkPos = 2;
            }

            if (matchEntire(params[0], /(@CD|@CharDispose)/gi)) {
                checkImageID = true;
                imageBehavior = ImageBehavior.destroy;
                checkPos = 1;
            }

            if (paramDefinition === undefined) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
                    , "Undocumented Command: " + params[0]
                    , vscode.DiagnosticSeverity.Information));

                return;
            }

            if ((prefix === '@' && arrayHasValue(command, sharpKeywordList))
                || (prefix === '#' && arrayHasValue(command, atKeywordList))) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineStart + 1)
                    , "Wrong Command Prefix: " + params[0]
                    , vscode.DiagnosticSeverity.Error));

                return;
            }

            // Check param valid
            const paramFormat = paramDefinition.type;
            const paramHint = paramDefinition.inlayHintType;
            const paramNumMin = paramDefinition.minParam;
            const paramNumMax = paramDefinition.maxParam;

            let curLinePrefix = params[0];

            for (let j = 1; j < params.length; j++) {
                if (j > paramNumMax) {
                    diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, lineEnd)
                        , "Too Many Params"
                        , vscode.DiagnosticSeverity.Warning));

                    return;
                }

                let curParam = params[j];
                let currentType = paramFormat[j - 1];
                let currentHintType = paramHint !== undefined
                    ? paramHint[j - 1]
                    : undefined;

                curLinePrefix = curLinePrefix + ":" + curParam;

                contentStart++;

                if (curParam.match(regexRep)) {
                    continue;
                }

                if (checkImageID
                    && checkPos === j) {
                    const availableBehavior = internalImageID.get(parseInt(curParam));

                    if (availableBehavior !== undefined
                        && ((imageBehavior === ImageBehavior.create && !availableBehavior.Create)
                            || (imageBehavior === ImageBehavior.destroy && !availableBehavior.Destroy))) {
                        diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                            , "Cannot Use Internal ID"
                            , vscode.DiagnosticSeverity.Error));
                    }
                }

                switch (currentType) {
                    case ParamType.String:

                        break;
                    case ParamType.Number:
                        if (!matchEntire(curParam, regexNumber)) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Number: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    case ParamType.ZeroOne:
                        let curParamVal = parseInt(curParam);

                        if (curParamVal !== 0
                            && curParamVal !== 1) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid ZeroOne Param: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    case ParamType.Boolean:
                        if (!matchEntire(curParam, regexNumber)
                            && (curParam.toLowerCase() !== "on"
                                && curParam.toLowerCase() !== "off")) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Option: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    case ParamType.Volume:
                        if (!matchEntire(curParam, regexNumber)
                            || curParam.toLowerCase() !== "BGM".toLowerCase()
                            || curParam.toLowerCase() !== "BGS".toLowerCase()
                            || curParam.toLowerCase() !== "SE".toLowerCase()
                            || curParam.toLowerCase() !== "DUB".toLowerCase()) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Volume: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    case ParamType.Order:
                        if (curParam.toLowerCase() !== "Front".toLowerCase()
                            || curParam.toLowerCase() !== "Back".toLowerCase()
                            || Number.isNaN(parseInt(curParam))) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Order: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    case ParamType.ObjType:
                        if (curParam.toLowerCase() !== "Pic".toLowerCase()
                            && curParam.toLowerCase() !== "Str".toLowerCase()) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Object Type: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    case ParamType.Color:
                        if (curParam.match(regexHexColor)) {
                            if (j !== params.length - 1) {
                                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, lineEnd)
                                    , "Too Many Params"
                                    , vscode.DiagnosticSeverity.Warning));
                            }
                        } else {
                            if (j + 2 >= params.length) {
                                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineEnd, lineNumber, lineEnd)
                                    , "Too Few Params"
                                    , vscode.DiagnosticSeverity.Warning));
                            }
                            if (!matchEntire(curParam, regexNumber)) {
                                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                    , "Invalid Number: " + curParam
                                    , vscode.DiagnosticSeverity.Error));
                            }
                        }

                        break;
                    case ParamType.File:
                        const commandType = getCommandType(curLinePrefix);
                        if (checkFile
                            && !fileExists(commandType, curParam)) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "File " + curParam + " Not Exist"
                                , vscode.DiagnosticSeverity.Warning));
                        }

                        break;
                    case ParamType.Any:
                        break;

                    default:
                        break;
                }

                switch (currentHintType) {
                    case inlayHintType.Alpha:
                        let curParamVal = parseInt(curParam);

                        if (curParamVal < 0
                            || curParamVal > 255) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Alpha Param: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                }

                contentStart += curParam.length;
            }

            if (paramNum < paramNumMin) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineEnd, lineNumber, lineEnd)
                    , "Too Few Params"
                    , vscode.DiagnosticSeverity.Warning));

                return;
            }
        }
    });

    for (let j in blockPos) {
        diagnostics.push(new vscode.Diagnostic(blockPos[j]
            , "Begin Without End"
            , vscode.DiagnosticSeverity.Warning));
    }

    if (!EOF) {
        const lastLine = document.lineAt(document.lineCount - 1).text;
        const lastLineStart = lastLine.length - lastLine.trimStart().length;
        const lastLineEnd = lastLineStart + lastLine.trim().length;

        diagnostics.push(new vscode.Diagnostic(new vscode.Range(document.lineCount - 1, lastLineStart, document.lineCount - 1, lastLineEnd)
            , "Non EOF"
            , vscode.DiagnosticSeverity.Error));
    }

    if (!liteMode && !nextJMP) {
        diagnostics.push(new vscode.Diagnostic(new vscode.Range(document.lineCount, 0, document.lineCount, document.lineAt(document.lineCount - 1).text.length)
            , "Non Valid JMP"
            , vscode.DiagnosticSeverity.Error));
    }

    diagnosticsCollection.clear();
    diagnosticsCollection.set(document.uri, diagnostics);
}

//--------------------

export function refreshFileDiagnostics() {
    if (activeEditor === undefined) {
        return;
    }

    let activeDocument = activeEditor.document;

    updateDiagnostics(activeDocument, true);
}

export function onUpdate() {
    if (activeEditor === undefined) {
        return;
    }

    let activeDocument = activeEditor.document;

    updateDiagnostics(activeDocument, fileListInitialized);
    getLabelCompletion(labelCompletions, activeDocument);
    updateLanguageDecorations(activeEditor
        , nonActiveLanguageDecorator
        , currentLocalCode
        , currentLocalCodeDisplay);

    vscode.commands.executeCommand(commandUpdateCommandExtension);
}

export function triggerUpdate(throttle = false) {
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    if (throttle) {
        timeout = setTimeout(onUpdate, 500);
    } else {
        onUpdate();
    }
}

function updateLanguageDecorations(activeEditor: vscode.TextEditor, decorationType: vscode.TextEditorDecorationType, currentLocalCode: string, currentLocalCodeDisplay: string) {
    const langReg = new RegExp("Lang\\[(?!" + currentLocalCode + ").*\\].*", "gi");
    const decoOpt: vscode.DecorationOptions[] = [];
    const document = activeEditor.document;

    iterateLines(document, (text, lineNumber
        , lineStart, lineEnd
        , firstLineNotComment) => {
        if (text.match(langReg)) {
            const decoration = { range: new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd), hoverMessage: "非当前语言: " + currentLocalCodeDisplay + currentLocalCode };

            decoOpt.push(decoration);
        }
    });

    activeEditor.setDecorations(decorationType, decoOpt);
}