import * as vscode from 'vscode';

import { dubMapping } from '../lib/dubs';
import { fileListUpdating } from './file';

const uriListMime = 'text/uri-list';

export const drop = vscode.languages.registerDocumentDropEditProvider('AvgScript',
	{
		async provideDocumentDropEdits(document: vscode.TextDocument, position: vscode.Position, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<vscode.DocumentDropEdit | undefined> {
			if (fileListUpdating()) { return; }

			// MIME types
			// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
			const emptyDropEdit = new vscode.DocumentDropEdit("");
			const dataTransferItem = dataTransfer.get(uriListMime);

			if (!dataTransferItem) {
				return emptyDropEdit;
			}

			// Check if it's audio file dropped
			const audioMime = 'audio/';
			const audioMimeLen = audioMime.length;
			let it: number = -1;
			let idx: number = -1;

			dataTransfer.forEach((item: vscode.DataTransferItem, mimeType: string, dataTransfer: vscode.DataTransfer) => {
				// update iterator
				it++;

				// not audio
				if (mimeType.left(audioMimeLen) !== audioMime) {
					return;
				}

				// already exists
				if (idx !== -1) {
					return;
				}

				idx = it;
			});

			if (idx === -1) {
				vscode.window.showErrorMessage('Please drop a valid audio file');
				return emptyDropEdit;
			}

			// 'text/uri-list' contains a list of uris separated by new lines.
			// Parse this to an array of uris.
			const urlList = await dataTransferItem.asString();
			if (token.isCancellationRequested) {
				return emptyDropEdit;
			}

			const uris: vscode.Uri[] = [];
			for (const resource of urlList.split('\r\n')) {
				try {
					uris.push(vscode.Uri.parse(resource));
				} catch {
					// noop
				}
			}

			if (!uris.length) {
				vscode.window.showErrorMessage('No valid uri');
				return emptyDropEdit;
			}

			// remove slash
			const filePath = uris[idx].path.right(1);

			if (!dubMapping.updatePositionDub(document, position, filePath)) {
				vscode.window.showErrorMessage('Current line has no dub info');
			}

			return emptyDropEdit;
		}
	});
