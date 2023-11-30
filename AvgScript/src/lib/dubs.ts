/* eslint-disable @typescript-eslint/naming-convention */

import * as vscode from 'vscode';

import * as mm from 'music-metadata';

import { audio, audioDubsCompletions, basePath, currentLocalCode, getFullFilePath, projectConfig, projectFileInfoList } from "../functions/file";
import { narrator } from '../webview/dubList';
import { CacheInterface } from './cacheInterface';
import { lineCommentCache } from './comment';
import { DialogueStruct, currentLineDialogue, parseDialogue } from './dialogue';
import { ScriptSettings, getSettings } from "./settings";
import { cropScript, deepCopy, deepCopyMap, parseBoolean, parseCommand, stringToEnglish } from "./utilities";

export class DubParser {
	bHoldNowTalking = false;

	bDubSequence = true;
	bSeparateDubID = false;

	dubChapter = '';
	dubSequePrefix = '';

	NowTalking = -1;
	SeparateDubID: Map<string, number> = new Map();

	totalLineCount = -1;
	lineCountMap: Map<string, number> = new Map();

	bSettingsSideEffect: boolean = false;
	bNoSideEffect: boolean = false;

	curName = '';
	fileName = 'NULL';

	constructor(currentChapter: string) {
		this.bDubSequence = true;
		this.fileName = 'NULL';
		this.dubChapter = currentChapter;
		this.dubSequePrefix = '';
	}

	copy() {
		let newObj = new DubParser(this.dubChapter);

		newObj.bHoldNowTalking = this.bHoldNowTalking;

		newObj.bDubSequence = this.bDubSequence;
		newObj.bSeparateDubID = this.bSeparateDubID;

		newObj.dubChapter = this.dubChapter;
		newObj.dubSequePrefix = this.dubSequePrefix;

		newObj.NowTalking = this.NowTalking;
		newObj.SeparateDubID = deepCopyMap(this.SeparateDubID);

		newObj.totalLineCount = this.totalLineCount;
		newObj.lineCountMap = deepCopyMap(this.lineCountMap);

		newObj.bSettingsSideEffect = this.bSettingsSideEffect;
		newObj.bNoSideEffect = this.bNoSideEffect;

		newObj.curName = this.curName;
		newObj.fileName = this.fileName;

		return newObj;
	}

	updateState(name: string) {
		if (name.empty()) {
			name = narrator;
		}

		this.curName = name;

		this.totalLineCount++;
		let lineCount = this.lineCountMap.getWithInit(name, 0);

		if (lineCount !== undefined && this.bNoSideEffect) {
			this.lineCountMap.set(name, lineCount + 1);
		}

		if (!this.bDubSequence) {
			return;
		}

		if (!this.bHoldNowTalking) {
			if (!this.bSeparateDubID) {
				this.NowTalking++;
			}
			else {
				let separateDubID = this.SeparateDubID.getWithInit(name, -1);

				this.SeparateDubID.set(name, separateDubID! + 1);
			}
		}

		this.bHoldNowTalking = false;

		// auto sequence
		if (this.fileName === 'NULL') {
			let newName = this.dubSequePrefix;
			newName += this.dubSequePrefix === '' ? '' : '_';

			if (this.bSeparateDubID) {
				let separateDubID = this.SeparateDubID.get(name);

				newName += name + '_' + separateDubID!.toString();
			} else {
				newName += this.NowTalking.toString();
			}

			this.fileName = newName;
		}

	}
	getFileRelativePrefix(localCode: string = currentLocalCode) {
		return localCode + "\\" + this.dubChapter + '\\';
	}
	getFilePrefix(localCode: string = currentLocalCode) {
		return audio + "dubs\\" + this.getFileRelativePrefix(localCode);
	}
	getPlayFileInfo(fileName: string | undefined = undefined) {
		fileName = fileName === undefined
			? this.getPlayFileName()
			: fileName;

		if (fileName === undefined) {
			return undefined;
		}

		const info = <mm.IAudioMetadata>projectFileInfoList.get(fileName);

		return info;
	}
	getPlayFileName() {
		let fullFileName: string | undefined = this.getFilePrefix() + this.fileName;

		let ret = getFullFilePath(fullFileName);

		try {
			const fallback = projectConfig.Display.LanguageFallback;
			if (ret === undefined && currentLocalCode !== fallback) {
				fullFileName = this.getFilePrefix(fallback) + this.fileName;
				ret = getFullFilePath(fullFileName);
			}
		} catch (error) {

		}

		return ret;
	}
	afterPlay() {
		this.fileName = 'NULL';
	}

	parseSettings(settings: ScriptSettings | undefined) {
		if (!settings) {
			return;
		}

		this.bSeparateDubID = settings.SeparateDubID;
		this.bNoSideEffect = settings.NoSideEffect;
	}

	parseCommand(line: string) {
		const { params, commandWithPrefix, command, paramInfo } = parseCommand(line);

		if (paramInfo === undefined) {
			return;
		}

		do {
			if (command.iCmp('DubSeque')) {
				this.bDubSequence = true;

				break;
			}
			if (command.iCmp('DubSequeOff')) {
				this.bDubSequence = false;

				break;
			}
			if (command.iCmp('DubSequePrefix')) {
				this.dubSequePrefix = params[1];

				break;
			}

			if (command.iCmp('NTK') || command.iCmp('NTKChange')) {
				this.NowTalking = parseInt(params[1]);
				this.bHoldNowTalking = true;

				const bKeepSeq = parseBoolean(params[2]);
				this.bDubSequence = bKeepSeq ? this.bDubSequence : bKeepSeq;

				break;
			}
			if (command.iCmp('SeparateNTKChange')) {
				const name = params[1];

				let separateDubID = this.SeparateDubID.get(name);

				if (separateDubID === undefined) {
					this.SeparateDubID.set(name, -1);
					separateDubID = this.SeparateDubID.get(name);
				}

				this.SeparateDubID.set(name, parseInt(params[2]));
				this.bHoldNowTalking = true;

				const bKeepSeq = parseBoolean(params[2]);
				this.bDubSequence = bKeepSeq ? this.bDubSequence : bKeepSeq;

				break;
			}

			if (command.iCmp('DubChapter')) {
				this.dubChapter = params[1];

				break;
			}

			if (command.iCmp('SideEffect')) {
				this.bNoSideEffect = false;

				break;
			}
			if (command.iCmp('NoSideEffect')) {
				this.bNoSideEffect = true;

				break;
			}
		} while (0);
	}
}

export function UpdateDubCompletion(dubParser: DubParser) {
	let localDubCompletion: vscode.CompletionItem[] = [];
	const relativePrefix = dubParser.getFileRelativePrefix();

	for (const item of audioDubsCompletions) {
		if (item.insertText) {
			const sub = (<string>(item.insertText));
			const subBegin = sub.substring(0, relativePrefix.length);

			if (subBegin.iCmp(relativePrefix)) {
				let localItem = deepCopy(item);

				const subName = sub.substring(relativePrefix.length);

				(<vscode.CompletionItemLabel>(localItem.label)).label = subName.removeAfter('.');
				localItem.insertText = subName;
				localItem.filterText = stringToEnglish(localItem.insertText);

				localDubCompletion.push(localItem);
			}
		}
	}

	return localDubCompletion;
}

class DubCache {
	dubParser: DubParser;
	totalLine: number;
	dialogueStruct: DialogueStruct;

	constructor(dubParser: DubParser, totalLine: number, dialogueStruct: DialogueStruct) {
		this.dubParser = dubParser.copy();
		this.totalLine = totalLine;
		this.dialogueStruct = deepCopy(dialogueStruct);
	}
}

export class DubParseCache implements CacheInterface<DubCache[]> {
	dubParseCache = new Map<vscode.TextDocument, DubCache[]>();

	parseDocument(document: vscode.TextDocument) {
		this.removeDocumentCache(document);
		this.dubParseCache.set(document, []);

		const curCache = this.dubParseCache.get(document)!;

		this.updateDocumentDub(document, (dp: DubParser, lineNumber: number, dialogueStruct: DialogueStruct) => {
			curCache.push(new DubCache(dp, lineNumber, dialogueStruct));
		});

		return;
	}

	removeDocumentCache(document: vscode.TextDocument) {
		this.dubParseCache.delete(document);
	}
	updateDocumentCache(document: vscode.TextDocument,
		change: readonly vscode.TextDocumentContentChangeEvent[]) {
		//TODO
		this.removeDocumentCache(document);
	}
	getDocumentCache(document: vscode.TextDocument) {
		let curCache = this.dubParseCache.get(document);

		if (curCache === undefined) {
			this.parseDocument(document);
		}

		curCache = this.dubParseCache.get(document)!;

		return curCache;
	}

	getDocumentCacheAt(document: vscode.TextDocument, totalLine: number) {
		let curCache = this.getDocumentCache(document);

		for (const cache of curCache) {
			if (cache.totalLine >= totalLine) {
				return cache;
			}
		}

		return undefined;
	}

	updateDocumentDub(document: vscode.TextDocument,
		cb: (dp: DubParser, lineNumber: number, dialogueStruct: DialogueStruct) => void,
		since: number = 0, dubState: DubParser | undefined = undefined) {
		const settings = getSettings(document);

		const curChapter = cropScript(document.fileName.substring(basePath.length + 1));
		if (dubState === undefined) {
			dubState = new DubParser(curChapter);
			dubState.parseSettings(settings);
		} else {
			dubState = deepCopy(dubState);
		}

		let curCache = lineCommentCache.getDocumentCache(document);
		for (let idx = since; idx < curCache.comment.length; idx++) {
			if (curCache.comment[idx]) { continue; }

			const lineInfo = curCache.lineInfo[idx];

			let text = lineInfo.textNoComment;
			let lineNumber = lineInfo.lineNum;
			let lineStart = lineInfo.lineStart;
			let lineEnd = lineInfo.lineEnd;

			// ----------
			// Parse command
			// ----------
			if (!currentLineDialogue(text)) {
				dubState.parseCommand(text);
				dubState.afterPlay();

				continue;
			}

			// ----------
			// Parse dialogue
			// ----------
			const dialogueStruct = parseDialogue(text, text);
			// depend on display name
			let name = dialogueStruct.m_name;

			// ----------
			// Content
			// ----------
			dubState.updateState(name);
			cb(dubState, lineNumber, dialogueStruct);
			dubState.afterPlay();
		}
	}
}

export const dubParseCache = new DubParseCache();

const durationPerWordSlow = (1.0 * 60 / 360);       // check shorter
const durationPerWordFast = (1.0 * 60 / 120);       // check longer
const durationRange = 0.5;
const durationThreshold = 2.5;

export interface DubInfo {
	range: vscode.Range,
	info: string,
};

export type DubError = DubInfo;

export function dubDiagnostic(document: vscode.TextDocument): DubError[] {
	const dubError: DubError[] = [];

	const curCache = dubParseCache.getDocumentCache(document);
	const commentCache = lineCommentCache.getDocumentCache(document);

	if (curCache === undefined) { return dubError; }

	for (let idx = 0; idx < curCache.length; idx++) {
		const dubCache = curCache[idx];
		const dubState = dubCache.dubParser;

		const lineInfo = commentCache.lineInfo[dubCache.totalLine];

		let text = lineInfo.textNoComment;
		let lineNumber = lineInfo.lineNum;
		let lineStart = lineInfo.lineStart;
		let lineEnd = lineInfo.lineEnd;

		const dialogueStruct = dubCache.dialogueStruct;

		const fileName = dubState.getPlayFileName();
		const fileInfo = dubState.getPlayFileInfo(fileName);

		const range = new vscode.Range(new vscode.Position(lineNumber, lineStart),
			new vscode.Position(lineNumber, lineEnd));

		if (fileInfo === undefined) {
			continue;
		}

		const duration = fileInfo.format.duration;

		if (duration === undefined) {
			continue;
		}

		if (duration < durationThreshold) {
			continue;
		}

		let curDubError: DubError = {
			range: range,
			info: '',
		};

		const expectedDurationFast = dialogueStruct.m_dialoguePart.length * durationPerWordFast;

		if (duration >= expectedDurationFast + durationRange) {
			curDubError.info = 'longer';
		}

		const expectedDurationSlow = dialogueStruct.m_dialoguePart.length * durationPerWordSlow;

		if (duration <= expectedDurationSlow - durationRange) {
			curDubError.info = 'shorter';
		}

		if (curDubError.info === '') {
			continue;
		}

		dubError.push(curDubError);
	}

	return dubError;
}