import * as vscode from 'vscode';

import { pinyin } from 'pinyin-pro';
import { FileType } from '../functions/file';
import { InlayHintType, commandInfoList } from './dict';
import { beginRegex, endRegex, removeLangPrefix } from './regExp';

import path = require('path');

// ---------------
// General
// ---------------

// add pinyin & romanize
export function stringToEnglish(str: string) {
	let py = pinyin(str
		, {
			toneType: 'none',
			nonZh: 'consecutive'
		});

	let romanize: string = require('japanese').romanize(str);

	let delimiter = "\t\t";
	let fileNameToEnglish = str + delimiter + py + delimiter + romanize;

	return fileNameToEnglish;
}

export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function deepCopy<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

export function deepCopyMap<K, V>(map: Map<K, V>): Map<K, V> {
	let newMap: Map<K, V> = new Map();

	for (let [key, value] of map) {
		newMap.set(key, value);
	}

	return newMap;
}

// for map serialization
export function replacer(key: any, value: any) {
	if (value instanceof Map) {
		return {
			dataType: 'Map',
			value: Array.from(value.entries()), // or with spread: value: [...value]
		};
	} else {
		return value;
	}
}

// for map de-serialization
export function reviver(key: any, value: any) {
	if (typeof value === 'object' && value !== null) {
		if (value.dataType === 'Map') {
			return new Map(value.value);
		}
	}

	return value;
}

// ---------------
// Delimiter
// ---------------

const delimiter = ['=', ':'];

export function getLastIndexOfDelimiter(src: string, position: number) {
	let ret = -1;

	for (let i = 0; i < delimiter.length; i++) {
		let index = src.lastIndexOf(delimiter[i], position);
		if (index > -1) {
			ret = Math.max(ret, index);
		}
	}

	return ret;
}

export function getIndexOfDelimiter(src: string, position: number) {
	let ret = src.length;

	for (let i = 0; i < delimiter.length; i++) {
		let index = src.indexOf(delimiter[i], position);
		if (index > -1) {
			ret = Math.min(ret, index);
		}
	}

	return ret;
}

export function lineIncludeDelimiter(src: string): boolean {
	for (let i = 0; i < src.length; i++) {
		if (delimiter.includes(src[i])) {
			return true;
		}
	}

	return false;
}

// split string to several substrings by delimiter
export function getSubStrings(src: string, delimiters: string[]) {
	let subStr: string[] = [];

	let start = -1;
	let end = -1;

	let lastChar = src[src.length - 1];

	if (!delimiters.includes(lastChar)) {
		src = src + delimiters[0];
	}

	for (let i = 0; i < src.length; i++) {
		for (let j = 0; j < delimiters.length; j++) {
			if (src[i] === delimiters[j]
				|| i === src.length - 1) {
				start = end;
				end = i;

				subStr.push(src.substring(start + 1, end));
			}
		}
	}

	subStr.pop();

	return subStr;
}

// ---------------
// Param
// ---------------

// position: position to start search
export function getParamAtPosition(src: string, position: number) {
	let start = getLastIndexOfDelimiter(src, position);
	let end = getIndexOfDelimiter(src, position);

	if (start === -1 || end === -1) {
		return undefined;
	}

	return src.substring(start + 1, end);
}

export function getAllParams(src: string, bNoLangPrefix: boolean = true) {
	if (!bNoLangPrefix) {
		src = removeLangPrefix(src);
		bNoLangPrefix = true;
	}

	let appendDelimiter = delimiter;

	if (src.matchStart(/#Settings/gi)) {
		appendDelimiter = delimiter.concat(['|']);
	}

	// if ((src.match(beginRegex) !== null) || (src.match(endRegex) !== null)) {
	if (src.matchStart(beginRegex) || src.matchStart(endRegex)) {
		appendDelimiter = delimiter.concat([' ']);
	}

	return getSubStrings(src, appendDelimiter);
}

// position: Nth param
export function getNthParam(src: string, position: number) {
	let count = 0;
	let start = 0;
	let end = 0;

	let lastChar = src[src.length - 1];

	if (!delimiter.includes(lastChar)) {
		src = src + delimiter[0];
	}

	for (let i = 0; i < src.length; i++) {
		for (let j = 0; j < delimiter.length; j++) {
			if (src[i] === delimiter[j]) {
				start = end;
				end = i;

				if (count === position) {
					return src.substring(start + 1, end);
				}

				count++;
			}
		}
	}

	return undefined;
}

export function getNumberOfParam(src: string, countLast: boolean = false): number {
	let count = 0;

	for (let i = 0; i < src.length; i++) {
		if (delimiter.includes(src[i])) {
			count++;
		}
	}

	if (!countLast
		&& delimiter.includes(src[src.length - 1])) {
		count--;
	}

	return count;
}

// get current param's file type
// function will parse command and return last param's type
// by the type of inlay hint
export function getCommandParamFileType(linePrefix: string) {
	const params = getAllParams(linePrefix);
	const prefix = params[0][0];
	const command = params[0].substring(1);

	// update pos by checking if in param (not end by delimiter)
	let inParam = true;
	let lastChar = linePrefix[linePrefix.length - 1];

	for (let deli of delimiter) {
		if (lastChar === deli) {
			inParam = false;
		}
	}

	const paramNum = params.length - 1
		- (inParam ? 1 : 0);

	do {
		let commandInfo = commandInfoList.getValue(command);

		if (commandInfo === undefined) {
			break;
		}

		let inlayHintType = commandInfo.inlayHintType;

		if (inlayHintType === undefined) {
			break;
		}

		if (paramNum > inlayHintType.length) {
			break;
		}

		let paramType = inlayHintType[paramNum];

		if (paramType === undefined) {
			break;
		}

		switch (paramType) {
			case InlayHintType.CharacterFileName:
				return FileType.characters;
			case InlayHintType.DiaFileName:
				return FileType.ui;
			case InlayHintType.NameFileName:
				return FileType.ui;
			case InlayHintType.CGFileName:
				return FileType.cg;
			case InlayHintType.PatternFadeFileName:
				return FileType.patternFade;
			case InlayHintType.AudioFileName:
				return FileType.audio;
			case InlayHintType.BGMFileName:
				return FileType.bgm;
			case InlayHintType.BGSFileName:
				return FileType.bgs;
			case InlayHintType.DubFileName:
				return FileType.dubs;
			case InlayHintType.SEFileName:
				return FileType.se;
			case InlayHintType.VideoFileName:
				return FileType.video;
			case InlayHintType.Chapter:
				return FileType.script;
			case InlayHintType.Frame:
				return FileType.frame;
			case InlayHintType.Label:
				return FileType.label;
			case InlayHintType.Animation:
				return FileType.animation;
			default:
				return FileType.inValid;

		}
	} while (0);

	return FileType.inValid;
}

export function parseBoolean(param: string): boolean {
	if (param.iCmp('On')) {
		return true;
	}

	if (param.iCmp('Off')) {
		return false;
	}

	return parseInt(param) !== 0;
}

// ---------------
// Command
// ---------------

export function parseCommand(line: string) {
	const params = getAllParams(line);

	const commandWithPrefix = params[0];
	const command = commandWithPrefix.substring(1);

	const paramInfo = commandInfoList.getValue(command);

	return { params, commandWithPrefix, command, paramInfo };
}

// ---------------
// Image
// ---------------

export interface ImageSize {
	width: number,
	height: number,
}

export function imageStretched(originSize: ImageSize, targetSize: ImageSize, tolerance: number = 0.1) {
	let sizeValidity = (size: ImageSize) => {
		let valueValidity = (num: number) => {
			const result = num !== 0 && num !== Infinity;

			return num !== 0 && num !== Infinity;
		};

		return valueValidity(size.width) && valueValidity(size.height);
	};

	if (!sizeValidity(originSize) || !sizeValidity(targetSize)) {
		return false;
	}

	const originRatio = originSize.width / originSize.height;
	const targetRatio = targetSize.width / targetSize.height;

	const diff = originRatio - targetRatio;

	return Math.abs(diff) > tolerance;
}

// ---------------
// Script
// ---------------

export async function jumpToDocument(uri: vscode.Uri, line: number) {
	if (Number.isNaN(line)) {
		const editor = await vscode.window.showTextDocument(uri
			, {
				viewColumn: vscode.ViewColumn.Beside
			});
		editor.revealRange(new vscode.Range(0, 0, 0, 0)
			, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
	}

	const doc = await vscode.workspace.openTextDocument(uri);
	const text = doc.lineAt(line).text;

	const range = new vscode.Range(line, 0
		, line, text.length);
	const selection = new vscode.Selection(line, 0
		, line, text.length);

	const editor = await vscode.window.showTextDocument(uri, {
		viewColumn: vscode.ViewColumn.Beside,
		// viewColumn: vscode.window.activeTextEditor === undefined || vscode.window.activeTextEditor.viewColumn === undefined
		//     ? vscode.ViewColumn.Beside
		//     : vscode.window.activeTextEditor.viewColumn + 1,
		selection: selection,
	});

	editor.revealRange(range
		, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
}

export function scriptEndWithExt(curScript: string) {
	return curScript.substring(curScript.length - 4).iCmp('.asc');
}

export function cropScript(curScript: string) {
	return scriptEndWithExt(curScript)
		? curScript.substring(0, curScript.length - 4)
		: curScript;
}
