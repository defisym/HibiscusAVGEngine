/* eslint-disable @typescript-eslint/naming-convention */

import * as vscode from 'vscode';

import { activeEditor, } from '../extension';
import { ParamInfo, ParamTypeMap, inlayHintMap, commandInfoList, generateList, resetList, InlayHintType } from '../lib/dict';
import { arrayUniquePush, FileType, getAllParams, getMapValue, iterateLines, sleep } from '../lib/utilities';
import { assetList_getWebviewContent } from '../webview/assetList';
import { refreshFileDiagnostics, updateDiagnostics } from './diagnostic';
import { basePath, updateFileList, fileListInitialized, updateBasePath, projectConfig, scriptPath, graphicCharactersPath, videoPath, audioBgmPath, audioBgsPath, audioDubsPath, audioSEPath, graphicCGPath, graphicPatternFadePath, graphicUIPath } from './file';

// config
export const confBasePath: string = "conf.AvgScript.basePath";
export const confCommandExt: string = "conf.AvgScript.commandExtension";

// command
export const commandBasePath: string = "config.AvgScript.basePath";
export const commandRefreshAssets: string = "config.AvgScript.refreshAssets";
export const commandUpdateCommandExtension: string = "config.AvgScript.updateCommandExtension";
export const commandGetAssetsList: string = "config.AvgScript.getAssetsList";

export const commandBasePath_impl = async () => {
    // 1) Getting the value
    let oldBasePath = vscode.workspace.getConfiguration().get<string>(confBasePath, "");

    const value = await vscode.window.showInputBox({
        value: oldBasePath,
        prompt: "Base path for the assets files"
    });

    if (value !== undefined
        && value !== oldBasePath) {
        // 2) Get the configuration
        const configuration = vscode.workspace.getConfiguration();

        // 3) Get the current value
        //const currentValue = configuration.get<{}>(confBasePath);

        // 4) Update the value in the User Settings
        if (value.endsWith("\\")) {
            updateBasePath(value.substring(0, value.length - 1));
        } else {
            updateBasePath(value);
        }

        await configuration.update(confBasePath
            , basePath
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
    }
};

export const commandRefreshAssets_impl = async () => {
    updateBasePath(vscode.workspace.getConfiguration().get<string>(confBasePath, ""));

    if (basePath === "") {
        vscode.commands.executeCommand(commandBasePath);
    }

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

            for (let type in paramType) {
                paramInfo.type.push(ParamTypeMap.get(paramType[type])!);
            }

            let inlayHints = commandExtItem.inlayHint;

            if (inlayHints !== undefined) {
                for (let hints in inlayHints) {
                    let pos = inlayHintMap.size;
                    inlayHintMap.set(pos, inlayHints[hints]);
                    paramInfo.inlayHintType?.push(pos);
                }
            }

            commandInfoList.set(command, paramInfo);
        };

        for (let i in commandExt!) {
            insertCommandExt(commandExt[i]);
        }
    } while (0);

    // update list
    generateList();

    // update diagnostic
    if (activeEditor === undefined) {
        return;
    }

    let activeDocument = activeEditor.document;
    updateDiagnostics(activeDocument, fileListInitialized);
};

export let assetsListPanel: vscode.WebviewPanel;
export interface RefInfo {
    type: FileType[];
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

    // close old ones
    if (assetsListPanel !== undefined) {
        assetsListPanel.dispose();
    }

    // get settings
    let initSettings: string = projectConfig.System.Initial_AVG;
    let initScript = initSettings.substring(initSettings.lastIndexOf('\\') + 1);

    // generate ref list
    let scripts: string[] = [initScript];
    let assets = new Map<string, RefInfo>();

    let praseScript = async (scripts: string[]) => {
        let referredScripts: string[] = [];

        for (let script of scripts) {
            let filePath = scriptPath + '\\' + script;

            if (filePath.substring(filePath.length - 4).toLowerCase() !== '.asc') {
                filePath += '.asc';
            }

            let document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));

            iterateLines(document, (text, lineNumber
                , lineStart, lineEnd
                , firstLineNotComment) => {
                const params = getAllParams(text);
                const command = params[0].substring(1);

                let commandInfo = getMapValue(command, commandInfoList);

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
                    let suffixStart = currentParam.lastIndexOf('.');

                    if (suffixStart !== -1) {
                        currentParam = currentParam.substring(0, suffixStart);
                    }

                    let UpdateAssets = (fileName: string, fileType: FileType) => {
                        let refInfo = assets.get(fileName);

                        if (refInfo === undefined) {
                            assets.set(fileName
                                , {
                                    type: []
                                    , refCount: 0
                                    , refScript: new Map<string, number[]>()
                                });
                        }

                        refInfo = assets.get(fileName)!;

                        // ref count
                        refInfo.refCount++;

                        // ref type
                        arrayUniquePush(refInfo.type, fileType);

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
                            referredScripts.push(currentParam);
                            UpdateAssets(scriptPath + '\\' + currentParam, FileType.script);

                            break;

                        default:
                            break;
                    }
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

    // update display
    assetsListPanel = vscode.window.createWebviewPanel(
        'AssetList', // Identifies the type of the webview. Used internally
        'Asset List', // Title of the panel displayed to the user
        vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
        {
            enableScripts: true
            , enableForms: true
        } // Webview options. More on these later.
    );

    // And set its HTML content
    assetsListPanel.webview.html = assetList_getWebviewContent(assets);

    return;
};