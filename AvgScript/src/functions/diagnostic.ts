import * as vscode from 'vscode';

import { activeEditor } from '../extension';
import { currentLineDialogue, parseDialogue } from '../lib/dialogue';
import { atKeywordList, commandInfoList, commandListInitialized, deprecatedKeywordList, InlayHintType, internalImageID, internalKeywordList, ParamType, settingsParamDocList, sharpKeywordList } from '../lib/dict';
import { DubParser } from '../lib/dubs';
import { iterateLines } from "../lib/iterateLines";
import { regexHexColor, regexRep } from '../lib/regExp';
import { getSettings, parseSettings, ScriptSettings } from '../lib/settings';
import { cropScript, fileExists, FileType, getAllParams, getCommandType, imageStretched } from '../lib/utilities';
import { dubError } from './codeLens';
import { basePath, currentLocalCode, currentLocalCodeDisplay, fileListInitialized, getFileInfoInternal, getFullFileNameByType, projectConfig } from './file';
import { getLabelCompletion, labelJumpMap } from './label';

export let timeout: NodeJS.Timer | undefined = undefined;

export const diagnosticsCollection = vscode.languages.createDiagnosticCollection('AvgScript');
export const nonActiveLanguageDecorator = vscode.window.createTextEditorDecorationType({
    opacity: '0.5',
});

export function updateDiagnostics(document: vscode.TextDocument, checkFile: boolean = false) {
    if (commandListInitialized === false) {
        return;
    }

    if (document.languageId !== 'AvgScript') {
        diagnosticsCollection.delete(document.uri);

        return;
    }

    let diagnostics: vscode.Diagnostic[] = [];
    let labels: string[] = [];
    let blockCount: number = 0;
    let blockPos: vscode.Range[] = [];

    let settings: ScriptSettings;

    let settingsParsed = false;
    let liteMode = false;
    let bVNMode = false;

    let EOF = false;
    let nextJMP = false;

    const curChapter = fileListInitialized
        ? cropScript(document.fileName.substring(basePath.length + 1))
        : '';
    let dubState = new DubParser(curChapter);
    dubState.parseSettings(getSettings(document));

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

            if (text.matchStart(/#Settings/gi)) {
                let start = text.indexOf('=');
                let params = text.substring(start + 1).split('|');

                start += lineStart;

                for (let settingsParam of params) {
                    let cutSettingsParam = settingsParam;
                    let cutSettingsParamLength = cutSettingsParam.length;

                    start++;

                    if (settingsParamDocList.getValue(cutSettingsParam) === undefined) {
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

                if (!settingsParsed) {
                    settings = parseSettings(text)!;

                    if (settings) {
                        if (settings.LiteMode) {
                            liteMode = true;
                        }

                        if (settings.VNMode) {
                            bVNMode = true;
                        }
                    }
                }

                if (settingsParsed) {
                    diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
                        , "Duplicated Setting"
                        , vscode.DiagnosticSeverity.Error));
                }

                settingsParsed = true;

                return;
            }

            if (text.matchStart(/#EOF/gi)) {
                EOF = true;

                return;
            }

            if (text.matchStart(/(#CJMP|#JMPCha|#FJMP|#JMPFra)/gi)) {
                nextJMP = true;
            }

            if (text.matchStart(/#Begin/gi)) {
                blockCount++;
                blockPos.push(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd));

                return;
            }

            if (text.matchStart(/#End/gi)) {
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

            dubState.parseCommand(text);

            const params = getAllParams(text);
            const prefix = params[0][0];
            const command = params[0].substring(1);
            const paramNum = params.length - 1;
            const paramDefinition = commandInfoList.getValue(command);

            let contentStart: number = lineStart + command.length + 1;

            if (internalKeywordList.hasValue(command)) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, contentStart)
                    , "User Shouldn't Use Internal Command: " + params[0]
                    , vscode.DiagnosticSeverity.Error));
            }

            if (deprecatedKeywordList.hasValue(command)) {
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
            if (params[0].matchEntire(/(@Char|@Character)/gi)) {
                checkImageID = true;
                imageBehavior = ImageBehavior.create;
                checkPos = 2;
            }

            if (params[0].matchEntire(/(@CD|@CharDispose)/gi)) {
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

            if (!bVNMode && paramDefinition.VNModeOnly) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
                    , "Using VNMode Exclusive command in Non VNMode"
                    , vscode.DiagnosticSeverity.Warning));
            }

            if (bVNMode && paramDefinition.NonVNModeOnly) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
                    , "Using Non VNMode Exclusive command in VNMode"
                    , vscode.DiagnosticSeverity.Warning));
            }

            if ((prefix === '@' && sharpKeywordList.hasValue(command))
                || (prefix === '#' && atKeywordList.hasValue(command))) {
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

            const treatAsOneParam = paramDefinition.treatAsOneParam === undefined
                ? false
                : paramDefinition.treatAsOneParam;

            let curLinePrefix = params[0];

            for (let j = 1; j < params.length; j++) {
                if (!treatAsOneParam && j > paramNumMax) {
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
                        if (!curParam.isNumber()) {
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
                        if (!curParam.isNumber()
                            && (!curParam.iCmp("on")
                                && !curParam.iCmp("off"))) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Option: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    case ParamType.Volume:
                        if (!curParam.isNumber()
                            || !curParam.iCmp("BGM")
                            || !curParam.iCmp("BGS")
                            || !curParam.iCmp("SE")
                            || !curParam.iCmp("DUB")) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Volume: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    case ParamType.Order:
                        if (!curParam.iCmp("Front")
                            || !curParam.iCmp("Back")
                            || Number.isNaN(parseInt(curParam))) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Order: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    case ParamType.ObjType:
                        // if (!curParam.iCmp("Pic")
                        //     && !curParam.iCmp("Str")) {
                        //     diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                        //         , "Invalid Object Type: " + curParam
                        //         , vscode.DiagnosticSeverity.Error));
                        // }

                        break;
                    case ParamType.Color:
                        if (curParam.matchEntire(regexHexColor)) {
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
                            if (!curParam.isNumber()) {
                                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                    , "Invalid Number: " + curParam
                                    , vscode.DiagnosticSeverity.Error));
                            }
                        }

                        break;
                    case ParamType.File:
                        const commandType = getCommandType(curLinePrefix);

                        let fileParam = curParam;

                        if (commandType === FileType.dubs) {
                            if (settings && settings.NoSideEffect) {
                                fileParam = dubState.getFileRelativePrefix() + fileParam;
                            } else {
                                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                    , "Cannot diagnostic file " + curParam + " if script has side effect"
                                    , vscode.DiagnosticSeverity.Information));

                                break;
                            }

                        }

                        if (checkFile
                            && !fileExists(commandType, fileParam)) {
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
                    case InlayHintType.Alpha: {
                        let curParamVal = parseInt(curParam);

                        if (curParamVal < 0
                            || curParamVal > 255) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Alpha Param: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    }

                    case InlayHintType.Label: {
                        if (labelJumpMap.getValue(curParam) === undefined) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Invalid Label: " + curParam
                                , vscode.DiagnosticSeverity.Error));
                        }

                        break;
                    }

                    case InlayHintType.Width: {
                        // if cur is width, then next must be height
                        const nextParam = params[j + 1];

                        // don't have ignorable width & height
                        if (command.matchEntire('BackZoom')) {
                            if (nextParam === undefined) {
                                break;
                            }

                            if (projectConfig === undefined) {
                                break;
                            }

                            const width = parseInt(curParam);
                            const height = parseInt(nextParam);

                            const projWidth = projectConfig.Display.RenderResolutionX;
                            const projHeight = projectConfig.Display.RenderResolutionY;

                            if (projWidth === undefined || projHeight === undefined) {
                                break;
                            }

                            if (imageStretched({
                                width: projWidth,
                                height: projHeight,
                            }, {
                                width: width,
                                height: height,
                            })) {
                                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart
                                    , lineNumber, contentStart + curParam.length + 1 + nextParam.length)
                                    , "BackZoom Ratio doesn't match Resolution Ratio"
                                    , vscode.DiagnosticSeverity.Warning));
                            }

                            let outOfScreen = false;

                            const x = parseInt(params[1]);
                            const y = parseInt(params[2]);

                            outOfScreen = outOfScreen || (x - width / 2) < (-1 * projWidth / 2);
                            outOfScreen = outOfScreen || (x + width / 2) > (projWidth / 2);

                            outOfScreen = outOfScreen || (y - height / 2) < (0);
                            outOfScreen = outOfScreen || (y + height / 2) > (projHeight);

                            if (outOfScreen) {
                                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart - 1 - params[1].length - 1 - params[2].length
                                    , lineNumber, contentStart + curParam.length + 1 + nextParam.length)
                                    , "BackZoom has area out of screen"
                                    , vscode.DiagnosticSeverity.Warning));
                            }
                        }

                        if (!checkFile) {
                            break;
                        }

                        const filePath = getFullFileNameByType(FileType.characters, params[1]);

                        if (filePath === undefined) {
                            break;
                        }

                        const data = getFileInfoInternal(filePath);

                        if (data === undefined) {
                            break;
                        }

                        const width = parseInt(curParam);
                        const height = nextParam === undefined
                            ? data.height
                            : parseInt(nextParam);

                        if (imageStretched({
                            width: data.width,
                            height: data.height,
                        }, {
                            width: width,
                            height: height,
                        })) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart
                                , lineNumber, contentStart + curParam.length + (nextParam === undefined
                                    ? 0
                                    : 1 + nextParam.length))
                                , "Stretched Ratio doesn't match Image Ratio"
                                , vscode.DiagnosticSeverity.Warning));
                        }

                        break;
                    }

                }

                if (paramDefinition.required !== undefined) {
                    const curRequired = paramDefinition.required[j - 1];

                    if (curRequired !== undefined && !curRequired.empty()) {
                        if (!curRequired.includes(curParam)) {
                            diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
                                , "Unexpected Param"
                                , vscode.DiagnosticSeverity.Error));
                        }
                    }
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

        if (currentLineDialogue(text) && projectConfig) {
            const maxLength = parseInt(projectConfig.Debug.Debug_MaxLength);
            const dialogueStruct = parseDialogue(text.toLocaleLowerCase(), text);
            if (dialogueStruct.m_dialoguePart.length > maxLength) {
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart + maxLength, lineNumber, lineEnd)
                    , "Text maybe too long, expected less than " + maxLength.toString() + " characters"
                    , vscode.DiagnosticSeverity.Warning));
            }
        }
    });

    for (let blockPosItem of blockPos) {
        diagnostics.push(new vscode.Diagnostic(blockPosItem
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

    const dubErrors = dubError.get(document.uri);

    if (dubErrors !== undefined) {
        for (const dubErrorRange of dubErrors) {
            diagnostics.push(new vscode.Diagnostic(dubErrorRange
                , "Dub file duration longer than excepted"
                , vscode.DiagnosticSeverity.Warning
            ));
        }
    }

    diagnosticsCollection.set(document.uri, diagnostics);

    return;
}

//--------------------

export function refreshFileDiagnostics() {
    diagnosticUpdateCore(true);
}

export function diagnosticUpdateCore(checkFile: boolean = false) {
    if (activeEditor === undefined) {
        return;
    }

    let activeDocument = activeEditor.document;

    // called before update diagnostic to check invalid label
    getLabelCompletion(activeDocument);
    updateDiagnostics(activeDocument, checkFile);
    updateLanguageDecorations(activeEditor
        , nonActiveLanguageDecorator
        , currentLocalCode
        , currentLocalCodeDisplay);
}

export function onUpdate() {
    diagnosticUpdateCore(fileListInitialized);
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

function updateLanguageDecorations(activeEditor: vscode.TextEditor
    , decorationType: vscode.TextEditorDecorationType
    , currentLocalCode: string
    , currentLocalCodeDisplay: string) {
    const langReg = new RegExp("Lang\\[(?!" + currentLocalCode + ").*\\].*", "gi");
    const decoOpt: vscode.DecorationOptions[] = [];
    const document = activeEditor.document;

    if (document.languageId !== 'AvgScript') {
        return;
    }

    iterateLines(document, (text, lineNumber
        , lineStart, lineEnd
        , firstLineNotComment) => {
        if (text.matchStart(langReg)) {
            const decoration = { range: new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd), hoverMessage: "非当前语言: " + currentLocalCodeDisplay + currentLocalCode };

            decoOpt.push(decoration);
        }
    });

    activeEditor.setDecorations(decorationType, decoOpt);
}