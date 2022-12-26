/* eslint-disable @typescript-eslint/naming-convention */

import * as vscode from 'vscode';

import { activeEditor, } from '../extension';
import { docList, keywordList, ParamFormat, ParamTypeMap, inlayHintMap, commandParamList, sharpKeywordList, commandDocList, atKeywordList } from '../lib/dict';
import { refreshFileDiagnostics, updateDiagnostics } from './diagnostic';
import { basePath, updateFileList, fileListInitialized, updateBasePath } from './file';

// config
export const confBasePath: string = "conf.AvgScript.basePath";
export const confCommandExt: string = "conf.AvgScript.commandExtension";

// command
export const commandBasePath: string = "config.AvgScript.basePath";
export const commandRefreshAssets: string = "config.AvgScript.refreshAssets";
export const commandUpdateCommandExtension: string = "config.AvgScript.updateCommandExtension";

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
        return;
    }

    let insertCommandExt = (commandExtItem: CommandExt, commandList: string[], commandDocList: docList,) => {
        let command = commandExtItem.command;

        commandList.push(command);
        keywordList.push(command);

        let paramFormat: ParamFormat = { minParam: 0, maxParam: 0, type: [], inlayHintType: [] };

        paramFormat.minParam = Math.max(0, commandExtItem.minParam);
        paramFormat.maxParam = Math.max(paramFormat.minParam, commandExtItem.maxParam);

        for (let type in commandExtItem.paramType) {
            paramFormat.type.push(ParamTypeMap.get(commandExtItem.paramType[type])!);
        }

        let inlayHints = commandExtItem.inlayHint;

        if (inlayHints !== undefined) {
            for (let hints in inlayHints) {
                let pos = inlayHintMap.size;
                inlayHintMap.set(pos, inlayHints[hints]);
                paramFormat.inlayHintType?.push(pos);
            }
        }

        commandParamList.set(command, paramFormat);

        let description = commandExtItem.description;

        if (description !== undefined) {
            commandDocList.set(command, description);
        }
    };

    for (let i in commandExt!) {
        if (commandExt[i].prefix === "#") {
            insertCommandExt(commandExt[i], sharpKeywordList, commandDocList);
        } else if (commandExt[i].prefix === "@") {
            insertCommandExt(commandExt[i], atKeywordList, commandDocList);
        }
    }

    if (activeEditor === undefined) {
        return;
    }

    let activeDocument = activeEditor.document;

    updateDiagnostics(activeDocument, fileListInitialized);
};