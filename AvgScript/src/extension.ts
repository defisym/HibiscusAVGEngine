import * as vscode from 'vscode';

import { pinyin } from 'pinyin-pro';
import * as mm from 'music-metadata';
import { ImageProbe } from "@zerodeps/image-probe";

import { getNumberOfParam, lineValidForCommandCompletion, getCompletionItemList, getHoverContents, getType, FileType, getParamAtPosition, getIndexOfDelimiter, getFileName, getNthParam, getAllParams, getBuffer, getMapValue, getUri, fileExists, getCommandType, matchEntire, strIsNum, iterateLines, currentLineNotComment, arrayHasValue, getCompletion, iterateArray } from './lib/utilities';
import {
	sharpKeywordList, atKeywordList, keywordList
	, settingsParamList
	, commandDocList, settingsParamDocList, langDocList, commandParamList, ParamType, ParamTypeMap, deprecatedKeywordList, internalKeywordList, internalImageID, inlayHintMap, inlayHintType, ParamFormat, docList
} from './lib/dict';
import { regexNumber, regexHexColor, regexRep } from './lib/regExp';
import { create } from 'domain';

// config
const confBasePath: string = "conf.AvgScript.basePath";
const confCommandExt: string = "conf.AvgScript.commandExtension";

// command
const commandBasePath: string = "config.AvgScript.basePath";
const commandRefreshAssets: string = "config.AvgScript.refreshAssets";
const commandUpdateCommandExtension: string = "config.AvgScript.updateCommandExtension";

// settings
export let currentLocalCode: string;
export let currentLocalCodeDefinition: any;
export let currentLocalCodeDisplay: string;

// file
import path = require("path");

export let basePath: string;

export let graphic: string;

export let graphicFXPath: string;
export let graphicCGPath: string;
export let graphicUIPath: string;
export let graphicPatternFadePath: string;
export let graphicCharactersPath: string;

export let graphicFXCompletions: vscode.CompletionItem[] = [];
export let graphicCGCompletions: vscode.CompletionItem[] = [];
export let graphicUICompletions: vscode.CompletionItem[] = [];
export let graphicPatternFadeCompletions: vscode.CompletionItem[] = [];
export let graphicCharactersCompletions: vscode.CompletionItem[] = [];

export let audio: string;

export let audioBgmPath: string;
export let audioBgsPath: string;
export let audioDubsPath: string;
export let audioSEPath: string;

export let audioBgmCompletions: vscode.CompletionItem[] = [];
export let audioBgsCompletions: vscode.CompletionItem[] = [];
export let audioDubsCompletions: vscode.CompletionItem[] = [];
export let audioSECompletions: vscode.CompletionItem[] = [];

export let videoPath: string;

export let videoCompletions: vscode.CompletionItem[] = [];

export let scriptPath: string;

export let scriptCompletions: vscode.CompletionItem[] = [];

export let labelCompletions: vscode.CompletionItem[] = [];
export let labelJumpMap: Map<string, number> = new Map();

let fileListInitialized = false;

export enum CompletionType { image, audio, video, script };

const nonePreview = "暂无预览";

// const imagePreview = "<div><img src =\"{$FILENAME}\" width = \"300\"/></div>";
const imagePreview = "<div align=\"center\"><img src =\"{$FILENAME}\" height = \"160\"/></div>";
const audioPreview = nonePreview;
const videoPreview = nonePreview;
const scriptPreview = nonePreview;

export async function activate(context: vscode.ExtensionContext) {
	console.log("AvgScript extension activated");

	//--------------------

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

					return "Width: `" + data.width.toString() + "` Height: `" + data.height.toString() + "`";
				case CompletionType.audio:
					const metadata = await mm.parseBuffer(await getBuffer(filePath));

					return "`" + (metadata.format.sampleRate! / 1000).toFixed(1) + "KHz`\t"
						+ "`" + (metadata.format.bitrate! / 1000).toFixed() + "kbps`\t"
						+ getDuration(metadata.format.duration!);
				case CompletionType.video:
					const ffprobe = require('ffprobe');
					const ffprobeStatic = require('ffprobe-static');

					let info = (await ffprobe(filePath, { path: ffprobeStatic.path })).streams[0];

					return "Width: `" + info.width.toString() + "` Height: `" + info.height.toString() + "`\t"
						+ getDuration(info.duration!);
				case CompletionType.script:
					const commentRegex = new RegExp("(\\/\\*(.|[\r\n])*?\\*\\/)|(\\/\\/[^\r\n]*)|(\\([^\r\n]*)|Lang\\[(?!" + currentLocalCode + ").*\\].*", "gi");
					const blankRegex = new RegExp(";.*|\s*$|#begin.*|#end.*", "gi");
					const string = (await getBuffer(filePath)).toString('utf-8').replace(commentRegex, "");
					const lines = string.split('\r\n');

					for (let i in lines) {
						let line = lines[i].trim().replace(blankRegex, "");

						if (line.length > 0
							&& !line.startsWith("#")
							&& !line.startsWith("@")) {
							return "\n\n" + line;
						}
					}
			}
		}
		catch (err) {
			console.log(filePath);
			console.log(err);

			return undefined;
		}
	}

	async function getFileComment(previewStr: string
		, fileName: string | undefined
		, filePath: string
		, type: CompletionType) {
		let preview: vscode.MarkdownString | undefined = undefined;

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

			let detail = await getFileInfo(filePath, type);
			if (detail !== undefined) {
				preview.appendMarkdown(detail);
			}

			preview.appendMarkdown("\n\n");
			preview.appendMarkdown(previewStr);

			preview.baseUri = vscode.Uri.file(filePath);
			preview.supportHtml = true;
		}

		return preview;
	}

	async function getFileList(uri: vscode.Uri) {
		return vscode.workspace.fs.readDirectory(uri);
	}

	async function getFileListRecursively(filePath: string) {
		let fileList: [string, vscode.FileType][] = [];
		await getFileListRecursivelyFunc(filePath, fileList);

		return fileList;
	}

	async function getFileListRecursivelyFunc(filePath: string, fileList: [string, vscode.FileType][]) {
		let uri = vscode.Uri.file(filePath);
		let result: [string, vscode.FileType][] = await getFileList(uri);
		let promiseList: Promise<void>[] = [];

		for (let i in result) {
			let fileName = result[i][0];
			let type = result[i][1];

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

	async function updateFileList(progress: vscode.Progress<{
		message?: string | undefined;
		increment?: number | undefined;
	}>) {
		const total = 100;
		const steps = 27;

		const incrementPerStep = total / steps;

		progress.report({ increment: 0, message: "Updating file list..." });

		basePath = vscode.workspace.getConfiguration().get<string>(confBasePath, "");

		if (basePath === "") {
			return;
		}

		// Update config
		progress.report({ increment: 0, message: "Updating settings..." });

		let iniParser = require('ini');
		let encoding: BufferEncoding = 'utf-8';

		let configPath = basePath + "\\..\\settings\\settings.ini";
		let config = iniParser.parse((await getBuffer(configPath)).toString(encoding));

		progress.report({ increment: incrementPerStep, message: "Updating LocalSettings..." });

		currentLocalCode = config.Display.Language;

		let localizationPath = basePath + "\\..\\localization\\Localization.dat";
		let localization = iniParser.parse((await getBuffer(localizationPath)).toString(encoding));

		currentLocalCodeDefinition = localization.Definition;
		currentLocalCodeDisplay = currentLocalCodeDefinition[
			"LanguageDisplayName_" + currentLocalCode];

		// Update completion list		
		progress.report({ increment: incrementPerStep, message: "Updating graphic fileList..." });

		graphic = basePath + "\\Graphics\\";

		graphicFXPath = graphic + "FX";
		graphicCGPath = graphic + "CG";
		graphicUIPath = graphic + "UI";
		graphicPatternFadePath = graphic + "PatternFade";
		graphicCharactersPath = graphic + "Characters";

		progress.report({ increment: incrementPerStep, message: "Updating FX fileList..." });
		let graphicFX = await getFileListRecursively(graphicFXPath);
		// let graphicFX = await getFileList(vscode.Uri.file(graphicFXPath));
		progress.report({ increment: incrementPerStep, message: "Updating CG fileList..." });
		let graphicCG = await getFileListRecursively(graphicCGPath);
		progress.report({ increment: incrementPerStep, message: "Updating UI fileList..." });
		let graphicUI = await getFileListRecursively(graphicUIPath);
		progress.report({ increment: incrementPerStep, message: "Updating PatternFade fileList..." });
		let graphicPatternFade = await getFileListRecursively(graphicPatternFadePath);
		progress.report({ increment: incrementPerStep, message: "Updating Characters fileList..." });
		let graphicCharacters = await getFileListRecursively(graphicCharactersPath);

		progress.report({ increment: incrementPerStep, message: "Updating audio fileList..." });

		audio = basePath + "\\Audio\\";

		audioBgmPath = audio + "Bgm";
		audioBgsPath = audio + "Bgs";
		audioDubsPath = audio + "Dubs";
		audioSEPath = audio + "SE";

		progress.report({ increment: incrementPerStep, message: "Updating BGM fileList..." });
		let audioBgm = await getFileListRecursively(audioBgmPath);
		progress.report({ increment: incrementPerStep, message: "Updating BGS fileList..." });
		let audioBgs = await getFileListRecursively(audioBgsPath);
		progress.report({ increment: incrementPerStep, message: "Updating Dubs fileList..." });
		let audioDubs = await getFileListRecursively(audioDubsPath);
		progress.report({ increment: incrementPerStep, message: "Updating SE fileList..." });
		let audioSE = await getFileListRecursively(audioSEPath);

		progress.report({ increment: incrementPerStep, message: "Updating video fileList..." });
		videoPath = basePath + "\\Assets\\Movies\\";

		let videoVideo = await getFileListRecursively(videoPath);

		progress.report({ increment: incrementPerStep, message: "Updating script fileList..." });

		scriptPath = basePath + "\\dialogue";
		let script = await getFileListRecursively(scriptPath);

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
						let fileName: string = element[0].substring(element[0].lastIndexOf("\\") + 1);
						let fileRelativeName: string = element[0].substring(basePath.length + 1);

						// let fileNameNoSuffix: string = fileName.lastIndexOf(".") === -1 ? fileName : fileName.substring(0, fileName.lastIndexOf("."));
						let fileNameNoSuffix: string = fileRelativeName.lastIndexOf(".") === -1 ? fileRelativeName : fileRelativeName.substring(0, fileRelativeName.lastIndexOf("."));
						// let fileNameSuffix: string = fileName.lastIndexOf(".") === -1 ? "" : fileName.substring(fileName.lastIndexOf("."));
						let fileNameSuffix: string = fileRelativeName.lastIndexOf(".") === -1 ? "" : fileRelativeName.substring(fileRelativeName.lastIndexOf("."));

						// let filePath: string = basePath + "\\{$FILENAME}";
						let filePath: string = element[0];

						let py = pinyin(fileNameNoSuffix
							, {
								toneType: 'none',
								nonZh: 'consecutive'
							});

						let romanize: string = require('japanese').romanize(fileNameNoSuffix);

						let delimiter = "\t\t";
						let fileNameToEnglish = fileNameNoSuffix + delimiter + py + delimiter + romanize;

						let item: vscode.CompletionItem = new vscode.CompletionItem({
							label: fileNameNoSuffix
							, detail: fileNameSuffix
							// , description: ".ogg"
						}
							, vscode.CompletionItemKind.File);

						item.insertText = fileRelativeName;
						item.filterText = fileNameToEnglish;
						let previewStr: string = nonePreview;
						let detail: string | undefined = undefined;

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
								previewStr = videoPreview;
								item.detail = "Video file";

								break;
							case CompletionType.script:
								item.detail = "Script file";
								previewStr = scriptPreview;

								break;
						}

						// normal
						// item.documentation = await getFileComment(previewStr
						// 	, element[0]
						// 	, filePath
						// 	, type);

						// recursive
						item.documentation = await getFileComment(previewStr
							, fileName
							, filePath
							, type);

						// sort based on file path
						item.sortText = filePath;

						completions.push(item);

						resolve();
					}));
				}
			});

			await Promise.all(promiseList);
		};

		progress.report({ increment: incrementPerStep, message: "Generating graphic completionList..." });

		graphicFXCompletions = [];
		graphicCGCompletions = [];
		graphicUICompletions = [];
		graphicPatternFadeCompletions = [];
		graphicCharactersCompletions = [];

		progress.report({ increment: incrementPerStep, message: "Generating FX completionList..." });
		await generateCompletionList(graphicFX, graphicFXCompletions, graphicFXPath);
		progress.report({ increment: incrementPerStep, message: "Generating CG completionList..." });
		await generateCompletionList(graphicCG, graphicCGCompletions, graphicCGPath);
		progress.report({ increment: incrementPerStep, message: "Generating UI completionList..." });
		await generateCompletionList(graphicUI, graphicUICompletions, graphicUIPath);
		progress.report({ increment: incrementPerStep, message: "Generating PatternFade completionList..." });
		await generateCompletionList(graphicPatternFade, graphicPatternFadeCompletions, graphicPatternFadePath);
		progress.report({ increment: incrementPerStep, message: "Generating Characters completionList..." });
		await generateCompletionList(graphicCharacters, graphicCharactersCompletions, graphicCharactersPath);

		progress.report({ increment: incrementPerStep, message: "Generating audio completionList..." });

		audioBgmCompletions = [];
		audioBgsCompletions = [];
		audioDubsCompletions = [];
		audioSECompletions = [];

		progress.report({ increment: incrementPerStep, message: "Generating BGM completionList..." });
		await generateCompletionList(audioBgm, audioBgmCompletions, audioBgmPath, CompletionType.audio);
		progress.report({ increment: incrementPerStep, message: "Generating BGS completionList..." });
		await generateCompletionList(audioBgs, audioBgsCompletions, audioBgsPath, CompletionType.audio);
		progress.report({ increment: incrementPerStep, message: "Generating Dubs completionList..." });
		await generateCompletionList(audioDubs, audioDubsCompletions, audioDubsPath, CompletionType.audio);
		progress.report({ increment: incrementPerStep, message: "Generating SE completionList..." });
		await generateCompletionList(audioSE, audioSECompletions, audioSEPath, CompletionType.audio);

		progress.report({ increment: incrementPerStep, message: "Generating video completionList..." });

		videoCompletions = [];

		await generateCompletionList(videoVideo, videoCompletions, videoPath, CompletionType.video);

		progress.report({ increment: incrementPerStep, message: "Generating script completionList..." });

		scriptCompletions = [];

		await generateCompletionList(script, scriptCompletions, scriptPath, CompletionType.script);

		progress.report({ increment: 0, message: "Done" });

		fileListInitialized = true;
	}

	//--------------------

	vscode.commands.executeCommand(commandUpdateCommandExtension);
	vscode.commands.executeCommand(commandRefreshAssets);

	//--------------------

	const sharpCommands = vscode.languages.registerCompletionItemProvider(
		'AvgScript',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

				if (line === undefined) {
					return undefined;
				}

				if (!lineValidForCommandCompletion(linePrefix!)) {
					return undefined;
				}

				return getCompletionItemList(sharpKeywordList, commandDocList);
			}
		},
		'#' // triggered whenever a '#' is being typed
	);

	const atCommands = vscode.languages.registerCompletionItemProvider(
		'AvgScript',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

				if (line === undefined) {
					return undefined;
				}

				if (!lineValidForCommandCompletion(linePrefix!)) {
					return undefined;
				}

				return getCompletionItemList(atKeywordList, commandDocList);
			}
		},
		'@' // triggered whenever a '@' is being typed
	);

	const settingsParam = vscode.languages.registerCompletionItemProvider(
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

				return getCompletionItemList(settingsParamList, settingsParamDocList);
			}
		},
		'=', '|'
	);

	const langPrefix = vscode.languages.registerCompletionItemProvider(
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

	const fileSuffix = vscode.languages.registerCompletionItemProvider(
		'AvgScript',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

				if (line === undefined) {
					return undefined;
				}

				switch (getType(linePrefix!)) {
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

	const fileName = vscode.languages.registerCompletionItemProvider(
		'AvgScript',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

				if (line === undefined) {
					return undefined;
				}

				if (!fileListInitialized) {
					let ret = new vscode.CompletionItem("Loading file list, please wait...");
					ret.preselect = true;
					ret.insertText = "";

					return [ret];
				}

				switch (getType(linePrefix!)) {
					case FileType.inValid:
						return undefined;

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

					case FileType.script:
						return scriptCompletions;
					case FileType.frame:
					case FileType.label:
						return labelCompletions;

					default:
						return undefined;
				}
			}
		},
		'=', ':'
	);

	context.subscriptions.push(sharpCommands, atCommands
		, settingsParam
		, langPrefix
		, fileSuffix
		, fileName);

	//--------------------


	const inlayHint = vscode.languages.registerInlayHintsProvider('AvgScript', {
		provideInlayHints(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken) {
			let hints: vscode.InlayHint[] = [];

			iterateLines(document, (text, lineNumber
				, lineStart, lineEnd
				, firstLineNotComment) => {
				if (lineNumber >= range.start.line
					&& lineNumber <= range.end.line) {
					if (text.startsWith("#")
						|| text.startsWith("@")) {
						const params = getAllParams(text);
						const command = params[0].substring(1);
						const paramNum = params.length - 1;
						const paramDefinition = getMapValue(command, commandParamList);

						let contentStart: number = lineStart + command.length + 1;

						if (paramDefinition === undefined) {
							return;
						}

						const paramInlayHintType = paramDefinition.inlayHintType;

						if (paramInlayHintType === undefined) {
							return;
						}

						let curLinePrefix = params[0];

						for (let j = 1; j < params.length; j++) {
							let curParam = params[j];
							let currentInlayHintType: number = paramInlayHintType[j - 1];

							curLinePrefix = curLinePrefix + ":" + curParam;
							const commandType = getCommandType(curLinePrefix);

							if (currentInlayHintType === inlayHintType.ColorHex) {
								if (j !== params.length - 1) {
									currentInlayHintType = inlayHintType.ColorRGB_R;
								}
							}

							const currentInlayHint = inlayHintMap.get(currentInlayHintType);

							contentStart++;

							if (currentInlayHint !== undefined) {
								let hint = new vscode.InlayHint(new vscode.Position(lineNumber, contentStart)
									, currentInlayHint + ":"
									, vscode.InlayHintKind.Parameter);

								hints.push(hint);
							}

							contentStart += curParam.length;
						}
					}
				}
			});

			return hints;
		}
	});

	context.subscriptions.push(inlayHint);

	//--------------------

	const hover = vscode.languages.registerHoverProvider('AvgScript', {
		provideHover(document, position, token) {
			let range = document.getWordRangeAtPosition(position);

			if (!range) {
				return undefined;
			}

			let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

			if (line === undefined) {
				return undefined;
			}

			let word: string = document.getText(range).toLowerCase();

			if (line.startsWith('#Settings='.toLowerCase())) {
				return new vscode.Hover(getHoverContents(word, settingsParamDocList));
			}

			if (getNumberOfParam(linePrefix!) === 0) {
				if ((linePrefix!.lastIndexOf('@', curPos!) !== -1
					|| linePrefix!.lastIndexOf('#', curPos!) !== -1)) {
					return new vscode.Hover(getHoverContents(word, commandDocList));
				}
				else if (line.startsWith('Lang'.toLowerCase())
					&& curPos! <= 'Lang[ZH]'.length) {
					return new vscode.Hover(getHoverContents(word, langDocList));
				}
			}

			return undefined;
		}
	});

	const hoverFile = vscode.languages.registerHoverProvider('AvgScript', {
		async provideHover(document, position, token) {
			if (!fileListInitialized) {
				return undefined;
			}

			let range = document.getWordRangeAtPosition(position);

			if (!range) {
				return undefined;
			}

			let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

			if (line === undefined) {
				return undefined;
			}

			let fileName = getParamAtPosition(line, curPos!);

			if (fileName === undefined) {
				return undefined;
			}

			switch (getType(linePrefix!)) {
				case FileType.characters:
					return new vscode.Hover(getCompletion(fileName, graphicCharactersCompletions)?.documentation!);
				case FileType.ui:
					return new vscode.Hover(getCompletion(fileName, graphicUICompletions)?.documentation!);
				case FileType.cg:
					return new vscode.Hover(getCompletion(fileName, graphicCGCompletions)?.documentation!);
				case FileType.patternFade:
					return new vscode.Hover(getCompletion(fileName, graphicPatternFadeCompletions)?.documentation!);

				case FileType.bgm:
					return new vscode.Hover(getCompletion(fileName, audioBgmCompletions)?.documentation!);
				case FileType.bgs:
					return new vscode.Hover(getCompletion(fileName, audioBgsCompletions)?.documentation!);
				case FileType.dubs:
					return new vscode.Hover(getCompletion(fileName, audioDubsCompletions)?.documentation!);
				case FileType.se:
					return new vscode.Hover(getCompletion(fileName, audioSECompletions)?.documentation!);

				case FileType.video:
					return new vscode.Hover(getCompletion(fileName, videoCompletions)?.documentation!);

				case FileType.script:
					return new vscode.Hover(getCompletion(fileName, scriptCompletions)?.documentation!);
				case FileType.frame:
				case FileType.label:
					return new vscode.Hover(new vscode.MarkdownString(getLabelComment(fileName)));
				default:
					return undefined;
			}

			// let returnHover = async function (previewStr: string
			// 	, fileName: string | undefined
			// 	, filePath: string
			// 	, type: CompletionType) {
			// 	return new vscode.Hover(await getFileComment(previewStr
			// 		, fileName
			// 		, filePath
			// 		, type));
			// };

			// switch (getType(linePrefix!)) {
			// 	case FileType.characters:
			// 		return returnHover(imagePreview
			// 			, getFileName(fileName, graphicCharactersCompletions)
			// 			, graphicCharactersPath + "\\{$FILENAME}"
			// 			, CompletionType.image);
			// 	case FileType.ui:
			// 		return returnHover(imagePreview
			// 			, getFileName(fileName, graphicUICompletions)
			// 			, graphicUIPath + "\\{$FILENAME}"
			// 			, CompletionType.image);
			// 	case FileType.cg:
			// 		return returnHover(imagePreview
			// 			, getFileName(fileName, graphicCGCompletions)
			// 			, graphicCGPath + "\\{$FILENAME}"
			// 			, CompletionType.image);
			// 	case FileType.patternFade:
			// 		return returnHover(imagePreview
			// 			, getFileName(fileName, graphicPatternFadeCompletions)
			// 			, graphicPatternFadePath + "\\{$FILENAME}"
			// 			, CompletionType.image);

			// 	case FileType.bgm:
			// 		return returnHover(audioPreview
			// 			, getFileName(fileName, audioBgmCompletions)
			// 			, audioBgmPath + "\\{$FILENAME}"
			// 			, CompletionType.audio);
			// 	case FileType.bgs:
			// 		return returnHover(audioPreview
			// 			, getFileName(fileName, audioBgsCompletions)
			// 			, audioBgsPath + "\\{$FILENAME}"
			// 			, CompletionType.audio);
			// 	case FileType.dubs:
			// 		return returnHover(audioPreview
			// 			, getFileName(fileName, audioDubsCompletions)
			// 			, audioDubsPath + "\\{$FILENAME}"
			// 			, CompletionType.audio);
			// 	case FileType.se:
			// 		return returnHover(audioPreview
			// 			, getFileName(fileName, audioSECompletions)
			// 			, audioSEPath + "\\{$FILENAME}"
			// 			, CompletionType.audio);

			// 	// case FileType.video:
			// 	case FileType.script:
			// 		return returnHover(audioPreview
			// 			, getFileName(fileName, scriptCompletions)
			// 			, scriptPath + "\\{$FILENAME}"
			// 			, CompletionType.script);
			// 	case FileType.frame:
			// 	case FileType.label:
			// 		return new vscode.Hover(new vscode.MarkdownString(getLabelComment(fileName)));
			// 	default:
			// 		return undefined;
			// }
		}
	});

	context.subscriptions.push(hover, hoverFile);

	//--------------------

	const colorProvider = vscode.languages.registerColorProvider('AvgScript',
		new (class implements vscode.DocumentColorProvider {
			provideDocumentColors(
				document: vscode.TextDocument, token: vscode.CancellationToken
			): vscode.ProviderResult<vscode.ColorInformation[]> {
				// find all colors in the document
				let colors: vscode.ColorInformation[] = [];

				iterateLines(document, (text, lineNumber
					, lineStart, lineEnd
					, firstLineNotComment) => {
					const params = getAllParams(text);
					const paramNum = params.length - 1;

					// match command that set RGB
					let handleHex = (hex: string, start: number) => {
						let charPos = 0;

						if (hex.startsWith("#")) {
							charPos += 1;
						}
						else if (hex.toLowerCase().startsWith("0x".toLowerCase())) {
							charPos += 2;
						}

						let getColor = (colorStr: string) => {
							let ret = parseInt(colorStr.substring(charPos, charPos + 2), 16);
							charPos += 2;

							return ret;
						};

						let R = getColor(hex);
						let G = getColor(hex);
						let B = getColor(hex);

						let range = new vscode.Range(lineNumber, start, lineNumber, start + hex.length);
						let color = new vscode.Color(R / 255.0, G / 255.0, B / 255.0, 1.0);
						colors.push(new vscode.ColorInformation(range, color));
					};

					let handleRGB = (r: string, g: string, b: string, start: number) => {
						if (strIsNum(r) && strIsNum(g) && strIsNum(b)) {
							let R = parseInt(r, 10);
							let G = parseInt(g, 10);
							let B = parseInt(b, 10);

							let range = new vscode.Range(lineNumber, start
								, lineNumber, start + r.length + 1 + g.length + 1 + b.length);
							let color = new vscode.Color(R / 255.0, G / 255.0, B / 255.0, 1.0);
							colors.push(new vscode.ColorInformation(range, color));
						}
					};

					let handle = (paramStart: number, start: number) => {
						if (paramNum === paramStart) {
							handleHex(params[paramStart], start);
						}
						if (paramNum === paramStart) {
							handleRGB(params[paramStart], params[paramStart + 1], params[paramStart + 2], start);
						}
					};


					if (text.startsWith("#")
						|| text.startsWith("@")) {
						const command = params[0].substring(1);
						const paramDefinition = getMapValue(command, commandParamList);

						if (paramDefinition === undefined) {
							return;
						}

						let contentStart: number = lineStart + command.length + 1;

						const paramFormat = paramDefinition.type;

						for (let j = 1; j < params.length; j++) {
							let curParam = params[j];
							let currentType = paramFormat[j - 1];

							contentStart++;

							if (curParam.match(regexRep)) {
								continue;
							}

							if (currentType === ParamType.Color) {
								handle(j, contentStart);
							}

							contentStart += curParam.length;
						}
					}
				});

				return colors;
			}
			provideColorPresentations(
				color: vscode.Color, context: { document: vscode.TextDocument, range: vscode.Range }, token: vscode.CancellationToken
			): vscode.ProviderResult<vscode.ColorPresentation[]> {
				// user hovered/tapped the color block/return the color they picked
				let colors: vscode.ColorPresentation[] = [];
				let document = context.document;
				let range = context.range;

				const line = document.lineAt(range.start.line).text;
				const text = line.substring(range.start.character, range.end.character);
				const oldRange = new vscode.Range(range.start.line, range.start.character, range.start.line, range.start.character + text.length);

				const colR = Math.round(color.red * 255);
				const colG = Math.round(color.green * 255);
				const colB = Math.round(color.blue * 255);

				let colorLabel: string = "";
				if (text.substring(text.length - 8).match(regexHexColor)) {
					let toHex = (color: number) => {
						let hex = color.toString(16);
						return hex.length === 1 ? "0" + hex : hex;
					};

					colorLabel = (toHex(colR) + toHex(colG) + toHex(colB)).toUpperCase();

					if (text.startsWith("#")) {
						colorLabel = "#" + colorLabel;
					}
					else if (text.toLowerCase().startsWith("0x".toLowerCase())) {
						colorLabel = "0x" + colorLabel;
					}
				} else {
					colorLabel = colR.toString(10) + ":" + colG.toString(10) + ":" + colB.toString(10);
				}

				if (colorLabel.length > 0) {
					let rgbColorPres = new vscode.ColorPresentation(colorLabel);
					rgbColorPres.textEdit = new vscode.TextEdit(oldRange, colorLabel);
					colors.push(rgbColorPres);
				}

				return colors;
			}
		})()
	);

	context.subscriptions.push(colorProvider);

	//--------------------


	vscode.commands.registerCommand(commandBasePath, async () => {
		// 1) Getting the value
		let oldBasePath = vscode.workspace.getConfiguration().get<string>(confBasePath, "");

		const value = await vscode.window.showInputBox({
			value: oldBasePath,
			prompt: "Base path for the assets files"
		});

		if (value !== undefined
			&& value !== oldBasePath) {
			// 2) Get the configuration
			const configuration = vscode.workspace.getConfiguration();

			// 3) Get the current value
			//const currentValue = configuration.get<{}>(confBasePath);

			// 4) Update the value in the User Settings
			if (value.endsWith("\\")) {
				basePath = value.substring(0, value.length - 1);
			} else {
				basePath = value;
			}

			await configuration.update(confBasePath
				, basePath
				//, vscode.ConfigurationTarget.Workspace);
				, false);

			// 5) Update fileList
			vscode.window.withProgress({
				// location: vscode.ProgressLocation.Notification,
				location: vscode.ProgressLocation.Window,
				title: "Refreshing assets...\t",
				cancellable: false
			}, async (progress, token) => {
				await updateFileList(progress);
				refreshFileDiagnostics();
			});
		}
	});

	vscode.commands.registerCommand(commandRefreshAssets, async () => {
		basePath = vscode.workspace.getConfiguration().get<string>(confBasePath, "");

		if (basePath === "") {
			vscode.commands.executeCommand(commandBasePath);
		}

		vscode.window.withProgress({
			// location: vscode.ProgressLocation.Notification,
			location: vscode.ProgressLocation.Window,
			title: "Refreshing assets...\t",
			cancellable: false
		}, async (progress, token) => {
			await updateFileList(progress);
			refreshFileDiagnostics();
		});
	});

	vscode.commands.registerCommand(commandUpdateCommandExtension, async () => {
		interface CommandExt {
			// basic
			prefix: string,
			command: string,
			description: string[],

			// diagnostic
			minParam: number,
			maxParam: number,
			paramType: string[],

			// inlayHint
			inlayHint: string[],
		}

		let commandExt = vscode.workspace.getConfiguration().get<CommandExt[]>(confCommandExt);

		if (commandExt === undefined) {
			return;
		}

		let insertCommandExt = (commandExtItem: CommandExt, commandList: string[], commandDocList: docList,) => {
			let command = commandExtItem.command;

			commandList.push(command);
			keywordList.push(command);

			let paramFormat: ParamFormat = { minParam: 0, maxParam: 0, type: [], inlayHintType: [] };

			paramFormat.minParam = Math.max(0, commandExtItem.minParam);
			paramFormat.maxParam = Math.max(paramFormat.minParam, commandExtItem.maxParam);

			for (let type in commandExtItem.paramType) {
				paramFormat.type.push(ParamTypeMap.get(commandExtItem.paramType[type])!);
			}

			let inlayHints = commandExtItem.inlayHint;

			if (inlayHints !== undefined) {
				for (let hints in inlayHints) {
					let pos = inlayHintMap.size;
					inlayHintMap.set(pos, inlayHints[hints]);
					paramFormat.inlayHintType?.push(pos);
				}
			}

			commandParamList.set(command, paramFormat);

			let description = commandExtItem.description;

			if (description !== undefined) {
				commandDocList.set(command, description);
			}
		};

		for (let i in commandExt!) {
			if (commandExt[i].prefix === "#") {
				insertCommandExt(commandExt[i], sharpKeywordList, commandDocList);
			} else if (commandExt[i].prefix === "@") {
				insertCommandExt(commandExt[i], atKeywordList, commandDocList);
			}
		}

		if (activeEditor === undefined) {
			return;
		}

		let activeDocument = activeEditor.document;

		updateDiagnostics(activeDocument, fileListInitialized);
	});

	//--------------------

	const nonActiveLanguageDecorator = vscode.window.createTextEditorDecorationType({
		opacity: '0.5',
	});

	//--------------------

	const labelDefinition = vscode.languages.registerDefinitionProvider('AvgScript',
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
					const paramDefinition = getMapValue(command, commandParamList);

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

						if (currentType === inlayHintType.Label) {
							let curLabel = curParam;

							labelJumpMap.forEach((line, label) => {
								if (curLabel.toLowerCase() === label.toLowerCase()) {
									let link = new vscode.Location(document.uri
										, new vscode.Position(line, 0));

									definitions.push(link);
								}
							});
						}

						contentStart += curParam.length;
					}
				}

				// if (getType(line) !== FileType.label) {
				// 	return undefined;
				// }

				// let curLabel = getNthParam(line, 1);

				// labelJumpMap.forEach((line, label) => {
				// 	if (curLabel === label) {
				// 		let link = new vscode.Location(document.uri
				// 			, new vscode.Position(line, 0));

				// 		definitions.push(link);
				// 	}
				// });

				return definitions;
			}
		});

	const fileDefinition = vscode.languages.registerDefinitionProvider('AvgScript',
		{
			async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
				let definitions: vscode.Location[] = [];

				let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

				if (line === undefined) {
					return undefined;
				}

				let fileName = getParamAtPosition(line, curPos!);

				if (fileName === undefined) {
					return undefined;
				}

				const fileUri = getUri(linePrefix!, fileName);

				if (fileUri === undefined) {
					return undefined;
				}

				let link = new vscode.Location(fileUri
					, new vscode.Position(0, 0));

				definitions.push(link);

				return definitions;
			}
		});

	context.subscriptions.push(labelDefinition
		, fileDefinition);

	//--------------------

	const labelReference = vscode.languages.registerReferenceProvider(
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
					const paramDefinition = getMapValue(command, commandParamList);

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

						if (currentType === inlayHintType.Label) {
							if (curParam.toLowerCase() === label.toLowerCase()) {
								let link = new vscode.Location(document.uri
									, new vscode.Position(lineNumber, 0));

								references.push(link);
							}
						}

						contentStart += curParam.length;
					}
				}


				// if (getType(text) === FileType.label) {
				// 	let curLabel = getNthParam(text, 1);

				// 	if (curLabel === label) {
				// 		let link = new vscode.Location(document.uri
				// 			, new vscode.Position(lineNumber, 0));

				// 		references.push(link);
				// 	}
				// }
			});

			return references;
		}
	});

	context.subscriptions.push(labelReference);

	//--------------------

	const rename = vscode.languages.registerRenameProvider(
		'AvgScript', {
		provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken) {
			const edit = new vscode.WorkspaceEdit();

			let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

			if (line === undefined) {
				return undefined;
			}

			let word: string;

			let replaceToken = (origin: string) => {
				const suffixPos = origin.lastIndexOf('.');
				let originNoSuffix: string = origin;
				let originHasSuffix = suffixPos !== -1;

				if (originHasSuffix) {
					originNoSuffix = origin.substring(0, suffixPos);
					newName = newName + origin.substring(suffixPos);
				}

				iterateLines(document, (text, lineNumber
					, lineStart, lineEnd
					, firstLineNotComment) => {
					if (text.startsWith("#")
						|| text.startsWith("@")
						|| text.startsWith(";")) {
						const regex = new RegExp(originNoSuffix, "gi");
						let contentStart: number = 0;

						if (text.startsWith(";")) {
							contentStart = 1;
						} else if (getNumberOfParam(text) !== 0) {
							let delimiterPos = getIndexOfDelimiter(text, 0);

							if (delimiterPos === -1) {
								return;
							}

							contentStart = delimiterPos + 1;
						} else {
							return;
						}

						let params = getAllParams(text.substring(contentStart));
						let startPos = lineStart + contentStart;

						for (let i = 0; i < params.length; i++) {
							let curParam = params[i];

							const curSuffixPos = curParam.lastIndexOf('.');
							let curHasSuffix = curSuffixPos !== -1;

							let match = curParam.match(regex);
							if (match) {
								if (!originHasSuffix
									&& !curHasSuffix
									&& match[0] !== curParam) {
									continue;
								}

								let endPos = startPos
									+ (curHasSuffix
										? curParam.length
										: match[0].length);

								edit.replace(document.uri
									, new vscode.Range(lineNumber
										, startPos
										, lineNumber
										, endPos)
									, newName);
							}

							startPos += curParam.length;
						}
					}
				});

				return edit;
			};

			if (line.startsWith("#")
				|| line.startsWith("@")) {
				if (getNumberOfParam(linePrefix!) === 0) {
					return undefined;
				}

				word = getParamAtPosition(line, curPos!)!;

				return replaceToken(word);
			} else if (line.startsWith(";")) {
				word = line.substring(line.indexOf(";") + 1);

				return replaceToken(word);
			}

			return undefined;
		}
	});

	context.subscriptions.push(rename);

	//--------------------

	const outline = vscode.languages.registerDocumentSymbolProvider('AvgScript'
		, {
			provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken) {
				let symbols: vscode.SymbolInformation[] = [];

				let prevSecName: string[] = [''];
				let prevSecRangeStart: number[] = [];

				let inComment: boolean = false;

				const beginRegex = /^#Begin/gi;
				const endRegex = /^#End/gi;
				const labelRegex = /^;.*/gi;
				const keyWordRegex = /^(((#CreateSwitch|#Call|#CMP|@SetBattleScript).*)|(.*JMP.*)|(#SkipAnchor|#Ret|#StopFF|#StopFastForward))/gi;

				iterateLines(document, (text, lineNumber
					, lineStart, lineEnd
					, firstLineNotComment) => {
					let item: vscode.SymbolInformation | undefined = undefined;
					let match: RegExpMatchArray | null;

					if ((match = text.match(beginRegex)) !== null) {
						let beginName = text.substring("#Begin".length + 1).trim();

						prevSecName.push(beginName);
						prevSecRangeStart.push(lineNumber);
					}

					if ((match = text.match(endRegex)) !== null) {
						if (prevSecName.length === 1) {
							return;
						}

						let beginName = prevSecName.pop()!;

						item = new vscode.SymbolInformation("Block: " + beginName
							, vscode.SymbolKind.Namespace
							, beginName
							, new vscode.Location(document.uri
								, new vscode.Range(
									new vscode.Position(prevSecRangeStart.pop()!, 0)
									, new vscode.Position(lineNumber, 0))));

					}

					if ((match = text.match(labelRegex)) !== null) {
						let labelName = text.substring(text.indexOf(";") + 1);

						item = new vscode.SymbolInformation("Label: " + labelName
							, vscode.SymbolKind.String
							, prevSecName[prevSecName.length - 1]
							, new vscode.Location(document.uri, new vscode.Position(lineNumber, 0)));
					}

					if ((match = text.match(keyWordRegex)) !== null) {
						let keyWord = match[0];

						item = new vscode.SymbolInformation("KeyWord: " + keyWord
							, vscode.SymbolKind.Function
							, prevSecName[prevSecName.length - 1]
							, new vscode.Location(document.uri, new vscode.Position(lineNumber, 0)));
					}

					if (item !== undefined) {
						symbols.push(item);
					}
				});

				return symbols;
			}
		});

	context.subscriptions.push(outline);

	//--------------------

	const diagnosticsCollection = vscode.languages.createDiagnosticCollection('AvgScript');

	function updateDiagnostics(document: vscode.TextDocument, checkFile: boolean = false) {
		if (document.languageId !== 'AvgScript') {
			return;
		}

		let diagnostics: vscode.Diagnostic[] = [];
		let labels: string[] = [];
		let blockCount: number = 0;
		let blockPos: vscode.Range[] = [];

		let settings = false;
		let liteMode = false;
		let EOF = false;
		let nextJMP = false;

		iterateLines(document, (text, lineNumber
			, lineStart, lineEnd
			, firstLineNotComment) => {
			if (text.startsWith(";")) {
				if (labels.includes(text)) {
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
						, "Duplicated Label: " + text.substring(1)
						, vscode.DiagnosticSeverity.Warning));

					return;
				}

				labels.push(text);
			}

			if (text.startsWith("#")
				|| text.startsWith("@")) {

				if (text.match(/#Settings/gi)) {
					let start = text.indexOf('=');
					let params = text.substring(start + 1).split('|');

					start += lineStart;

					for (let settingsParam in params) {
						let cutSettingsParam = params[settingsParam];
						let cutSettingsParamLength = cutSettingsParam.length;

						start++;

						if (getMapValue(cutSettingsParam, settingsParamDocList) === undefined) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, start, lineNumber, start + cutSettingsParamLength)
								, "Invalid Setting Param: " + cutSettingsParam
								, vscode.DiagnosticSeverity.Warning));
						}

						start += cutSettingsParamLength;
					}

					if (lineNumber !== firstLineNotComment) {
						diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
							, "Settings Not At First Line"
							, vscode.DiagnosticSeverity.Error));
					}

					if (!settings && text.match(/Lite/gi)) {
						liteMode = true;
					}

					if (settings) {
						diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
							, "Duplicated Setting"
							, vscode.DiagnosticSeverity.Error));
					}

					settings = true;

					return;
				}

				if (text.match(/#EOF/gi)) {
					EOF = true;
					return;
				}
				if (text.match(/(#CJMP|#JMPCha|#FJMP|#JMPFra)/gi)) {
					nextJMP = true;
				}

				if (text.match(/#Begin/gi)) {
					blockCount++;
					blockPos.push(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd));

					return;
				}

				if (text.match(/#End/gi)) {
					if (blockCount === 0) {
						diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
							, "End Without Begin"
							, vscode.DiagnosticSeverity.Warning));

						return;
					}

					blockCount--;
					blockPos.pop();

					return;
				}

				const params = getAllParams(text);
				const prefix = params[0][0];
				const command = params[0].substring(1);
				const paramNum = params.length - 1;
				const paramDefinition = getMapValue(command, commandParamList);

				let contentStart: number = lineStart + command.length + 1;

				if (arrayHasValue(command, internalKeywordList)) {
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, contentStart)
						, "User Shouldn't Use Internal Command: " + params[0]
						, vscode.DiagnosticSeverity.Error));
				}

				if (arrayHasValue(command, deprecatedKeywordList)) {
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, contentStart)
						, "Deprecated Command: " + params[0]
						, vscode.DiagnosticSeverity.Warning));
				}

				let checkImageID = false;
				let checkPos = 0;

				enum ImageBehavior {
					create,
					destroy
				}

				let imageBehavior;

				// check internal ID for @Char
				if (matchEntire(params[0], /(@Char|@Character)/gi)) {
					checkImageID = true;
					imageBehavior = ImageBehavior.create;
					checkPos = 2;
				}

				if (matchEntire(params[0], /(@CD|@CharDispose)/gi)) {
					checkImageID = true;
					imageBehavior = ImageBehavior.destroy;
					checkPos = 1;
				}

				if (paramDefinition === undefined) {
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd)
						, "Undocumented Command: " + params[0]
						, vscode.DiagnosticSeverity.Information));

					return;
				}

				if ((prefix === '@' && arrayHasValue(command, sharpKeywordList))
					|| (prefix === '#' && arrayHasValue(command, atKeywordList))) {
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineStart, lineNumber, lineStart + 1)
						, "Wrong Command Prefix: " + params[0]
						, vscode.DiagnosticSeverity.Error));

					return;
				}

				// Check param valid
				const paramFormat = paramDefinition.type;
				const paramHint = paramDefinition.inlayHintType;
				const paramNumMin = paramDefinition.minParam;
				const paramNumMax = paramDefinition.maxParam;

				let curLinePrefix = params[0];

				for (let j = 1; j < params.length; j++) {
					if (j > paramNumMax) {
						diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, lineEnd)
							, "Too Many Params"
							, vscode.DiagnosticSeverity.Warning));

						return;
					}

					let curParam = params[j];
					let currentType = paramFormat[j - 1];
					let currentHintType = paramHint !== undefined
						? paramHint[j - 1]
						: undefined;

					curLinePrefix = curLinePrefix + ":" + curParam;

					contentStart++;

					if (curParam.match(regexRep)) {
						continue;
					}

					if (checkImageID
						&& checkPos === j) {
						const availableBehavior = internalImageID.get(parseInt(curParam));

						if (availableBehavior !== undefined
							&& ((imageBehavior === ImageBehavior.create && !availableBehavior.Create)
								|| (imageBehavior === ImageBehavior.destroy && !availableBehavior.Destroy))) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
								, "Cannot Use Internal ID"
								, vscode.DiagnosticSeverity.Error));
						}
					}

					switch (currentType) {
						case ParamType.String:

							break;
						case ParamType.Number:
							if (!matchEntire(curParam, regexNumber)) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
									, "Invalid Number: " + curParam
									, vscode.DiagnosticSeverity.Error));
							}

							break;
						case ParamType.ZeroOne:
							let curParamVal = parseInt(curParam);

							if (curParamVal !== 0
								&& curParamVal !== 1) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
									, "Invalid ZeroOne Param: " + curParam
									, vscode.DiagnosticSeverity.Error));
							}

							break;
						case ParamType.Boolean:
							if (!matchEntire(curParam, regexNumber)
								&& (curParam.toLowerCase() !== "on"
									&& curParam.toLowerCase() !== "off")) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
									, "Invalid Option: " + curParam
									, vscode.DiagnosticSeverity.Error));
							}

							break;
						case ParamType.Volume:
							if (!matchEntire(curParam, regexNumber)
								|| curParam.toLowerCase() !== "BGM".toLowerCase()
								|| curParam.toLowerCase() !== "BGS".toLowerCase()
								|| curParam.toLowerCase() !== "SE".toLowerCase()
								|| curParam.toLowerCase() !== "DUB".toLowerCase()) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
									, "Invalid Volume: " + curParam
									, vscode.DiagnosticSeverity.Error));
							}

							break;
						case ParamType.Order:
							if (curParam.toLowerCase() !== "Front".toLowerCase()
								|| curParam.toLowerCase() !== "Back".toLowerCase()
								|| parseInt(curParam) === NaN) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
									, "Invalid Order: " + curParam
									, vscode.DiagnosticSeverity.Error));
							}

							break;
						case ParamType.ObjType:
							if (curParam.toLowerCase() !== "Pic".toLowerCase()
								&& curParam.toLowerCase() !== "Str".toLowerCase()) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
									, "Invalid Object Type: " + curParam
									, vscode.DiagnosticSeverity.Error));
							}

							break;
						case ParamType.Color:
							if (curParam.match(regexHexColor)) {
								if (j !== params.length - 1) {
									diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, lineEnd)
										, "Too Many Params"
										, vscode.DiagnosticSeverity.Warning));
								}
							} else {
								if (j + 2 >= params.length) {
									diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineEnd, lineNumber, lineEnd)
										, "Too Few Params"
										, vscode.DiagnosticSeverity.Warning));
								}
								if (!matchEntire(curParam, regexNumber)) {
									diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
										, "Invalid Number: " + curParam
										, vscode.DiagnosticSeverity.Error));
								}
							}

							break;
						case ParamType.File:
							const commandType = getCommandType(curLinePrefix);
							if (checkFile
								&& !fileExists(commandType, curParam)) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
									, "File " + curParam + " Not Exist"
									, vscode.DiagnosticSeverity.Warning));
							}

							break;
						case ParamType.Any:
							break;

						default:
							break;
					}

					switch (currentHintType) {
						case inlayHintType.Alpha:
							let curParamVal = parseInt(curParam);

							if (curParamVal < 0
								|| curParamVal > 255) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
									, "Invalid Alpha Param: " + curParam
									, vscode.DiagnosticSeverity.Error));
							}

							break;
					}

					contentStart += curParam.length;
				}

				if (paramNum < paramNumMin) {
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, lineEnd, lineNumber, lineEnd)
						, "Too Few Params"
						, vscode.DiagnosticSeverity.Warning));

					return;
				}
			}
		});

		for (let j in blockPos) {
			diagnostics.push(new vscode.Diagnostic(blockPos[j]
				, "Begin Without End"
				, vscode.DiagnosticSeverity.Warning));
		}

		if (!EOF) {
			const lastLine = document.lineAt(document.lineCount - 1).text;
			const lastLineStart = lastLine.length - lastLine.trimStart().length;
			const lastLineEnd = lastLineStart + lastLine.trim().length;

			diagnostics.push(new vscode.Diagnostic(new vscode.Range(document.lineCount - 1, lastLineStart, document.lineCount - 1, lastLineEnd)
				, "Non EOF"
				, vscode.DiagnosticSeverity.Error));
		}

		if (!liteMode && !nextJMP) {
			diagnostics.push(new vscode.Diagnostic(new vscode.Range(document.lineCount, 0, document.lineCount, document.lineAt(document.lineCount - 1).text.length)
				, "Non Valid JMP"
				, vscode.DiagnosticSeverity.Error));
		}

		diagnosticsCollection.clear();
		diagnosticsCollection.set(document.uri, diagnostics);
	}

	context.subscriptions.push(diagnosticsCollection);

	//--------------------

	let activeEditor = vscode.window.activeTextEditor;
	let timeout: NodeJS.Timer | undefined = undefined;

	function refreshFileDiagnostics() {
		if (activeEditor === undefined) {
			return;
		}

		let activeDocument = activeEditor.document;

		updateDiagnostics(activeDocument, true);
	}

	onUpdate();

	function onUpdate() {
		if (activeEditor === undefined) {
			return;
		}

		let activeDocument = activeEditor.document;

		updateDiagnostics(activeDocument, fileListInitialized);
		getLabelCompletion(activeDocument);
		updateLanguageDecorations(activeEditor
			, nonActiveLanguageDecorator
			, currentLocalCode
			, currentLocalCodeDisplay);

		vscode.commands.executeCommand(commandUpdateCommandExtension);
	}

	function triggerUpdate(throttle = false) {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		if (throttle) {
			timeout = setTimeout(onUpdate, 500);
		} else {
			onUpdate();
		}
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdate();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdate(true);
		}
	}, null, context.subscriptions);
}

function getLabelPos(input: string) {
	for (let i in labelCompletions) {
		let label = labelCompletions[i].label;
		if (typeof label === "string") {
			if (label.toLowerCase() === input.toLowerCase()) {
				return i;
			}
		}
		else {
			if (label.label.toLowerCase() === input.toLowerCase()) {
				return i;
			}
		}
	}

	return -1;
}

function getLabelComment(input: string) {
	for (let i in labelCompletions) {
		let label = labelCompletions[i].label;
		if (typeof label === "string") {
			if (label.toLowerCase() === input.toLowerCase()) {
				return label;
			}
		}
		else {
			if (label.label.toLowerCase() === input.toLowerCase()) {
				return label.label + "\t" + label.description;
			}
		}
	}

	return "标签不存在";
}

function getLabelCompletion(document: vscode.TextDocument) {
	labelCompletions = [];
	labelJumpMap.clear();

	iterateLines(document, (text, lineNumber
		, lineStart, lineEnd
		, firstLineNotComment) => {
		if (text.match(/(;.*)/gi)) {
			let label = text.substring(text.indexOf(";") + 1);
			let item: vscode.CompletionItem = new vscode.CompletionItem({
				label: label
				// , detail: fileNameSuffix
				, description: "at line " + lineNumber
			});

			item.kind = vscode.CompletionItemKind.Reference;

			item.insertText = label;

			labelCompletions.push(item);
			labelJumpMap.set(label, lineNumber);
		}
	});
}

function updateLanguageDecorations(activeEditor: vscode.TextEditor, decorationType: vscode.TextEditorDecorationType, currentLocalCode: string, currentLocalCodeDisplay: string) {
	const langReg = new RegExp("Lang\\[(?!" + currentLocalCode + ").*\\].*", "gi");
	const decoOpt: vscode.DecorationOptions[] = [];
	const document = activeEditor.document;

	iterateLines(document, (text, lineNumber
		, lineStart, lineEnd
		, firstLineNotComment) => {
		if (text.match(langReg)) {
			const decoration = { range: new vscode.Range(lineNumber, lineStart, lineNumber, lineEnd), hoverMessage: "非当前语言: " + currentLocalCodeDisplay + currentLocalCode };

			decoOpt.push(decoration);
		}
	});

	activeEditor.setDecorations(decorationType, decoOpt);
}

export function deactivate() {
	console.log("AvgScript extension deactivating");
}