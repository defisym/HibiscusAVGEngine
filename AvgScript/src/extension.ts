import * as vscode from 'vscode';

import { colorProvider } from './functions/color';
import { assetsListPanel, commandAppendDialogue, commandAppendDialogue_impl, commandBasePath, commandBasePath_impl, commandDeleteDub, commandDeleteDub_impl, commandGetAssetsList, commandGetAssetsList_impl, commandGetDubList, commandGetDubList_impl, commandRefreshAssets, commandRefreshAssets_impl, commandReplaceScript, commandReplaceScript_impl, commandShowDialogueFormatHint, commandShowDialogueFormatHint_impl, commandShowHibiscusDocument, commandShowHibiscusDocument_impl, commandShowJumpFlow, commandShowJumpFlow_impl, commandUpdateCommandExtension, commandUpdateCommandExtension_impl, commandUpdateDub, commandUpdateDub_impl, dubListPanel, formatHintPanel, jumpFlowPanel } from './functions/command';
import { atCommands, fileName, fileSuffix, langPrefix, required, settingsParam, sharpCommands } from './functions/completion';
import { debuggerFactory, debuggerProvider, debuggerTracker } from './functions/debugger';
import { diagnosticUpdate, diagnosticsCollection } from './functions/diagnostic';
import { fileDefinition } from './functions/file';
import { hover, hoverFile } from './functions/hover';
import { inlayHint } from './functions/inlayHint';
import { labelDefinition, labelReference, parseLabel, removeLabelCache } from './functions/label';
import { outline } from './functions/outline';
import { rename } from './functions/rename';

// must import to make extensions enabled
import './extensions/_include';
import { codeLensProvider } from './functions/codeLens';
import { drop } from './functions/drop';
import { formatting } from './functions/formatting';
import { previewer } from './functions/preview';
import { throttle } from './lib/throttle';
import { parseLineComment, removeLineCommentCache } from './lib/utilities';

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
	// File Updated
	//--------------------

	throttle.addCallback(() => {
		diagnosticUpdate();
	});

	throttle.triggerCallback(() => { }, true);

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (!editor) { return; }

		throttle.triggerCallback(() => {
			previewer.docUpdated();			
			parseLineComment(editor.document);
			parseLabel(editor.document);
		});
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		throttle.triggerCallback(() => {
			parseLineComment(event.document);
			parseLabel(event.document);
		}, true);
	}, null, context.subscriptions);

	vscode.workspace.onDidOpenTextDocument((event) => {
		const document = event;
	}, null, context.subscriptions);
	vscode.workspace.onDidCloseTextDocument(document => {
		diagnosticsCollection.delete(document.uri);
		removeLineCommentCache(document);
		removeLabelCache(document);
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