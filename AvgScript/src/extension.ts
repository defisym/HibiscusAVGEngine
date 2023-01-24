import * as vscode from 'vscode';

import { colorProvider } from './functions/color';
import { assetsListPanel, commandAppendDialogue, commandAppendDialogue_impl, commandBasePath, commandBasePath_impl, commandGetAssetsList, commandGetAssetsList_impl, commandRefreshAssets, commandRefreshAssets_impl, commandReplaceScript, commandReplaceScript_impl, commandShowDialogueFormatHint, commandShowDialogueFormatHint_impl, commandShowJumpFlow, commandShowJumpFlow_impl, commandUpdateCommandExtension, commandUpdateCommandExtension_impl } from './functions/command';
import { atCommands, fileName, fileSuffix, langPrefix, settingsParam, sharpCommands } from './functions/completion';
import { debuggerFactory, debuggerProvider } from './functions/debugger';
import { diagnosticsCollection, onUpdate, triggerUpdate } from './functions/diagnostic';
import { fileDefinition } from './functions/file';
import { hover, hoverFile } from './functions/hover';
import { inlayHint } from './functions/inlayHint';
import { labelDefinition, labelReference } from './functions/label';
import { outline } from './functions/outline';
import { rename } from './functions/rename';

// must import to make extensions enabled
import './extensions/_include';

export let activeEditor = vscode.window.activeTextEditor;

export async function activate(context: vscode.ExtensionContext) {
	//--------------------
	// Debug
	//--------------------

	console.log("AvgScript extension activated");

	context.subscriptions.push(debuggerProvider);
	context.subscriptions.push(debuggerFactory);

	//--------------------
	// Command
	//--------------------

	vscode.commands.registerCommand(commandBasePath, commandBasePath_impl);
	vscode.commands.registerCommand(commandRefreshAssets, commandRefreshAssets_impl);
	vscode.commands.registerCommand(commandUpdateCommandExtension, commandUpdateCommandExtension_impl);
	vscode.commands.registerCommand(commandGetAssetsList, commandGetAssetsList_impl);
	vscode.commands.registerCommand(commandShowJumpFlow, commandShowJumpFlow_impl);
	vscode.commands.registerCommand(commandReplaceScript, commandReplaceScript_impl);

	vscode.commands.registerCommand(commandAppendDialogue, commandAppendDialogue_impl);
	vscode.commands.registerCommand(commandShowDialogueFormatHint, commandShowDialogueFormatHint_impl);

	//--------------------
	// Init Command
	//--------------------

	vscode.commands.executeCommand(commandUpdateCommandExtension);
	vscode.commands.executeCommand(commandRefreshAssets);

	//--------------------
	// Completion
	//--------------------

	context.subscriptions.push(sharpCommands, atCommands
		, settingsParam
		, langPrefix
		, fileSuffix
		, fileName);

	//--------------------
	// Inlay Hint
	//--------------------

	context.subscriptions.push(inlayHint);

	//--------------------
	// Hover
	//--------------------

	context.subscriptions.push(hover, hoverFile);

	//--------------------
	// Color
	//--------------------

	context.subscriptions.push(colorProvider);

	//--------------------
	// Goto Definition
	//--------------------

	context.subscriptions.push(labelDefinition
		, fileDefinition);

	//--------------------
	// Get Reference
	//--------------------

	context.subscriptions.push(labelReference);

	//--------------------
	// Rename
	//--------------------

	context.subscriptions.push(rename);

	//--------------------
	// Outline
	//--------------------

	context.subscriptions.push(outline);

	//--------------------
	// Diagnostic
	//--------------------

	context.subscriptions.push(diagnosticsCollection);

	//--------------------
	// File Updated
	//--------------------

	onUpdate();

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdate();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdate(true);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidCloseTextDocument(document => {
		if (activeEditor && document === activeEditor.document) {
			triggerUpdate(true);
		}
	}, null, context.subscriptions);
}

export function deactivate() {
	//--------------------
	// Debug
	//--------------------

	console.log("AvgScript extension deactivating");

	//--------------------
	// Webview
	//--------------------

	if (assetsListPanel !== undefined) {
		assetsListPanel.dispose();
	}
}