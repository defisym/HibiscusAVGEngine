import * as vscode from 'vscode';
import { codeLensProviderClass } from './codeLens';
import { confAutoUpdate } from './command';
import { diagnosticThrottle } from './diagnostic';
import { addFile, basePath, fileListInitialized, removeFile } from './file';

let oldBasePath = '';

function getAutoUpdateState() {
	return vscode.workspace.getConfiguration().get<boolean>(confAutoUpdate, true);
}

enum FileOperation {
	create,
	delete,
};

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
	// both will be called, so do nothing here
	// watcher.onDidChange(uri => { });
	watcher.onDidCreate(async (uri) => {
		await watcherAction([uri], FileOperation.create);
	});
	watcher.onDidDelete(async uri => {
		await watcherAction([uri], FileOperation.delete);
	});
}

vscode.workspace.onDidCreateFiles(async event => {
	await watcherAction(event.files, FileOperation.create);
});
vscode.workspace.onDidDeleteFiles(async event => {
	await watcherAction(event.files, FileOperation.delete);
});
vscode.workspace.onDidRenameFiles(async event => {
	for (let file of event.files) {
		await watcherAction([file.oldUri], FileOperation.delete);
		await watcherAction([file.newUri], FileOperation.create);
	}
});

async function watcherAction(uris: readonly vscode.Uri[], opt: FileOperation) {
	if (!getAutoUpdateState()) {
		return;
	}

	if (!fileListInitialized) {
		return;
	}

	let bUpdated = false;

	for (const uri of uris) {
		const filePath = uri.fsPath;

		switch (opt) {
			case FileOperation.create: {
				const bResult = await addFile(filePath);
				bUpdated = bUpdated || bResult;

				break;
			}
			case FileOperation.delete: {
				const bResult = removeFile(filePath);
				bUpdated = bUpdated || bResult;

				break;
			}
		}
	}

	if (!bUpdated) { return; }

	codeLensProviderClass.refresh();
	diagnosticThrottle.triggerCallback(() => { }, true);
}