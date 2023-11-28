import * as vscode from 'vscode';

import { commandInfoList, InlayHintType } from '../lib/dict';
import { iterateLines } from "../lib/iterateLines";
import { regexRep } from '../lib/regExp';
import { currentLineNotComment, getAllParams } from "../lib/utilities";

// export let labelCompletions: vscode.CompletionItem[] = [];
// export let labelJumpMap: Map<string, number> = new Map();

class LabelInfo {
	labelCompletions: vscode.CompletionItem[] = [];
	labelJumpMap: Map<string, number> = new Map();
}

export let labelCache: Map<vscode.TextDocument, LabelInfo> = new Map();

export function parseLabel(document: vscode.TextDocument) {
	console.log("prase label :" + document.fileName);

	removeLabelCache(document);
	labelCache.set(document, new LabelInfo());

	const curCache = labelCache.get(document)!;

	iterateLines(document, (text, lineNumber
		, lineStart, lineEnd
		, firstLineNotComment) => {
		if (text.matchStart(/(;.*)/gi)) {
			let label = text.substring(text.indexOf(";") + 1);
			let item: vscode.CompletionItem = new vscode.CompletionItem({
				label: label
				// , detail: fileNameSuffix
				, description: "at line " + lineNumber
			});

			item.kind = vscode.CompletionItemKind.Reference;

			item.insertText = label;

			curCache.labelCompletions.push(item);
			curCache.labelJumpMap.set(label, lineNumber);
		}
	});
}

export function removeLabelCache(document: vscode.TextDocument) {
	labelCache.delete(document);
}

export function getLabelCache(document: vscode.TextDocument) {
	let curCache = labelCache.get(document);

	if (curCache === undefined) {
		parseLabel(document);
	}

	curCache = labelCache.get(document)!;

	return curCache;
}

export function getLabelPos(document: vscode.TextDocument, input: string) {
	let curCache = getLabelCache(document);

	for (let i = 0; i < curCache.labelCompletions.length; i++) {
		let label = curCache.labelCompletions[i].label;

		if (typeof label === "string") {
			if (label.iCmp(input)) {
				return i;
			}
		}
		else {
			if (label.label.iCmp(input)) {
				return i;
			}
		}
	}

	return -1;
}

export function getLabelComment(document: vscode.TextDocument, input: string) {
	let curCache = getLabelCache(document);

	for (let labelCompletion of curCache.labelCompletions) {
		let label = labelCompletion.label;
		if (typeof label === "string") {
			if (label.iCmp(input)) {
				return label;
			}
		}
		else {
			if (label.label.iCmp(input)) {
				return label.label + "\t" + label.description;
			}
		}
	}

	return "标签不存在";
}

export function getLabelJumpMap(document: vscode.TextDocument) {
	let curCache = getLabelCache(document);

	return curCache.labelJumpMap;
}

export const labelDefinition = vscode.languages.registerDefinitionProvider('AvgScript',
	{
		provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
			let definitions: vscode.Location[] = [];

			let [line, lineStart, curLinePrefix, curPos] = currentLineNotComment(document, position);

			if (line === undefined) {
				return undefined;
			}

			const params = getAllParams(line);
			const paramNum = params.length - 1;

			if (line.startsWith("#")
				|| line.startsWith("@")) {
				const command = params[0].substring(1);
				const paramDefinition = commandInfoList.getValue(command);

				if (paramDefinition === undefined) {
					return;
				}

				const paramFormat = paramDefinition.inlayHintType;

				if (paramFormat === undefined) {
					return;
				}

				let contentStart: number = lineStart! + command.length + 1;

				for (let j = 1; j < params.length; j++) {
					let curParam = params[j];
					let currentType = paramFormat[j - 1];

					contentStart++;

					if (curParam.match(regexRep)) {
						continue;
					}

					if (currentType === InlayHintType.Label) {
						let curLabel = curParam;

						let curCache = getLabelCache(document);
						curCache.labelJumpMap.forEach((line, label) => {
							if (curLabel.iCmp(label)) {
								let link = new vscode.Location(document.uri
									, new vscode.Position(line, 0));

								definitions.push(link);
							}
						});
					}

					contentStart += curParam.length;
				}
			}

			return definitions;
		}
	});

export const labelReference = vscode.languages.registerReferenceProvider(
	'AvgScript', {
	provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken) {
		let references: vscode.Location[] = [];

		let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

		if (line === undefined) {
			return undefined;
		}

		if (line[0] !== ';') {
			return undefined;
		}

		let label = line.substring(line.indexOf(";") + 1);

		iterateLines(document, (text, lineNumber
			, lineStart, lineEnd
			, firstLineNotComment) => {
			const params = getAllParams(text);
			const paramNum = params.length - 1;

			if (text.startsWith("#")
				|| text.startsWith("@")) {
				const command = params[0].substring(1);
				const paramDefinition = commandInfoList.getValue(command);

				if (paramDefinition === undefined) {
					return;
				}

				const paramFormat = paramDefinition.inlayHintType;

				if (paramFormat === undefined) {
					return;
				}

				let contentStart: number = lineStart + command.length + 1;

				for (let j = 1; j < params.length; j++) {
					let curParam = params[j];
					let currentType = paramFormat[j - 1];

					contentStart++;

					if (curParam.match(regexRep)) {
						continue;
					}

					if (currentType === InlayHintType.Label) {
						if (curParam.iCmp(label)) {
							let link = new vscode.Location(document.uri
								, new vscode.Position(lineNumber, 0));

							references.push(link);
						}
					}

					contentStart += curParam.length;
				}
			}
		});

		return references;
	}
});