/* eslint-disable @typescript-eslint/naming-convention */

import * as vscode from 'vscode';

import * as mm from 'music-metadata';

import { audio, audioDubsCompletions, currentLocalCode, getFullFilePath, projectConfig, projectFileInfoList } from "../functions/file";
import { ScriptSettings } from "./settings";
import { parseBoolean, parseCommand, stringToEnglish } from "./utilities";

export class DubParser {
	bHoldNowTalking = false;

	bDubSequence = true;
	bSeparateDubID = false;

	dubChapter = '';
	dubSequePrefix = '';

	NowTalking = -1;
	SeparateDubID: Map<string, number> = new Map();

	fileName = 'NULL';

	constructor(currentChapter: string) {
		this.bDubSequence = true;
		this.fileName = 'NULL';
		this.dubChapter = currentChapter;
		this.dubSequePrefix = '';
	}

	updateState(name: string) {
		if (this.bDubSequence) {
			if (!this.bHoldNowTalking) {
				if (!this.bSeparateDubID) {
					this.NowTalking++;
				}
				else {
					let separateDubID = this.SeparateDubID.get(name);

					if (separateDubID === undefined) {
						this.SeparateDubID.set(name, -1);
						separateDubID = this.SeparateDubID.get(name);
					}

					this.SeparateDubID.set(name, separateDubID! + 1);
				}
			}

			this.bHoldNowTalking = false;

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

		if (ret === undefined && currentLocalCode !== projectConfig.Display.LanguageFallback) {
			fullFileName =  this.getFilePrefix(projectConfig.Display.LanguageFallback) + this.fileName;
			ret = getFullFilePath(fullFileName);
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
				let localItem = JSON.parse(JSON.stringify(item));

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