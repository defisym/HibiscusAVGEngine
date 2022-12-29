import * as vscode from 'vscode';

import { labelDefinition, labelReference } from './functions/label';
import { hover, hoverFile } from './functions/hover';
import { inlayHint } from './functions/inlayHint';
import { diagnosticsCollection, onUpdate, triggerUpdate } from './functions/diagnostic';
import { assetsListPanel, commandBasePath, commandBasePath_impl, commandGetAssetsList, commandGetAssetsList_impl, commandRefreshAssets, commandRefreshAssets_impl, commandShowJumpFlow, commandShowJumpFlow_impl, commandUpdateCommandExtension, commandUpdateCommandExtension_impl } from './functions/command';
import { outline } from './functions/outline';
import { rename } from './functions/rename';
import { atCommands, fileName, fileSuffix, langPrefix, settingsParam, sharpCommands } from './functions/completion';
import { colorProvider } from './functions/color';
import { fileDefinition } from './functions/file';

export let activeEditor = vscode.window.activeTextEditor;

export async function activate(context: vscode.ExtensionContext) {
	//--------------------
	// Debug
	//--------------------

	console.log("AvgScript extension activated");

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
	// Command
	//--------------------

	vscode.commands.registerCommand(commandBasePath, commandBasePath_impl);
	vscode.commands.registerCommand(commandRefreshAssets, commandRefreshAssets_impl);
	vscode.commands.registerCommand(commandUpdateCommandExtension, commandUpdateCommandExtension_impl);
	vscode.commands.registerCommand(commandGetAssetsList, commandGetAssetsList_impl);
	vscode.commands.registerCommand(commandShowJumpFlow, commandShowJumpFlow_impl);

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