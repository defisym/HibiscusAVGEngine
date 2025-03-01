import * as vscode from 'vscode';

import { colorProvider } from './functions/color';
import { assetsListPanel, commandAppendDialogue, commandAppendDialogue_impl, commandBasePath, commandBasePath_impl, commandDeleteDub, commandDeleteDub_impl, commandGetAssetsList, commandGetAssetsList_impl, commandGetDubList, commandGetDubList_impl, commandPasteDub, commandPasteDub_impl, commandRefreshAssets, commandRefreshAssets_impl, commandReplaceScript, commandReplaceScript_impl, commandShowDialogueFormatHint, commandShowDialogueFormatHint_impl, commandShowHibiscusDocument, commandShowHibiscusDocument_impl, commandShowJumpFlow, commandShowJumpFlow_impl, commandUpdateCommandExtension, commandUpdateCommandExtension_impl, commandUpdateDub, commandUpdateDub_impl, dubListPanel, formatHintPanel, jumpFlowPanel } from './functions/command';
import { atCommands, fileName, fileSuffix, langPrefix, required, settingsParam, sharpCommands } from './functions/completion';
import { debuggerFactory, debuggerProvider, debuggerTracker } from './functions/debugger';
import { diagnosticThrottle, diagnosticsCollection } from './functions/diagnostic';
import { fileDefinition } from './functions/file';
import { hover, hoverFile } from './functions/hover';
import { inlayHint } from './functions/inlayHint';
import { labelCache, labelDefinition, labelReference } from './functions/label';
import { outline } from './functions/outline';
import { rename } from './functions/rename';

// must import to make extensions enabled
import './extensions/_include';
import { codeLensProvider } from './functions/codeLens';
import { drop } from './functions/drop';
import { formatting } from './functions/formatting';
import { previewer } from './functions/preview';
import { rangeSemanticProvider, semanticProvider } from './functions/semantic';
import { lineCommentCache } from './lib/comment';
import { throttle } from './lib/throttle';

export let activeEditor = vscode.window.activeTextEditor;
export const outputChannel = vscode.window.createOutputChannel('AvgScript');

export async function activate(context: vscode.ExtensionContext) {
	//--------------------
	// Debug
	//--------------------

	console.log("AvgScript extension activated");

	context.subscriptions.push(debuggerProvider);
	context.subscriptions.push(debuggerFactory);
	context.subscriptions.push(debuggerTracker);

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
	vscode.commands.registerCommand(commandShowHibiscusDocument, commandShowHibiscusDocument_impl);
	vscode.commands.registerCommand(commandGetDubList, commandGetDubList_impl);

	vscode.commands.registerCommand(commandUpdateDub, commandUpdateDub_impl);
	vscode.commands.registerCommand(commandDeleteDub, commandDeleteDub_impl);
	vscode.commands.registerCommand(commandPasteDub, commandPasteDub_impl);

	//--------------------
	// Init Command
	//--------------------

	// make sure command info list is valid
	await vscode.commands.executeCommand(commandUpdateCommandExtension, false);
	vscode.commands.executeCommand(commandRefreshAssets);

	//--------------------
	// Completion
	//--------------------

	context.subscriptions.push(sharpCommands, atCommands
		, settingsParam
		, langPrefix
		, fileSuffix
		, fileName
		, required);

	//--------------------
	// Formatting
	//--------------------

	context.subscriptions.push(formatting);

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
	// Code Lens
	//--------------------

	context.subscriptions.push(codeLensProvider);

	//--------------------
	// Drag & drop
	//--------------------

	context.subscriptions.push(drop);

	//--------------------
	// Semantic
	//--------------------

	context.subscriptions.push(rangeSemanticProvider);
	context.subscriptions.push(semanticProvider);

	//--------------------
	// File Updated
	//--------------------

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (!editor) { return; }

		previewer.docUpdated();

		throttle.triggerCallback(() => {
			// console.log("trigger parse :" + editor.document.fileName);
		});
		diagnosticThrottle.triggerCallback();
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		// console.log("doc changed");

		// put it here to let content that need exact update
		// e.g., completion
		lineCommentCache.updateDocumentCache(event.document, event.contentChanges);
		labelCache.updateDocumentCache(event.document, event.contentChanges);

		throttle.triggerCallback(() => {
			// console.log("trigger throttle parse :" + event.document.fileName);
		}, true);
		diagnosticThrottle.triggerCallback(() => { }, true);
	}, null, context.subscriptions);

	vscode.workspace.onDidOpenTextDocument((event) => {
		const document = event;
	}, null, context.subscriptions);
	vscode.workspace.onDidCloseTextDocument(document => {
		lineCommentCache.removeDocumentCache(document);
		labelCache.removeDocumentCache(document);

		diagnosticsCollection.delete(document.uri);
	}, null, context.subscriptions);
	vscode.workspace.onDidSaveTextDocument(document => {
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

	if (jumpFlowPanel !== undefined) {
		jumpFlowPanel.dispose();
	}

	if (formatHintPanel !== undefined) {
		formatHintPanel.dispose();
	}

	if (dubListPanel !== undefined) {
		dubListPanel.dispose();
	}
}