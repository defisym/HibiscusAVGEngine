import * as vscode from 'vscode';
import { commandRefreshAssets } from './command';

// let watcherInitialized = false;
// let watcher = updateWatcherCore();

export function updateWatcher() {
    // watcher = updateWatcherCore();
}

// function updateWatcherCore() {
//     if (watcherInitialized) {
//         watcher.dispose();
//     }

//     if (basePath !== undefined) {
//         let u = vscode.Uri.file(basePath);
//         let p = new vscode.RelativePattern(vscode.Uri.file(basePath), '**/{*, *.*}');

//         let w = basePath;
//     }

//     const ret = basePath === undefined
//         ? vscode.workspace.createFileSystemWatcher('**'
//             , false, false, false)
//         : vscode.workspace.createFileSystemWatcher(
//             new vscode.RelativePattern(vscode.Uri.file(basePath), '**')
//             , false, false, false
//         );

//     watcherInitialized = true;

//     return ret;
// }

// watcher.onDidChange(uri => {
//     vscode.commands.executeCommand(commandRefreshAssets);
// });
// watcher.onDidCreate(uri => {
//     vscode.commands.executeCommand(commandRefreshAssets);
// });
// watcher.onDidDelete(uri => {
//     vscode.commands.executeCommand(commandRefreshAssets);
// });

vscode.workspace.onDidCreateFiles(event => {
    vscode.commands.executeCommand(commandRefreshAssets);
});
vscode.workspace.onDidDeleteFiles(event => {
    vscode.commands.executeCommand(commandRefreshAssets);
});
vscode.workspace.onDidRenameFiles(event => {
    vscode.commands.executeCommand(commandRefreshAssets);
});