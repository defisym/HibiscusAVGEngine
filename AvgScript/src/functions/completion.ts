import * as vscode from 'vscode';

import { currentLineNotComment } from '../lib/comment';
import { atKeywordList, commandDocList, ParamType, settingsParamDocList, settingsParamList, sharpKeywordList } from '../lib/dict';
import { UpdateDubCompletion } from '../lib/dubs';
import { getSettings } from '../lib/settings';
import { FileType, getCommandParamFileType, getCompletionItemList, getSubStrings, lineValidForCommandCompletion, parseCommand } from '../lib/utilities';
import { codeLensProviderClass } from './codeLens';
import { animationCompletions, audioBgmCompletions, audioBgsCompletions, audioSECompletions, basePathUpdated, fileListInitialized, graphicCGCompletions, graphicCharactersCompletions, graphicPatternFadeCompletions, graphicUICompletions, scriptCompletions, videoCompletions } from './file';
import { extraInlayHintInfoInvalid, getExtraInlayHintInfo } from './inlayHint';
import { labelCache } from './label';

function completionValid(document: vscode.TextDocument, position: vscode.Position) {
	let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

	if (line === undefined) {
		return false;
	}

	if (!lineValidForCommandCompletion(linePrefix!)) {
		return false;
	}

	return true;
}

let sharpCompletionList: vscode.CompletionItem[] = [];

export function updateSharpCompletionList() {
	sharpCompletionList = getCompletionItemList(sharpKeywordList, commandDocList);
}

export const sharpCommands = vscode.languages.registerCompletionItemProvider(
	'AvgScript',
	{
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			if (!completionValid(document, position)) { return undefined; }

			return sharpCompletionList;
		}
	},
	'#' // triggered whenever a '#' is being typed
);

let atCompletionList: vscode.CompletionItem[] = [];

export function updateAtCompletionList() {
	atCompletionList = getCompletionItemList(atKeywordList, commandDocList);
}

export const atCommands = vscode.languages.registerCompletionItemProvider(
	'AvgScript',
	{
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			if (!completionValid(document, position)) { return undefined; }

			return atCompletionList;
		}
	},
	'@' // triggered whenever a '@' is being typed
);

export const settingsParam = vscode.languages.registerCompletionItemProvider(
	'AvgScript',
	{
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

			if (line === undefined) {
				return undefined;
			}

			if (!linePrefix!.startsWith('#Settings='.toLowerCase())) {
				return undefined;
			}

			// filter setting params that already exists
			let curParams = getSubStrings(line, ['=', '|']);
			let paramList: typeof settingsParamList = [];

			for (let param of settingsParamList) {
				if (!curParams.hasValue(param)) {
					paramList.push(param);
				}
			}

			return getCompletionItemList(paramList, settingsParamDocList);
		}
	},
	'=', '|'
);

export const langPrefix = vscode.languages.registerCompletionItemProvider(
	'AvgScript',
	{
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			const line = document.lineAt(position).text.trim().toLowerCase();

			if ("Lang".toLowerCase().includes(line)) {
				const snippetCompletion = new vscode.CompletionItem('Lang');
				snippetCompletion.insertText = new vscode.SnippetString('Lang[${1|ZH,EN,JP,FR,RU|}]');

				return [snippetCompletion];
			}

			return undefined;
		}
	},
);

export const fileSuffix = vscode.languages.registerCompletionItemProvider(
	'AvgScript',
	{
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

			if (line === undefined) {
				return undefined;
			}

			switch (getCommandParamFileType(linePrefix!)) {
				case FileType.inValid:
					return undefined;

				case FileType.characters:
				case FileType.ui:
				case FileType.cg:
				case FileType.patternFade:
					return [
						new vscode.CompletionItem('png', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('jpg', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('jpeg', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('bmp', vscode.CompletionItemKind.Method),
					];

				case FileType.bgm:
				case FileType.bgs:
				case FileType.dubs:
				case FileType.se:
					return [
						new vscode.CompletionItem('ogg', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('mp3', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('wav', vscode.CompletionItemKind.Method),
					];

				case FileType.video:
					return [
						new vscode.CompletionItem('mp4', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('avi', vscode.CompletionItemKind.Method),
					];

				case FileType.animation:
					return [
						new vscode.CompletionItem('json', vscode.CompletionItemKind.Method),
						new vscode.CompletionItem('jsonc', vscode.CompletionItemKind.Method)
					];

				case FileType.script:
				case FileType.frame:
				case FileType.label:
				default:
					return undefined;
			}
		}
	},
	'.'
);

export const fileName = vscode.languages.registerCompletionItemProvider(
	'AvgScript',
	{
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			if (!basePathUpdated) { return undefined; }

			let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

			if (line === undefined) { return undefined; }

			let returnCompletion = (completion: vscode.CompletionItem[]) => {
				if (!fileListInitialized) {
					let ret = new vscode.CompletionItem("Loading file list, please wait...");
					ret.preselect = true;
					ret.insertText = "";

					return [ret];
				} else {
					return completion;
				}
			};

			switch (getCommandParamFileType(linePrefix!)) {
				case FileType.inValid:
					return undefined;

				case FileType.characters:
					return returnCompletion(graphicCharactersCompletions);
				case FileType.ui:
					return returnCompletion(graphicUICompletions);
				case FileType.cg:
					return returnCompletion(graphicCGCompletions);
				case FileType.patternFade:
					return returnCompletion(graphicPatternFadeCompletions);

				case FileType.bgm:
					return returnCompletion(audioBgmCompletions);
				case FileType.bgs:
					return returnCompletion(audioBgsCompletions);
				case FileType.dubs: {
					const settings = getSettings(document);
					return returnCompletion(
						settings && settings.NoSideEffect
							? UpdateDubCompletion(codeLensProviderClass.dubState)
							: []);
				}
				case FileType.se:
					return returnCompletion(audioSECompletions);

				case FileType.video:
					return returnCompletion(videoCompletions);

				case FileType.animation:
					return returnCompletion(animationCompletions);

				case FileType.script:
					return returnCompletion(scriptCompletions);
				case FileType.frame:
				case FileType.label:
					let curCache = labelCache.getDocumentCache(document);
					return curCache.labelCompletions;

				default:
					return undefined;
			}
		}
	},
	'=', ':'
);

export const required = vscode.languages.registerCompletionItemProvider(
	'AvgScript',
	{
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

			if (line === undefined) {
				return undefined;
			}

			const { params, commandWithPrefix, command, paramInfo } = parseCommand(linePrefix!);

			if (paramInfo === undefined) {
				return undefined;
			}

			// special
			if (paramInfo.type[params.length - 1] === ParamType.Boolean) {
				return [
					new vscode.CompletionItem({ label: "On" }
						, vscode.CompletionItemKind.Keyword),
					new vscode.CompletionItem({ label: "Off" }
						, vscode.CompletionItemKind.Keyword)
				];
			}

			// normal
			const required = paramInfo.required;

			if (required === undefined) {
				return undefined;
			}

			const curRequire = required[params.length - 1];

			if (curRequire === undefined) {
				return undefined;
			}

			let ret: vscode.CompletionItem[] = [];

			let curID = 65535;

			for (let reqItem of curRequire) {
				curID++;

				let item: vscode.CompletionItem =
					new vscode.CompletionItem({ label: reqItem }
						, vscode.CompletionItemKind.Keyword);

				item.sortText = curID.toString();

				if (paramInfo.inlayHintAddition !== undefined) {
					const curAddition = paramInfo.inlayHintAddition[params.length - 1];

					if (curAddition !== undefined) {
						const extraInlayHintInfo = getExtraInlayHintInfo(curAddition, reqItem);

						if (extraInlayHintInfo !== extraInlayHintInfoInvalid) {
							item.detail = extraInlayHintInfo;
						}
					}
				}

				ret.push(item);
			}

			return ret;
		}
	},
	'=', ':'
);
