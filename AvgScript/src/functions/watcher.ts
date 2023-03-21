import * as vscode from 'vscode';
import { commandRefreshAssets, confAutoUpdate } from './command';
import { basePath, fileListInitialized } from './file';

let oldBasePath = '';

function getAutoUpdateState() {
    return vscode.workspace.getConfiguration().get<boolean>(confAutoUpdate, true);
}

function watcherAction() {
    if (!getAutoUpdateState()) {
        return;
    }

    if (!fileListInitialized) {
        return;
    }

    vscode.commands.executeCommand(commandRefreshAssets);
}

export function updateWatcher() {
    if (!getAutoUpdateState()) {
        return;
    }

    if (basePath === undefined) {
        return;
    }

    if (oldBasePath.iCmp(basePath)) {
        return;
    }

    oldBasePath = basePath;

    let watcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(vscode.Uri.file(basePath), '**/*.*')
        // new vscode.RelativePattern(vscode.Uri.file(basePath.substring(0, basePath.length - '\\data'.length)), '**/*.*')
        , false, false, false
    );

    // rename -> create + delete
    // watcher.onDidChange(uri => {
    //     watcherAction();
    // });
    watcher.onDidCreate(uri => {
        watcherAction();
    });
    watcher.onDidDelete(uri => {
        watcherAction();
    });
}

vscode.workspace.onDidCreateFiles(event => {
    watcherAction();
});
vscode.workspace.onDidDeleteFiles(event => {
    watcherAction();
});
vscode.workspace.onDidRenameFiles(event => {
    watcherAction();
});