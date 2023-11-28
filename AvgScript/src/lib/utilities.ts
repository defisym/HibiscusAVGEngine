import * as vscode from 'vscode';

import { pinyin } from 'pinyin-pro';
import { animationCompletions, audioBgmCompletions, audioBgsCompletions, audioDubsCompletions, audioSECompletions, fileListHasItem, getCorrectPathAndType, getFullFileNameByType, graphicCGCompletions, graphicCharactersCompletions, graphicFXCompletions, graphicPatternFadeCompletions, graphicUICompletions, scriptCompletions, videoCompletions } from '../functions/file';
import { InlayHintType, commandInfoList, deprecatedKeywordList, docList, internalKeywordList } from './dict';
import { LineInfo, iterateLinesWithComment } from './iterateLines';
import { beginRegex, endRegex } from './regExp';

import path = require('path');

const delimiter = ['=', ':'];

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

export async function getBuffer(filePath: string) {
	return Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.file(filePath)));
}

export async function getFileStat(filePath: string) {
	try {
		return await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
	} catch {
		return undefined;
	}
}

export function getCompletion(name: string, fileList: vscode.CompletionItem[]) {
	name = name.toLowerCase();

	for (let file of fileList) {
		let element = file.insertText?.toString().toLowerCase()!;

		if (element?.startsWith(name)) {
			return file;
		}
	};

	return undefined;
}

export function getCompletionList(type: FileType) {
	switch (type) {
		case FileType.fx:
			return graphicFXCompletions;
		case FileType.characters:
			return graphicCharactersCompletions;
		case FileType.ui:
			return graphicUICompletions;
		case FileType.cg:
			return graphicCGCompletions;
		case FileType.patternFade:
			return graphicPatternFadeCompletions;
		case FileType.bgm:
			return audioBgmCompletions;
		case FileType.bgs:
			return audioBgsCompletions;
		case FileType.dubs:
			return audioDubsCompletions;
		case FileType.se:
			return audioSECompletions;
		case FileType.video:
			return videoCompletions;
		case FileType.animation:
			return animationCompletions;
		case FileType.script:
			return scriptCompletions;
		default:
			return undefined;
	}
}

export function getFileCompletionByType(type: FileType, fileName: string) {
	// correction to full path
	let [corType, corFileName] = getCorrectPathAndType(type, fileName)!;

	fileName = corFileName;
	type = corType;

	const completionList = getCompletionList(type);

	if (completionList === undefined) { return undefined; }

	return getCompletion(fileName, completionList);
}

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

// position: position to start search
export function getParamAtPosition(src: string, position: number) {
	let start = getLastIndexOfDelimiter(src, position);
	let end = getIndexOfDelimiter(src, position);

	if (start === -1 || end === -1) {
		return undefined;
	}
	return src.substring(start + 1, end);
}

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

export function getAllParams(src: string) {
	if ((src.match(beginRegex) !== null) || (src.match(endRegex) !== null)) {
		let appendDelimiter = delimiter.concat([' ']);

		return getSubStrings(src, appendDelimiter);
	}

	return getSubStrings(src, delimiter);
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

export function lineIncludeDelimiter(src: string): boolean {
	for (let i = 0; i < src.length; i++) {
		if (delimiter.includes(src[i])) {
			return true;
		}
	}

	return false;
}

export function lineValidForCommandCompletion(src: string): boolean {
	let include = lineIncludeDelimiter(src);
	let startWith = (src.startsWith("@") || src.startsWith("#"));
	let endWith = (src.endsWith("@") || src.endsWith("#"));

	if (include) {
		return false;
	}

	if (startWith) {
		const noPrefix = src.substring(1);

		if (noPrefix.includes("@") || noPrefix.includes("#")) {
			return false;
		}

		return true;
	}

	return false;
}

export function getCommentList(item: string, commentList: docList): string[] | undefined {
	return commentList.getValue(item);
}

export function getCompletionItem(item: string, commentList: docList) {
	let itemCompletion = new vscode.CompletionItem(item, vscode.CompletionItemKind.Method);

	itemCompletion.detail = "说明";
	itemCompletion.documentation = new vscode.MarkdownString();

	let comment = getCommentList(item, commentList);

	if (comment === undefined) {
		itemCompletion.documentation.appendMarkdown("该项暂无说明");
	} else {
		for (let j = 0; j < comment.length; j++) {
			itemCompletion.documentation.appendMarkdown(comment[j] + "\n\n");
		}
	}

	return itemCompletion;
}

export function getCompletionItemList(src: string[], commentList: docList) {
	let ret: vscode.CompletionItem[] = [];

	for (let i = 0; i < src.length; i++) {
		let completionItem = getCompletionItem(src[i], commentList);

		if (completionItem === undefined) {
			continue;
		}

		if (deprecatedKeywordList.hasValue(src[i])
			|| internalKeywordList.hasValue(src[i])) {
			completionItem.tags = [vscode.CompletionItemTag.Deprecated];
		}

		ret.push(completionItem);
	}

	return ret;
}

export function getHoverContents(item: string, commentList: docList) {
	let ret: vscode.MarkdownString[] = [];
	let comment = getCommentList(item, commentList);

	if (comment === undefined) {
		ret.push(new vscode.MarkdownString("该项暂无说明"));
	} else {
		for (let j = 0; j < comment.length; j++) {
			ret.push(new vscode.MarkdownString(comment[j]));
		}
	}

	return ret;
}

export enum FileType {
	inValid,

	fx,
	characters,
	ui,
	cg,
	patternFade,

	audio,
	bgm,
	bgs,
	dubs,
	se,

	video,

	script,
	frame,
	label,

	animation,
};

export const fileTypeMap = new Map<number, string>([
	[FileType.inValid, "无效"],
	[FileType.fx, "特效"],
	[FileType.characters, "人物立绘"],
	[FileType.ui, "UI"],
	[FileType.cg, "CG"],
	[FileType.patternFade, "过渡纹理"],
	[FileType.bgm, "BGM"],
	[FileType.bgs, "BGS"],
	[FileType.dubs, "语音"],
	[FileType.se, "音效"],
	[FileType.video, "视频"],
	[FileType.script, "脚本"],
	[FileType.frame, "场景"],
	[FileType.label, "标签"],
	[FileType.animation, "动画"],
]);

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

export function getFilePathFromCompletion(linePrefix: string, fileName: string) {
	let sortText = getFileCompletionByType(getCommandParamFileType(linePrefix), fileName)?.sortText;

	if (sortText === undefined) {
		return undefined;
	}

	const filePath = getTextBySortText(sortText);

	return filePath;
}

export function getUri(linePrefix: string, fileName: string) {
	let filePath = getFilePathFromCompletion(linePrefix, fileName);

	if (filePath === undefined) {
		return undefined;
	}

	return vscode.Uri.file(filePath);
};

export function fileExistsInFileList(type: FileType, fileName: string) {
	// return getFileNameByType(type, fileName) !== undefined;
	let filePath = getFullFileNameByType(type, fileName);

	if (filePath === undefined) {
		return false;
	}

	return fileListHasItem(filePath);
}

type ParseCommandResult = undefined[] | [string, number, string, number, string];

interface CommentCache {
	comment: boolean[];
	result: ParseCommandResult[];
}

export const lineCommentCache = new Map<vscode.TextDocument, CommentCache>();

export function removeLineComment(document: vscode.TextDocument) {
	lineCommentCache.delete(document);
}

export function parseLineComment(document: vscode.TextDocument) {
	removeLineComment(document);
	lineCommentCache.set(document, { comment: [], result: [] });

	const curCache = lineCommentCache.get(document)!;

	iterateLinesWithComment(document, (lineInfo: LineInfo) => {
		let parseResult: ParseCommandResult = [undefined, undefined, undefined, undefined];

		if (!lineInfo.lineIsComment) {
			parseResult = [lineInfo.textNoComment.toLowerCase(),
			lineInfo.lineStart,
				"",
			-1,
			lineInfo.textNoComment];
		}

		curCache.comment.push(lineInfo.lineIsComment);
		curCache.result.push(parseResult);
	});
}

export function getLineCommentCache(document: vscode.TextDocument){
	let curCache = lineCommentCache.get(document);

	if (curCache === undefined) {
		parseLineComment(document);
	}

	curCache = lineCommentCache.get(document)!;

	return curCache;
}

export function currentLineNotComment(document: vscode.TextDocument, position: vscode.Position,
	callback: (text: string) => void = (text: string) => { })
	: ParseCommandResult {
	let curCache = getLineCommentCache(document);

	const curLine = position.line;

	const bComment = curCache.comment[curLine];
	const praseResult = curCache.result[curLine];

	if (bComment) {
		return praseResult;
	}

	callback(praseResult[4]!);

	let curPos = position.character - praseResult[1]!;
	let curLinePrefix: string = praseResult[0]!.substring(0, curPos).trim();

	return [praseResult[0]!, praseResult[1]!, curLinePrefix, curPos, praseResult[4]!];
}

export function parseCommand(line: string) {
	const params = getAllParams(line);

	const commandWithPrefix = params[0];
	const command = commandWithPrefix.substring(1);

	const paramInfo = commandInfoList.getValue(command);

	return { params, commandWithPrefix, command, paramInfo };
}

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

export function parseBoolean(param: string): boolean {
	if (param.iCmp('On')) {
		return true;
	}

	if (param.iCmp('Off')) {
		return false;
	}

	return parseInt(param) !== 0;
}

export function scriptEndWithExt(curScript: string) {
	return curScript.substring(curScript.length - 4).iCmp('.asc');
}

export function cropScript(curScript: string) {
	return scriptEndWithExt(curScript)
		? curScript.substring(0, curScript.length - 4)
		: curScript;
}

// const sortTextPrefixDelimiter = '\t\t';
const sortTextPrefixDelimiter = '|';

export function getSortTextByText(text: string) {
	return text.length.toString() + sortTextPrefixDelimiter + text;
}

export function getTextBySortText(sortText: string) {
	return sortText.substring(sortText.indexOf(sortTextPrefixDelimiter) + 1);
}
