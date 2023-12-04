import * as vscode from 'vscode';

import { ImageProbe } from '@zerodeps/image-probe';
import * as mm from 'music-metadata';

import { currentLineNotComment } from '../lib/comment';
import { currentLineDialogue } from '../lib/dialogue';
import { DubParser, dubMapping, dubParseCache } from '../lib/dubs';
import { blankRegex } from '../lib/regExp';
import { getSettings } from '../lib/settings';
import { getCommandParamFileType, getParamAtPosition, sleep, stringToEnglish } from '../lib/utilities';
import { codeLensProviderClass } from './codeLens';
import { commandBasePath, confBasePath } from './command';
import { updateWatcher } from './watcher';

// file
// Get full file path in Node.js
// https://stackoverflow.com/questions/31317007/get-full-file-path-in-node-js
// https://nodejs.org/api/path.html#pathresolvepaths
import path = require("path");

// ---------------
// State
// ---------------

let fileListInitFirstRun = true;
export let fileListInitialized = false;

export function fileListUpdating() {
	if (!fileListInitialized) {
		vscode.window.showInformationMessage('Waiting for file scanning complete');

		return true;
	}

	return false;
}

export async function waitForFileListInit() {
	fileListUpdating();

	// wait for file refresh
	while (!fileListInitialized) {
		await sleep(50);
	}
}

// ---------------
// Settings
// ---------------

// project config
export let projectConfig: any = undefined;

export let currentLocalCode: string;
export let currentLocalCodeDefinition: any;
export let currentLocalCodeDisplay: string;

// ---------------
// General
// ---------------

// paths
export let basePathUpdated = false;
export let basePath: string;
export let execPath: string;

// completion type
export enum CompletionType { image, audio, video, animation, script };

//file List
export let projectFileList: [string, vscode.FileType][] = [];
export const projectFileInfoList = new Map<string, any>([]);

//file type
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

	animation
}
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

// ---------------
// Graphic
// ---------------

// path
export let graphic: string;

export let graphicFXPath: string;
export let graphicCGPath: string;
export let graphicUIPath: string;
export let graphicPatternFadePath: string;
export let graphicCharactersPath: string;

export const graphicFXRelativePath = 'Graphics\\FX';
export const graphicCGRelativePath = 'Graphics\\CG';
export const graphicUIRelativePath = 'Graphics\\UI';
export const graphicPatternFadeRelativePath = 'Graphics\\PatternFade';
export const graphicCharactersRelativePath = 'Graphics\\Characters';

// completion
export let graphicFXCompletions: vscode.CompletionItem[] = [];
export let graphicCGCompletions: vscode.CompletionItem[] = [];
export let graphicUICompletions: vscode.CompletionItem[] = [];
export let graphicPatternFadeCompletions: vscode.CompletionItem[] = [];
export let graphicCharactersCompletions: vscode.CompletionItem[] = [];

// ---------------
// Audio
// ---------------

// paths
export let audio: string;

export let audioBgmPath: string;
export let audioBgsPath: string;
export let audioDubsPath: string;
export let audioSEPath: string;

export const audioBgmRelativePath = 'Audio\\BGM';
export const audioBgsRelativePath = 'Audio\\BGS';
export const audioDubRelativePath = 'Audio\\DUB';
export const audioSERelativePath = 'Audio\\SE';

// completion
export let audioBgmCompletions: vscode.CompletionItem[] = [];
export let audioBgsCompletions: vscode.CompletionItem[] = [];
export let audioDubsCompletions: vscode.CompletionItem[] = [];
export let audioSECompletions: vscode.CompletionItem[] = [];

// ---------------
// Video
// ---------------

// paths
export let videoPath: string;

export const videoRelativePath = 'Assets\\Movies';

// completion
export let videoCompletions: vscode.CompletionItem[] = [];

// ---------------
// Animation
// ---------------

// paths
export let animationPath: string;

export const animationRelativePath = 'Assets\\Animation';

// completion
export let animationCompletions: vscode.CompletionItem[] = [];

// ---------------
// Script
// ---------------

// paths
export let scriptPath: string;

export const scriptRelativePath = 'dialogue';

// completion
export let scriptCompletions: vscode.CompletionItem[] = [];

// ---------------
// Preview
// ---------------

export const nonePreview = "暂无预览";

const imagePreview = `<div align="center"><img src ="{$FILENAME}" height = "160"/></div>`;
const audioPreview = nonePreview;
const videoPreview = nonePreview;
const animationPreview = nonePreview;
const scriptPreview = nonePreview;

// ---------------
// File Basic
// ---------------

export async function getBuffer(filePath: string) {
	return Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.file(filePath)));
}

export function removeExt(fileName: string) {
	let ext = path.extname(fileName);

	return fileName.substring(0, fileName.length - ext.length);
}

// ---------------
// File Exist
// ---------------

// pass type as undefined to check if name exists
export async function fileTypeExistsOnDisk(filePath: string, type: vscode.FileType | undefined) {
	try {
		const stat = await vscode.workspace.fs.stat(vscode.Uri.file(filePath));

		if (type === undefined) {
			return true;
		}

		return stat.type === type;
	} catch {
		return false;
	}
}

export async function nameExistsOnDisk(filePath: string) {
	return await fileTypeExistsOnDisk(filePath, undefined);
}

export async function dirExistsOnDisk(filePath: string) {
	return await fileTypeExistsOnDisk(filePath, vscode.FileType.Directory);
}

export async function fileExistsOnDisk(filePath: string) {
	return await fileTypeExistsOnDisk(filePath, vscode.FileType.File);
}

// ---------------
// File Full Name
// ---------------

export function getFullFilePath(filePath: string) {
	return getFileListItem(path.resolve(filePath));
}

export function getBasePathByType(type: FileType) {
	switch (type) {
		case FileType.fx:
			return graphicFXPath;
		case FileType.characters:
			return graphicCharactersPath;
		case FileType.ui:
			return graphicUIPath;
		case FileType.cg:
			return graphicCGPath;
		case FileType.patternFade:
			return graphicPatternFadePath;

		case FileType.audio:
			return audio;
		case FileType.bgm:
			return audioBgmPath;
		case FileType.bgs:
			return audioBgsPath;
		case FileType.dubs:
			return audioDubsPath;
		case FileType.se:
			return audioSEPath;

		case FileType.video:
			return videoPath;
		case FileType.animation:
			return animationPath;
		case FileType.script:
			return scriptPath;

		default:
			return undefined;
	}
}

export function getFullFileNameByType(type: FileType, fileName: string) {
	let basePath = getBasePathByType(type);

	if (basePath === undefined) {
		return undefined;
	}

	let filePath = getFullFilePath(basePath + '\\' + fileName);

	return filePath;
}

// input should be full path
// get file path type
export function getPathType(fileName: string) {
	fileName = fileName.substring(basePath.length + 1);

	let compareStart = (toCmp: string, base: string) => {
		return toCmp.substring(0, base.length).iCmp(base);
	};

	if (compareStart(fileName, graphicFXRelativePath)) {
		return FileType.fx;
	}
	if (compareStart(fileName, graphicCGRelativePath)) {
		return FileType.cg;
	}
	if (compareStart(fileName, graphicUIRelativePath)) {
		return FileType.ui;
	}
	if (compareStart(fileName, graphicPatternFadeRelativePath)) {
		return FileType.patternFade;
	}
	if (compareStart(fileName, graphicCharactersRelativePath)) {
		return FileType.characters;
	}

	if (compareStart(fileName, audioBgmRelativePath)) {
		return FileType.bgm;
	}
	if (compareStart(fileName, audioBgsRelativePath)) {
		return FileType.bgs;
	}
	if (compareStart(fileName, audioDubRelativePath)) {
		return FileType.dubs;
	}
	if (compareStart(fileName, audioSERelativePath)) {
		return FileType.se;
	}

	if (compareStart(fileName, videoRelativePath)) {
		return FileType.video;
	}

	if (compareStart(fileName, scriptRelativePath)) {
		return FileType.script;
	}

	if (compareStart(fileName, animationRelativePath)) {
		return FileType.animation;
	}
}

// update file to get full name (aka with extension)
export function getRelativePathAndType(type: FileType, fileName: string): [FileType, string] | undefined {
	let relativeFileName = getFullFileNameByType(type, fileName);

	if (relativeFileName === undefined) {
		return undefined;
	}

	type = getPathType(relativeFileName)!;

	let base = getBasePathByType(type)!;

	return [type, relativeFileName.substring(base.length + 1)];
}

// ---------------
// File List
// ---------------

interface FileListCache {
	filePath: string | undefined
}

const projectFileListCache = new Map<string, FileListCache>();

function getFileListItem(filePath: string) {
	filePath = filePath.toLowerCase();
	const cache = projectFileListCache.get(filePath);

	if (cache !== undefined) {
		// console.log('Cache Hit :' + filePath);
		return cache.filePath;
	}

	const idx = projectFileList.findIf((item: [string, vscode.FileType]) => {
		let [itemPath, itemType] = item;

		// file list item is full path
		const itemPathLength = itemPath.length;
		const filePathLength = filePath.length;

		if (itemPathLength < filePathLength) {
			return false;
		}

		if (itemPathLength > filePathLength) {
			return filePath.iCmp(removeExt(itemPath));
		}

		return filePath.iCmp(itemPath);
	});

	const result = idx !== -1
		? projectFileList[idx][0]
		: undefined;

	projectFileListCache.set(filePath, { filePath: result });

	return result;
}

export function fileListHasItem(filePath: string) {
	let fullPath = getFullFilePath(filePath);

	return fullPath !== undefined;
}

// file name pass in is not complete
export function fileExistsInFileList(type: FileType, fileName: string) {
	let filePath = getFullFileNameByType(type, fileName);

	if (filePath === undefined) {
		return false;
	}

	return fileListHasItem(filePath);
}

async function getDirFileList(uri: vscode.Uri) {
	return vscode.workspace.fs.readDirectory(uri);
}

async function getFileListRecursivelyFunc(filePath: string, fileList: [string, vscode.FileType][]) {
	let uri = vscode.Uri.file(filePath);
	let result: [string, vscode.FileType][] = await getDirFileList(uri);
	let promiseList: Promise<void>[] = [];

	for (let resultItem of result) {
		let fileName = resultItem[0];
		let type = resultItem[1];

		if (type === vscode.FileType.Directory) {
			promiseList.push(new Promise(async (resolve, reject) => {
				let subFilePath = filePath + "\\" + fileName;
				await getFileListRecursivelyFunc(subFilePath, fileList);

				resolve();
			}));
		} else if (type === vscode.FileType.File) {
			fileList.push([filePath + "\\" + fileName, type]);
		}
	}

	await Promise.all(promiseList);
}

export async function getDirFileListRecursively(filePath: string) {
	let fileList: [string, vscode.FileType][] = [];

	if (await dirExistsOnDisk(filePath)) {
		await getFileListRecursivelyFunc(filePath, fileList);
	}

	return fileList;
}

// ---------------
// File Info
// ---------------

export function getFileInfoFromInfoList(filePath: string) {
	return projectFileInfoList.getValue(filePath);
}

// get file info by reading disk, then cache to projectFileInfoList
async function getFileInfo(filePath: string, type: CompletionType) {
	let getDuration = (duration: number) => {
		let minutes = Math.floor(duration / 60);
		let seconds = Math.floor(duration % 60);

		return "Duration: `"
			+ minutes.toString() + ":"
			+ (seconds < 10 ? "0" + seconds.toString() : seconds.toString()) + "`";
	};

	try {
		switch (type) {
			case CompletionType.image:
				const data = ImageProbe.fromBuffer(await getBuffer(filePath));

				if (data === undefined) {
					throw new Error("ImageProbe.fromBuffer() failed");
				}

				projectFileInfoList.set(filePath, data);

				return "Width: `" + data.width.toString() + "` Height: `" + data.height.toString() + "`";
			case CompletionType.audio:
				const metadata = await mm.parseBuffer(await getBuffer(filePath));

				projectFileInfoList.set(filePath, metadata);

				return "`" + (metadata.format.sampleRate! / 1000).toFixed(1) + "KHz`\t"
					+ "`" + (metadata.format.bitrate! / 1000).toFixed() + "kbps`\t"
					+ getDuration(metadata.format.duration!);
			case CompletionType.video:
				// You cannot run child process to call ffprobe in browser
				// try {
				// 	const ffprobe = require('ffprobe');
				// 	const ffprobeStatic = require('ffprobe-static');

				// 	const infos = (await ffprobe(filePath, { path: ffprobeStatic.path })).streams;

				// 	for (const info of infos) {
				// 		const codecType = info.codec_type;
				// 		if (codecType !== undefined && codecType === "video") {
				// 			projectFileInfoList.set(filePath, info);

				// 			return "Width: `" + info.width.toString()
				// 				+ "` Height: `" + info.height.toString()
				// 				+ "`\t"
				// 				+ getDuration(info.duration!);
				// 		}
				// 	}

				// 	const noVideoStream = 'No video stream';
				// 	projectFileInfoList.set(filePath, noVideoStream);

				// 	return noVideoStream;
				// } catch (err) {
				// 	// console.log(err);

				// 	const noFFMpegInfo = 'No FFMpeg detected';
				// 	projectFileInfoList.set(filePath, noFFMpegInfo);

				// 	return noFFMpegInfo;
				// }

				return "Video file";
			case CompletionType.animation:
				return "Animation file";
			case CompletionType.script:
				const commentRegex = new RegExp("(\\/\\*(.|[\r\n])*?\\*\\/)|(\\/\\/[^\r\n]*)|(\\([^\r\n]*)|Lang\\[(?!" + currentLocalCode + ").*\\].*", "gi");
				const string = (await getBuffer(filePath)).toString('utf-8').replace(commentRegex, "");
				const lines = string.split('\r\n');

				for (let lineRaw of lines) {
					let line = lineRaw.trim().replace(blankRegex, "");

					if (currentLineDialogue(line)) {
						return "\n\n" + line;
					}
				}
		}
	}
	catch (err) {
		// console.log(filePath);
		// console.log(err);

		return undefined;
	}
}

// comment is used as completion documentation
async function getFileComment(previewStr: string
	, fileName: string | undefined
	, filePath: string
	, type: CompletionType) {
	let preview: vscode.MarkdownString | undefined = undefined;
	let detail: string | undefined = undefined;

	if (fileName === undefined) {
		preview = new vscode.MarkdownString("文件不存在");
	} else {
		previewStr = previewStr.replace('{$FILENAME}', fileName);
		filePath = filePath.replace('{$FILENAME}', fileName);

		let stat = await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
		let size = stat.size / (1024);

		preview = new vscode.MarkdownString(fileName);
		preview.appendMarkdown("\n\n" + "Size: `" + size.toFixed(2) + " KB`"
			+ "\tModified: `" + new Date(stat.mtime).toUTCString() + "`\t");

		detail = await getFileInfo(filePath, type);
		if (detail !== undefined) {
			preview.appendMarkdown(detail);
		}

		preview.appendMarkdown("\n\n");
		preview.appendMarkdown(previewStr);

		preview.baseUri = vscode.Uri.file(filePath);
		preview.supportHtml = true;
	}

	return [preview, detail];
}

// ---------------
// Completion
// ---------------

function getCompletionTypeByFileType(type: FileType) {
	switch (type) {
		case FileType.fx:
		case FileType.characters:
		case FileType.ui:
		case FileType.cg:
		case FileType.patternFade:
			return CompletionType.image;

		case FileType.audio:
		case FileType.bgm:
		case FileType.bgs:
		case FileType.dubs:
		case FileType.se:
			return CompletionType.audio;

		case FileType.video:
			return CompletionType.video;
		case FileType.animation:
			return CompletionType.animation;
		case FileType.script:
			return CompletionType.script;

		default:
			return undefined;
	}
}

function getCompletionList(type: FileType) {
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

function getCompletionFromCompletionList(name: string, fileList: vscode.CompletionItem[]) {
	name = name.toLowerCase();

	for (let file of fileList) {
		let element = file.insertText!.toString().toLowerCase();

		if (element?.startsWith(name)) {
			return file;
		}
	};

	return undefined;
}

export function getFileCompletionByType(type: FileType, fileName: string) {
	// correction to full path
	let ret = getRelativePathAndType(type, fileName);

	if (ret === undefined) {
		return undefined;
	}

	let [corType, corFileName] = ret;

	fileName = corFileName;
	type = corType;

	const completionList = getCompletionList(type);

	if (completionList === undefined) { return undefined; }

	return getCompletionFromCompletionList(fileName, completionList);
}

interface CompletionInfo {
	basePath: string
	completionType: CompletionType
	completionList: vscode.CompletionItem[]
}

function getFileCompletionInfo(filePath: string): CompletionInfo | undefined {
	const type = getPathType(filePath);

	if (type === undefined) { return undefined; }

	const basePath = getBasePathByType(type);

	if (basePath === undefined) { return undefined; }

	const completionType = getCompletionTypeByFileType(type);

	if (completionType === undefined) { return undefined; }

	const completionList = getCompletionList(type);

	if (completionList === undefined) { return undefined; }

	return {
		basePath: basePath,
		completionType: completionType,
		completionList: completionList
	};
}

// completion sort text
const sortTextPrefixDelimiter = '|';

function getSortTextByText(text: string) {
	return text.length.toString() + sortTextPrefixDelimiter + text;
}

function getTextBySortText(sortText: string) {
	return sortText.substring(sortText.indexOf(sortTextPrefixDelimiter) + 1);
}

async function updateCompletion(filePath: string,
	completions: vscode.CompletionItem[],
	basePath: string = "",
	type: CompletionType = CompletionType.image) {
	let fileName: string = filePath.substring(filePath.lastIndexOf("\\") + 1);
	let fileRelativeName: string = filePath.substring(basePath.length + 1);

	let fileNameNoSuffix: string = fileRelativeName.removeAfter('.');
	let fileNameSuffix: string = fileRelativeName.after('.');

	let fileNameToEnglish = stringToEnglish(fileNameNoSuffix);

	let item: vscode.CompletionItem = new vscode.CompletionItem(
		{
			label: fileNameNoSuffix,
			detail: fileNameSuffix,
			// description: ".ogg"
		},
		vscode.CompletionItemKind.File);

	item.insertText = fileRelativeName;
	item.filterText = fileNameToEnglish;
	let previewStr: string = nonePreview;

	switch (type) {
		case CompletionType.image:
			item.detail = "Image file preview";
			previewStr = imagePreview;

			break;
		case CompletionType.audio:
			item.detail = "Audio file";
			previewStr = audioPreview;

			break;
		case CompletionType.video:
			item.detail = "Video file";
			previewStr = videoPreview;

			break;

		case CompletionType.animation:
			item.detail = "Animation file";
			previewStr = animationPreview;

			break;
		case CompletionType.script:
			item.detail = "Script file";
			previewStr = scriptPreview;

			break;
	}

	const [preview, detail] = await getFileComment(previewStr
		, fileName
		, filePath
		, type);

	item.documentation = preview;

	// sort based on file path, shorter is former                    
	item.sortText = getSortTextByText(filePath);

	if (detail !== undefined) {
		completions.push(item);
	}
}

// ---------------
// File Operation
// ---------------

export async function addFile(filePath: string) {
	const completionInfo = getFileCompletionInfo(filePath);

	if (completionInfo === undefined) { return false; }

	const { basePath, completionType, completionList } = completionInfo;

	projectFileList.push([filePath, vscode.FileType.File]);	
	projectFileListCache.removeIf((key, value) => {
		return value.filePath === undefined;
	});

	await updateCompletion(filePath, completionList, basePath, completionType);

	return true;
}

export function removeFile(filePath: string) {
	const completionInfo = getFileCompletionInfo(filePath);

	if (completionInfo === undefined) { return false; }

	const { basePath, completionType, completionList } = completionInfo;

	projectFileList.removeIf((item) => {
		return filePath.iCmp(item[0]);
	});
	projectFileListCache.removeIf((key, value) => {
		return value.filePath !== undefined && value.filePath.iCmp(filePath);
	});

	projectFileInfoList.delete(filePath);
	completionList.removeIf((item) => {
		if (item.sortText === undefined) { return false; }

		return filePath.iCmp(getTextBySortText(item.sortText));
	});

	return true;
}

// ---------------
// Refresh File List
// ---------------

// pass undefined -> update from config
export async function updateBasePath(newPath: string | undefined = undefined, bPopUp: boolean = true) {
	// popup
	let popUp = () => {
		if (bPopUp) {
			vscode.window.showErrorMessage('Invalid base path');
		}

		return false;
	};

	// undefined
	if (newPath === undefined) {
		newPath = vscode.workspace.getConfiguration().get<string>(confBasePath, "");
	}

	// remove ''/""
	while (newPath.startsWith("\'") || newPath.startsWith("\"")) {
		newPath = newPath.substring(1);
	}
	while (newPath.endsWith("\'") || newPath.endsWith("\"")) {
		newPath = newPath.substring(0, newPath.length - 1);
	}


	// exist
	if (!await fileExistsOnDisk(newPath)) {
		return popUp();
	}

	// split
	const ext = path.extname(newPath);
	const dir = path.dirname(newPath);
	const name = path.basename(newPath, ext);

	if (ext !== ".exe" || dir === "" || name === "") {
		return popUp();
	}

	// base path
	const calcBasePath = dir + '\\data';

	// update
	basePath = calcBasePath;
	execPath = newPath;

	basePathUpdated = true;

	updateWatcher();

	return true;
}

export async function updateFileList(progress: vscode.Progress<{
	message?: string | undefined;
	increment?: number | undefined;
}>) {
	while (!fileListInitialized && !fileListInitFirstRun) {
		await sleep(50);
	}

	fileListInitialized = false;

	const total = 100;
	const steps = 31;

	const incrementPerStep = total / steps;

	// ------
	// Step 1
	// ------

	progress.report({ increment: 0, message: "Updating file list..." });

	if (!await updateBasePath()) {
		await vscode.commands.executeCommand(commandBasePath);
	}

	// Update config

	// ------
	// Step 2
	// ------

	progress.report({ increment: 0, message: "Updating settings..." });

	let iniParser = require('ini');
	let encoding: BufferEncoding = 'utf-8';

	let configPath = basePath + "\\..\\settings\\settings.ini";
	projectConfig = iniParser.parse((await getBuffer(configPath)).toString(encoding));

	// ------
	// Step 3
	// ------

	progress.report({ increment: incrementPerStep, message: "Updating LocalSettings..." });

	currentLocalCode = projectConfig.Display.Language;

	let localizationPath = basePath + "\\..\\localization\\Localization.dat";
	let localization = iniParser.parse((await getBuffer(localizationPath)).toString(encoding));

	currentLocalCodeDefinition = localization.Definition;
	currentLocalCodeDisplay = currentLocalCodeDefinition[
		"LanguageDisplayName_" + currentLocalCode];

	dubMapping.loadFile();

	// ------------------------
	// Update file list		
	// ------------------------

	// ------------
	// Graphic
	// ------------

	// ------
	// Step 4
	// ------

	progress.report({ increment: incrementPerStep, message: "Updating graphic fileList..." });

	graphic = basePath + "\\Graphics\\";

	graphicFXPath = graphic + "FX";
	graphicCGPath = graphic + "CG";
	graphicUIPath = graphic + "UI";
	graphicPatternFadePath = graphic + "PatternFade";
	graphicCharactersPath = graphic + "Characters";

	// ------
	// Step 5 ~ 9
	// ------

	progress.report({ increment: incrementPerStep, message: "Updating FX fileList..." });
	let graphicFXFileList = await getDirFileListRecursively(graphicFXPath);
	progress.report({ increment: incrementPerStep, message: "Updating CG fileList..." });
	let graphicCGFileList = await getDirFileListRecursively(graphicCGPath);
	progress.report({ increment: incrementPerStep, message: "Updating UI fileList..." });
	let graphicUIFileList = await getDirFileListRecursively(graphicUIPath);
	progress.report({ increment: incrementPerStep, message: "Updating PatternFade fileList..." });
	let graphicPatternFadeFileList = await getDirFileListRecursively(graphicPatternFadePath);
	progress.report({ increment: incrementPerStep, message: "Updating Characters fileList..." });
	let graphicCharactersFileList = await getDirFileListRecursively(graphicCharactersPath);

	// ------------
	// Audio
	// ------------    

	// ------
	// Step 10
	// ------

	progress.report({ increment: incrementPerStep, message: "Updating audio fileList..." });

	audio = basePath + "\\Audio\\";

	audioBgmPath = audio + "Bgm";
	audioBgsPath = audio + "Bgs";
	audioDubsPath = audio + "Dubs";
	audioSEPath = audio + "SE";

	// ------
	// Step 11 ~ 14
	// ------

	progress.report({ increment: incrementPerStep, message: "Updating BGM fileList..." });
	let audioBgmFileList = await getDirFileListRecursively(audioBgmPath);
	progress.report({ increment: incrementPerStep, message: "Updating BGS fileList..." });
	let audioBgsFileList = await getDirFileListRecursively(audioBgsPath);
	progress.report({ increment: incrementPerStep, message: "Updating Dubs fileList..." });
	let audioDubsFileList = await getDirFileListRecursively(audioDubsPath);
	progress.report({ increment: incrementPerStep, message: "Updating SE fileList..." });
	let audioSEFileList = await getDirFileListRecursively(audioSEPath);

	// ------------
	// Video
	// ------------

	// ------
	// Step 15
	// ------

	progress.report({ increment: incrementPerStep, message: "Updating video fileList..." });

	videoPath = basePath + "\\Assets\\Movies";

	let videoFileList = await getDirFileListRecursively(videoPath);

	// ------------
	// Animation
	// ------------

	// ------
	// Step 16
	// ------

	progress.report({ increment: incrementPerStep, message: "Updating animation fileList..." });

	animationPath = basePath + "\\Assets\\Animation";

	let animationFileList = await getDirFileListRecursively(animationPath);

	// ------------
	// Script
	// ------------

	// ------
	// Step 17
	// ------

	progress.report({ increment: incrementPerStep, message: "Updating script fileList..." });

	scriptPath = basePath + "\\dialogue";

	let scriptFileList = await getDirFileListRecursively(scriptPath);

	// ------------------------
	// Update completion list		
	// ------------------------

	projectFileList = [];
	projectFileList = projectFileList.concat(graphicFXFileList, graphicCGFileList, graphicUIFileList, graphicPatternFadeFileList, graphicCharactersFileList
		, audioBgmFileList, audioBgsFileList, audioDubsFileList, audioSEFileList
		, videoFileList, animationFileList, scriptFileList);

	let generateCompletionList = async (fileList: [string, vscode.FileType][]
		, completions: vscode.CompletionItem[]
		, basePath: string = ""
		, type: CompletionType = CompletionType.image) => {
		if (basePath === "") {
			return;
		}

		let promiseList: Promise<void>[] = [];

		fileList.forEach(async element => {
			if (element[1] === vscode.FileType.File) {
				promiseList.push(new Promise(async (resolve, reject) => {
					await updateCompletion(element[0], completions, basePath, type);
					resolve();
				}));
			}
		});

		await Promise.all(promiseList);
	};

	// ------------
	// Graphic
	// ------------

	// ------
	// Step 18
	// ------

	progress.report({ increment: incrementPerStep, message: "Generating graphic completionList..." });

	graphicFXCompletions = [];
	graphicCGCompletions = [];
	graphicUICompletions = [];
	graphicPatternFadeCompletions = [];
	graphicCharactersCompletions = [];

	// ------
	// Step 19 ~ 23
	// ------

	progress.report({ increment: incrementPerStep, message: "Generating FX completionList..." });
	await generateCompletionList(graphicFXFileList, graphicFXCompletions, graphicFXPath);
	progress.report({ increment: incrementPerStep, message: "Generating CG completionList..." });
	await generateCompletionList(graphicCGFileList, graphicCGCompletions, graphicCGPath);
	progress.report({ increment: incrementPerStep, message: "Generating UI completionList..." });
	await generateCompletionList(graphicUIFileList, graphicUICompletions, graphicUIPath);
	progress.report({ increment: incrementPerStep, message: "Generating PatternFade completionList..." });
	await generateCompletionList(graphicPatternFadeFileList, graphicPatternFadeCompletions, graphicPatternFadePath);
	progress.report({ increment: incrementPerStep, message: "Generating Characters completionList..." });
	await generateCompletionList(graphicCharactersFileList, graphicCharactersCompletions, graphicCharactersPath);

	// ------------
	// Audio
	// ------------   

	// ------
	// Step 24
	// ------

	progress.report({ increment: incrementPerStep, message: "Generating audio completionList..." });

	audioBgmCompletions = [];
	audioBgsCompletions = [];
	audioDubsCompletions = [];
	audioSECompletions = [];

	// ------
	// Step 25 ~ 28
	// ------

	progress.report({ increment: incrementPerStep, message: "Generating BGM completionList..." });
	await generateCompletionList(audioBgmFileList, audioBgmCompletions, audioBgmPath, CompletionType.audio);
	progress.report({ increment: incrementPerStep, message: "Generating BGS completionList..." });
	await generateCompletionList(audioBgsFileList, audioBgsCompletions, audioBgsPath, CompletionType.audio);
	progress.report({ increment: incrementPerStep, message: "Generating Dubs completionList..." });
	await generateCompletionList(audioDubsFileList, audioDubsCompletions, audioDubsPath, CompletionType.audio);
	progress.report({ increment: incrementPerStep, message: "Generating SE completionList..." });
	await generateCompletionList(audioSEFileList, audioSECompletions, audioSEPath, CompletionType.audio);

	// ------------
	// Video
	// ------------

	// ------
	// Step 29
	// ------

	progress.report({ increment: incrementPerStep, message: "Generating video completionList..." });

	videoCompletions = [];

	await generateCompletionList(videoFileList, videoCompletions, videoPath, CompletionType.video);

	// ------------
	// Animation
	// ------------

	// ------
	// Step 30
	// ------

	progress.report({ increment: incrementPerStep, message: "Generating animation completionList..." });

	animationCompletions = [];

	await generateCompletionList(animationFileList, animationCompletions, animationPath, CompletionType.animation);

	// ------------
	// Script
	// ------------

	// ------
	// Step 31
	// ------

	progress.report({ increment: incrementPerStep, message: "Generating script completionList..." });

	scriptCompletions = [];

	await generateCompletionList(scriptFileList, scriptCompletions, scriptPath, CompletionType.script);

	fileListInitialized = true;
	fileListInitFirstRun = false;

	progress.report({ increment: 0, message: "Refresh code lens" });

	// watcher didn't start here, so refresh is needed
	codeLensProviderClass.refresh();

	progress.report({ increment: 0, message: "Done" });
}

// ---------------
// File Definition
// ---------------

function getFilePathFromCompletion(linePrefix: string, fileName: string) {
	let sortText = getFileCompletionByType(getCommandParamFileType(linePrefix), fileName)?.sortText;

	if (sortText === undefined) {
		return undefined;
	}

	const filePath = getTextBySortText(sortText);

	return filePath;
}

function getUriFromCompletion(linePrefix: string, fileName: string) {
	let filePath = getFilePathFromCompletion(linePrefix, fileName);

	if (filePath === undefined) {
		return undefined;
	}

	return vscode.Uri.file(filePath);
};

export const fileDefinition = vscode.languages.registerDefinitionProvider('AvgScript',
	{
		async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
			let definitions: vscode.Location[] = [];

			if (!basePathUpdated) { return undefined; }

			const parseCommentResult = currentLineNotComment(document, position);

			if (parseCommentResult === undefined) {
				return undefined;
			}

			let { line, lineStart, linePrefix, curPos } = parseCommentResult;

			let fileName = getParamAtPosition(line, curPos!);

			if (fileName === undefined) {
				return undefined;
			}

			if (getCommandParamFileType(linePrefix!) === FileType.dubs) {
				const settings = getSettings(document);

				do {
					if (settings && settings.NoSideEffect) {
						let curCache = dubParseCache.getDocumentCache(document);
						let dubState: DubParser | undefined = undefined;

						for (const cache of curCache) {
							if (cache.totalLine > position.line) {
								break;
							}

							dubState = cache.dubParser;
						}

						if (dubState !== undefined) {
							fileName = dubState.getFileRelativePrefix() + fileName;

							break;
						}
					}

					vscode.window.showInformationMessage("Cannot open file " + fileName + " if script has side effect");

					return definitions;
				} while (false);
			}

			const fileUri = getUriFromCompletion(linePrefix!, fileName);

			if (fileUri === undefined) {
				return undefined;
			}

			let link = new vscode.Location(fileUri
				, new vscode.Position(0, 0));

			definitions.push(link);

			return definitions;
		}
	});

