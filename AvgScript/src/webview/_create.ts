import * as vscode from 'vscode';

import { basePath } from '../functions/file';

export function createWebviewPanel(viewType: string, title: string, viewColumn: vscode.ViewColumn) {
	return vscode.window.createWebviewPanel(
		viewType, // Identifies the type of the webview. Used internally
		title, // Title of the panel displayed to the user
		viewColumn, // Editor column to show the new webview panel in.
		{
			// webview options
			enableScripts: true
			, enableForms: true
			, enableCommandUris: true
			, localResourceRoots: [vscode.Uri.file(basePath)]

			// webview panel options
			, enableFindWidget: true
			, retainContextWhenHidden: true
		} // Webview options. More on these later.
	);
}
export function closeWebviewPanel(panel: vscode.WebviewPanel) {
	vscode.window.showInformationMessage('User closed webview ' + panel.title);
}