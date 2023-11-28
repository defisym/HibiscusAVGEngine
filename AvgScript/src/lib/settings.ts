/* eslint-disable @typescript-eslint/naming-convention */

import * as vscode from 'vscode';

import { getAllParams, getLineCommentCache } from "./utilities";

export interface ScriptSettings {
	LangSwitchAble: boolean,
	VNMode: boolean,
	LiteMode: boolean,
	UnSkipAble: boolean,
	NoHistory: boolean,
	NoHistoryJump: boolean,
	ResetHistory: boolean,
	SeparateDubID: boolean,
	NoSideEffect: boolean,

	LoadOnCall: boolean,
	LoadAtStart: boolean,
	LoadAll: boolean,

	EraseAtEnd: boolean,
	EraseAtEOF: boolean,
}

export function parseSettings(line: string) {
	let params = getAllParams(line);

	if (!params[0].iCmp('#Settings')) {
		return undefined;
	}

	let start = line.indexOf('=');
	params = line.substring(start + 1).split('|');

	let settings: ScriptSettings = {
		LangSwitchAble: false,
		VNMode: false,
		LiteMode: false,
		UnSkipAble: false,
		NoHistory: false,
		NoHistoryJump: false,
		ResetHistory: false,
		SeparateDubID: false,
		NoSideEffect: false,

		LoadOnCall: false,
		LoadAtStart: false,
		LoadAll: false,

		EraseAtEnd: false,
		EraseAtEOF: false,
	};

	for (const param of params) {
		do {
			if (param.iCmp('LangSwitchAble')) {
				settings.LangSwitchAble = true;

				break;
			}
			if (param.iCmp('VN')) {
				settings.VNMode = true;

				break;
			}
			if (param.iCmp('VNMode')) {
				settings.VNMode = true;

				break;
			}
			if (param.iCmp('Lite')) {
				settings.LiteMode = true;

				break;
			}
			if (param.iCmp('LiteMode')) {
				settings.LiteMode = true;

				break;
			}
			if (param.iCmp('UnSkipAble')) {
				settings.UnSkipAble = true;

				break;
			}
			if (param.iCmp('NoHistory')) {
				settings.NoHistory = true;

				break;
			}
			if (param.iCmp('NoHistoryJump')) {
				settings.NoHistoryJump = true;

				break;
			}
			if (param.iCmp('ResetHistory')) {
				settings.ResetHistory = true;

				break;
			}
			if (param.iCmp('SeparateDubID')) {
				settings.SeparateDubID = true;

				break;
			}
			if (param.iCmp('NoSideEffect')) {
				settings.NoSideEffect = true;

				break;
			}


			if (param.iCmp('LoadOnCall')) {
				settings.LoadOnCall = true;

				break;
			}
			if (param.iCmp('LoadAtStart')) {
				settings.LoadAtStart = true;

				break;
			}
			if (param.iCmp('LoadAll')) {
				settings.LoadAll = true;

				break;
			}

			if (param.iCmp('EraseAtEnd')) {
				settings.EraseAtEnd = true;

				break;
			}
			if (param.iCmp('EraseAtEOF')) {
				settings.EraseAtEOF = true;

				break;
			}
		} while (0);

	}

	return settings;
}

export function getSettings(document: vscode.TextDocument): ScriptSettings | undefined {
	let curCache = getLineCommentCache(document);

	for (let lineNumber = 0; lineNumber < curCache.comment.length; lineNumber++) {
		if (curCache.comment[lineNumber]) { continue; }

		const praseResult = curCache.result[lineNumber];
		const text = praseResult[0]!;

		if (text.matchStart(/#Settings/gi)) {
			return parseSettings(text);
		}
	}

	return undefined;
}