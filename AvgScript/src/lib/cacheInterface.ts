import * as vscode from 'vscode';

export interface CacheInterface<Cache> {
	parseDocument(document: vscode.TextDocument): void;

	removeDocumentCache(document: vscode.TextDocument): void;
	updateDocumentCache(document: vscode.TextDocument,
		change: readonly vscode.TextDocumentContentChangeEvent[]): void;
	getDocumentCache(document: vscode.TextDocument): Cache;
	clearDocumentCache(): void;
}