/* eslint-disable @typescript-eslint/naming-convention */

import path = require('path');
import * as vscode from 'vscode';

import { activeEditor } from '../extension';
import { currentLineDialogue, parseDialogue } from '../lib/dialogue';
import { commandInfoList, generateList, inlayHintMap, InlayHintType, ParamInfo, ParamTypeMap, resetList } from '../lib/dict';
import { iterateScripts } from "../lib/iterateScripts";
import { currentLineNotComment, FileType, sleep } from '../lib/utilities';
import { assetList_getWebviewContent } from '../webview/assetList';
import { formatHint_getFormatControlContent } from '../webview/formatHint';
import { jumpFlow_getWebviewContent } from '../webview/jumpFlow';
import { diagnosticUpdateCore as diagnosticUpdateHandler, refreshFileDiagnostics, updateDiagnostics } from './diagnostic';
import { audioBgmPath, audioBgsPath, audioDubsPath, audioSEPath, basePath, fileListHasItem, fileListInitialized, getFullFilePath, graphicCGPath, graphicCharactersPath, graphicPatternFadePath, graphicUIPath, scriptPath, updateBasePath, updateFileList, videoPath } from './file';
import { getLabelJumpMap } from './label';

// config
export const confBasePath: string = "conf.AvgScript.basePath";
export const confCommandExt: string = "conf.AvgScript.commandExtension";
export const confReplaceScript: string = "conf.AvgScript.replaceScript";

// command
export const commandBasePath: string = "config.AvgScript.basePath";
export const commandRefreshAssets: string = "config.AvgScript.refreshAssets";
export const commandUpdateCommandExtension: string = "config.AvgScript.updateCommandExtension";
export const commandGetAssetsList: string = "config.AvgScript.getAssetsList";
export const commandShowJumpFlow: string = "config.AvgScript.showJumpFlow";
export const commandReplaceScript: string = "config.AvgScript.replaceScript";

export const commandAppendDialogue: string = "config.AvgScript.appendDialogue";
export const commandShowDialogueFormatHint: string = "config.AvgScript.showDialogueFormatHint";

export const commandBasePath_impl = async () => {
    // 1) Getting the value
    let oldBasePath = vscode.workspace.getConfiguration().get<string>(confBasePath, "");
    let value: string | undefined = undefined;

    do {
        // press esc -> return undefined
        value = await vscode.window.showInputBox({
            value: oldBasePath,
            prompt: "Absolute path of main program, e.g., \"C:\\Hibiscus\\AVG.exe\""
        });
    } while (!await updateBasePath(value));

    if (value === oldBasePath) {
        return;
    }

    const configuration = vscode.workspace.getConfiguration();

    await configuration.update(confBasePath
        , value
        //, vscode.ConfigurationTarget.Workspace);
        , false);

    // 5) Update fileList
    vscode.window.withProgress({
        // location: vscode.ProgressLocation.Notification,
        location: vscode.ProgressLocation.Window,
        title: "Refreshing assets...\t",
        cancellable: false
    }, async (progress, token) => {
        await updateFileList(progress);
        refreshFileDiagnostics();
    });
};

export const commandRefreshAssets_impl = async () => {
    if (!await updateBasePath()) {
        await vscode.commands.executeCommand(commandBasePath);
    }

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: "Refreshing assets...\t",
        cancellable: false
    }, async (progress, token) => {
        await updateFileList(progress);
        refreshFileDiagnostics();
    });
};

export const commandUpdateCommandExtension_impl = async () => {
    // reset list to base
    resetList();

    // add ext
    do {
        interface CommandExt {
            // basic
            prefix: string,
            command: string,
            description: string[],

            // diagnostic
            minParam: number,
            maxParam: number,
            paramType: string[],

            // inlayHint
            inlayHint: string[],
        }

        let commandExt = vscode.workspace.getConfiguration().get<CommandExt[]>(confCommandExt);

        if (commandExt === undefined) {
            break;
        }

        let insertCommandExt = (commandExtItem: CommandExt) => {
            let command = commandExtItem.command;

            let paramInfo: ParamInfo = {
                prefix: commandExtItem.prefix
                , minParam: 0, maxParam: 0
                , description: commandExtItem.description
                , type: []
                , inlayHintType: []
            };

            paramInfo.minParam = Math.max(0, commandExtItem.minParam);
            paramInfo.maxParam = Math.max(paramInfo.minParam, commandExtItem.maxParam);

            let paramType = commandExtItem.paramType;

            for (let type of paramType) {
                paramInfo.type.push(ParamTypeMap.get(type)!);
            }

            let inlayHints = commandExtItem.inlayHint;

            if (inlayHints !== undefined) {
                for (let hints of inlayHints) {
                    let pos = inlayHintMap.size;
                    inlayHintMap.set(pos, hints);
                    paramInfo.inlayHintType?.push(pos);
                }
            }

            commandInfoList.set(command, paramInfo);
        };

        for (let commandExtItem of commandExt!) {
            insertCommandExt(commandExtItem);
        }
    } while (0);

    // update list
    generateList();

    // update diagnostic
    diagnosticUpdateHandler(fileListInitialized);
};

export let assetsListPanel: vscode.WebviewPanel;
export interface RefInfo {
    fileExist: boolean;
    type: FileType[];
    uri: vscode.Uri;
    webUri: vscode.Uri;
    refCount: number;
    refScript: Map<string, number[]>;
};

export const commandGetAssetsList_impl = async () => {
    // wait for file refresh
    if (!fileListInitialized) {
        vscode.window.showInformationMessage('Waiting for file scanning complete');
    }

    do {
        await sleep(50);
    } while (!fileListInitialized);

    vscode.window.withProgress({
        // location: vscode.ProgressLocation.Notification,
        location: vscode.ProgressLocation.Window,
        title: "Generating assets list...\t",
        cancellable: false
    }, async (progress, token) => {
        // close old ones
        progress.report({ increment: 0, message: "Closing tab..." });

        if (assetsListPanel !== undefined) {
            assetsListPanel.dispose();
        }

        assetsListPanel = vscode.window.createWebviewPanel(
            'AssetList', // Identifies the type of the webview. Used internally
            'Asset List', // Title of the panel displayed to the user
            vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
            {
                enableScripts: true
                , enableForms: true
                , enableCommandUris: true
                , localResourceRoots: [vscode.Uri.file(basePath)]
            } // Webview options. More on these later.
        );

        // generate ref list
        progress.report({ increment: 80, message: "Parsing scripts..." });

        let assets = new Map<string, RefInfo>();

        await iterateScripts(
            (script: string, document: vscode.TextDocument) => { },
            (initScript: string
                , script: string, lineNumber: number
                , currentType: InlayHintType, currentParam: string) => {
                let UpdateAssets = (fileName: string, fileType: FileType) => {
                    let fullName = getFullFilePath(fileName);
                    fileName = fullName !== undefined ? fullName : fileName;

                    let refInfo = assets.get(fileName);

                    if (refInfo === undefined) {

                        assets.set(fileName, {
                            fileExist: fileListHasItem(fileName)
                            , type: []
                            , uri: vscode.Uri.file(fileName)
                            , webUri: assetsListPanel.webview.asWebviewUri(vscode.Uri.file(fileName))
                            , refCount: 0
                            , refScript: new Map<string, number[]>()
                        });
                    }

                    refInfo = assets.get(fileName)!;

                    // ref count
                    refInfo.refCount++;

                    // ref type
                    refInfo.type.uniquePush(fileType);

                    // ref position
                    let posIt = refInfo.refScript.get(script);

                    if (posIt === undefined) {
                        refInfo.refScript.set(script, []);
                    }

                    posIt = refInfo.refScript.get(script);

                    posIt?.push(lineNumber);
                };

                switch (currentType) {
                    case InlayHintType.CharacterFileName:
                        UpdateAssets(graphicCharactersPath + '\\' + currentParam, FileType.characters);

                        break;
                    case InlayHintType.DiaFileName:
                        UpdateAssets(graphicUIPath + '\\' + currentParam, FileType.ui);

                        break;
                    case InlayHintType.NameFileName:
                        UpdateAssets(graphicUIPath + '\\' + currentParam, FileType.ui);

                        break;
                    case InlayHintType.CGFileName:
                        UpdateAssets(graphicCGPath + '\\' + currentParam, FileType.cg);

                        break;
                    case InlayHintType.PatternFadeFileName:
                        UpdateAssets(graphicPatternFadePath + '\\' + currentParam, FileType.patternFade);

                        break;
                    case InlayHintType.BGMFileName:
                        UpdateAssets(audioBgmPath + '\\' + currentParam, FileType.bgm);

                        break;
                    case InlayHintType.BGSFileName:
                        UpdateAssets(audioBgsPath + '\\' + currentParam, FileType.bgs);

                        break;
                    case InlayHintType.DubFileName:
                        UpdateAssets(audioDubsPath + '\\' + currentParam, FileType.dubs);

                        break;
                    case InlayHintType.SEFileName:
                        UpdateAssets(audioSEPath + '\\' + currentParam, FileType.se);

                        break;
                    case InlayHintType.VideoFileName:
                        UpdateAssets(videoPath + '\\' + currentParam, FileType.video);

                        break;
                    case InlayHintType.Chapter:
                        UpdateAssets(scriptPath + '\\' + currentParam, FileType.script);

                        break;

                    default:
                        break;
                }
            });

        // update display
        progress.report({ increment: 10, message: "Creating scripts..." });

        // And set its HTML content
        progress.report({ increment: 10, message: "Generating webview..." });
        assetsListPanel.webview.html = assetList_getWebviewContent(assets);

        // done
        progress.report({ increment: 0, message: "Done" });

        return;
    });
};

export let jumpFlowPanel: vscode.WebviewPanel;
export interface NodeInfo {
    type: InlayHintType,
    script: string,
    lineNumber: number
};

// TODO not finished yet
export const commandShowJumpFlow_impl = async () => {
    // wait for file refresh
    if (!fileListInitialized) {
        vscode.window.showInformationMessage('Waiting for file scanning complete');
    }

    do {
        await sleep(50);
    } while (!fileListInitialized);

    vscode.window.withProgress({
        // location: vscode.ProgressLocation.Notification,
        location: vscode.ProgressLocation.Window,
        title: "Generating jump flows...\t",
        cancellable: false
    }, async (progress, token) => {
        // close old ones
        progress.report({ increment: 0, message: "Closing tab..." });

        if (jumpFlowPanel !== undefined) {
            jumpFlowPanel.dispose();
        }

        jumpFlowPanel = vscode.window.createWebviewPanel(
            'JumpFlow', // Identifies the type of the webview. Used internally
            'Jump Flow', // Title of the panel displayed to the user
            vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
            {
                enableScripts: true
                , enableForms: true
                , enableCommandUris: true
                , localResourceRoots: [vscode.Uri.file(basePath)]
            } // Webview options. More on these later.
        );

        // generate jump flow
        progress.report({ increment: 80, message: "Parsing scripts..." });

        // [node, jump to index]
        let jumpTable: [NodeInfo, number][] = [];
        let curLabelJumpMap: Map<string, number>;

        await iterateScripts(
            (script: string, document: vscode.TextDocument) => {
                curLabelJumpMap = getLabelJumpMap(document);
            },
            (initScript: string
                , script: string, lineNumber: number
                , currentType: InlayHintType, currentParam: string) => {
                let cur: NodeInfo = { type: currentType, script: script, lineNumber: lineNumber };
                let target: NodeInfo = { type: currentType, script: script, lineNumber: -1 };

                let cmp = (l: [NodeInfo, number], r: [NodeInfo, number]) => {
                    return l[0].type === r[0].type
                        && l[0].script === r[0].script;
                };

                let updateNodes = () => {
                    let targetIndexInArray = jumpTable.uniquePushIf([target, -1], cmp);
                    let curIndexInArray = jumpTable.uniquePushIf([cur, targetIndexInArray], cmp);

                    jumpTable[curIndexInArray][0] = cur;
                    jumpTable[curIndexInArray][1] = targetIndexInArray;
                };

                switch (currentType) {
                    case InlayHintType.Label: {
                        const labelTarget = curLabelJumpMap.get(currentParam);

                        if (labelTarget === undefined) {
                            break;
                        }

                        cur.script = cur.script + " Label at " + lineNumber.toString();

                        target.script = target.script + " Label at " + labelTarget.toString();
                        target.lineNumber = labelTarget;

                        updateNodes();

                        break;
                    }
                    case InlayHintType.Frame: {
                        cur.script = cur.script + " Frame jump";

                        target.script = "Frame " + currentParam;

                        updateNodes();

                        break;
                    }
                    case InlayHintType.Chapter: {
                        cur.script = cur.script + " Chapter jump";

                        target.script = currentParam + " Chapter jump";

                        updateNodes();

                        break;
                    }

                    default:
                        break;
                }
            });

        // update display
        progress.report({ increment: 10, message: "Creating scripts..." });


        // And set its HTML content
        progress.report({ increment: 10, message: "Generating webview..." });
        jumpFlowPanel.webview.html = jumpFlow_getWebviewContent(jumpTable);

        // done
        progress.report({ increment: 0, message: "Done" });

        return;
    });
};

export const commandReplaceScript_impl = async () => {
    vscode.window.withProgress({
        // location: vscode.ProgressLocation.Notification,
        location: vscode.ProgressLocation.Window,
        title: "Replacing Script...\t",
        cancellable: false
    }, async (progress, token) => {
        interface ReplacePair {
            "regex": string;
            "repStr": string;
        }

        let regexArray: ReplacePair[] = vscode.workspace.getConfiguration().get<ReplacePair[]>(confReplaceScript, []);
        let bEmpty = regexArray.empty();

        if (bEmpty) {
            return;
        }

        if (activeEditor === undefined) {
            return;
        }

        const document = activeEditor.document;

        if (document === undefined) {
            return;
        }

        vscode.languages.setTextDocumentLanguage(document, 'AvgScript');

        let count = 0;
        let increase = 100 / regexArray.length;

        const editOptions = { undoStopBefore: false, undoStopAfter: false };

        for (let item of regexArray) {
            progress.report({ increment: increase, message: "Replacing " + item.regex + " by " + item.repStr });

            const regex: RegExp = new RegExp(item.regex);
            const repStr: string = item.repStr;

            for (let i = 0; i < document.lineCount; ++i) {
                const line = document.lineAt(i);

                if (!line.isEmptyOrWhitespace) {
                    let range = new vscode.Range(i, 0, i, line.text.length);
                    let repResult = line.text.replace(regex, repStr);

                    if (repResult !== line.text) {
                        await activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
                            editBuilder.replace(range, repResult);
                        }, editOptions);

                        count++;
                    }
                }
            }
        }

        await activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.insert(new vscode.Position(0, 0), "// #Settings=\n\n");
        }, editOptions);

        await activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.insert(new vscode.Position(document.lineCount, 0), "\n\n\n#JmpCha=NextChapter\n\n#EOF");
        }, editOptions);

        // done
        progress.report({ increment: 0, message: "Done" });

        vscode.window.showInformationMessage('Replace complete');

        return;
    });
};

export const commandAppendDialogue_impl = async () => {
    if (!activeEditor) {
        return undefined;
    }

    let document = activeEditor.document;

    if (!document) {
        return undefined;
    }

    const cursor = activeEditor.selection.active;
    const documentLineAt = document.lineAt(cursor.line);
    const documentLineLength = documentLineAt.text.length;

    let [line, lineStart, linePrefix, curPos, lineRaw] = currentLineNotComment(document, cursor);

    if (line === undefined) {
        return undefined;
    }

    const spaceLength = documentLineLength - lineRaw!.length;
    let indentString: string = "";

    for (let i = 0; i < spaceLength; i++) {
        indentString += " ";
    }

    // normal text
    if (currentLineDialogue(line)) {
        const dialogueStruct = parseDialogue(line, lineRaw!);

        const curLineNew = lineRaw!.substring(0, linePrefix!.length);
        let nextLine = lineRaw!.substring(linePrefix!.length);

        nextLine = "$" + dialogueStruct.m_namePartRaw + ":&" + nextLine;

        const editOptions = { undoStopBefore: false, undoStopAfter: false };
        await activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(new vscode.Range(cursor.line, 0
                , cursor.line, documentLineLength)
                , indentString + curLineNew);
            editBuilder.insert(new vscode.Position(cursor.line + 1, 0), indentString + nextLine);
        }, editOptions);

        return;
    }

    vscode.window.showInformationMessage('Current line is not dialogue');
    return undefined;
};

export let formatHintPanel: vscode.WebviewPanel;
export const commandShowDialogueFormatHint_impl = async () => {
    if (formatHintPanel !== undefined) {
        formatHintPanel.dispose();
    }

    formatHintPanel = vscode.window.createWebviewPanel(
        'FormatHint', // Identifies the type of the webview. Used internally
        'Format Hint', // Title of the panel displayed to the user
        vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
        {
            enableScripts: true
            , enableForms: true
            , enableCommandUris: true
            , localResourceRoots: [vscode.Uri.file(basePath)]
        } // Webview options. More on these later.
    );

    formatHintPanel.webview.html = formatHint_getFormatControlContent();
};
