import * as vscode from 'vscode';

export const drop = vscode.languages.registerDocumentDropEditProvider('AvgScript', {
	provideDocumentDropEdits(document: vscode.TextDocument, position: vscode.Position, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentDropEdit> {
		const dataTransferItem = dataTransfer.get('text/plain');
		
		return undefined;
	}
});
