import * as vscode from 'vscode';

import { pinyin } from 'pinyin-pro';
import * as mm from 'music-metadata';
import { ImageProbe } from "@zerodeps/image-probe";

import { getNumberOfParam, lineValidForCommandCompletion, getCompletionItem, getCompletionItemList, getHoverContents, getType, FileType, getParamAtPosition, getIndexOfDelimiter, getFileName, getFileStat, getNthParam, getAllParams, getBuffer } from './lib/utilities';
import {
	sharpKeywordList, atKeywordList
	, keywordList, settingsParamList
	, commandDocList, settingsParamDocList, langDocList
} from './lib/dict';

// command
const confBasePath: string = "conf.AvgScript.basePath";
const commandBasePath: string = "config.AvgScript.basePath";

// settings
let currentLocalCode: string;
let currentLocalCodeDefinition: any;
let currentLocalCodeDisplay: string;

// file
let basePath: string;

let graphic: string;

let graphicFXPath: string;
let graphicCGPath: string;
let graphicUIPath: string;
let graphicPatternFadePath: string;
let graphicCharactersPath: string;

let graphicFX: Thenable<[string, vscode.FileType][]>;
let graphicCG: Thenable<[string, vscode.FileType][]>;
let graphicUI: Thenable<[string, vscode.FileType][]>;
let graphicPatternFade: Thenable<[string, vscode.FileType][]>;
let graphicCharacters: Thenable<[string, vscode.FileType][]>;

let graphicFXCompletions: vscode.CompletionItem[] = [];
let graphicCGCompletions: vscode.CompletionItem[] = [];
let graphicUICompletions: vscode.CompletionItem[] = [];
let graphicPatternFadeCompletions: vscode.CompletionItem[] = [];
let graphicCharactersCompletions: vscode.CompletionItem[] = [];

let audio: string;

let audioBgmPath: string;
let audioBgsPath: string;
let audioDubsPath: string;
let audioSEPath: string;

let audioBgm: Thenable<[string, vscode.FileType][]>;
let audioBgs: Thenable<[string, vscode.FileType][]>;
let audioDubs: Thenable<[string, vscode.FileType][]>;
let audioSE: Thenable<[string, vscode.FileType][]>;

let audioBgmCompletions: vscode.CompletionItem[] = [];
let audioBgsCompletions: vscode.CompletionItem[] = [];
let audioDubsCompletions: vscode.CompletionItem[] = [];
let audioSECompletions: vscode.CompletionItem[] = [];

let scriptPath: string;

let script: Thenable<[string, vscode.FileType][]>;
let scriptCompletions: vscode.CompletionItem[] = [];

let labelCompletions: vscode.CompletionItem[] = [];
let labelJumpMap: Map<string, number> = new Map();

enum CompletionType { image, audio, video, script };

const nonePreview = "暂无预览";

// const imagePreview = "<div><img src =\"{$FILENAME}\" width = \"300\"/></div>";
const imagePreview = "<div align=\"center\"><img src =\"{$FILENAME}\" height = \"160\"/></div>";
const audioPreview = nonePreview;
const videoPreview = nonePreview;
const scriptPreview = nonePreview;

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

async function updateFileList() {
	basePath = vscode.workspace.getConfiguration().get<string>(confBasePath, "");

	if (basePath === "") {
		return;
	}

	// Update config
	let iniParser = require('ini');
	let encoding: BufferEncoding = 'utf-8';

	let configPath = basePath + "\\..\\settings\\settings.ini";
	let config = iniParser.parse((await getBuffer(configPath)).toString(encoding));


	currentLocalCode = config.Display.Language;

	let localizationPath = basePath + "\\..\\localization\\Localization.dat";
	let localization = iniParser.parse((await getBuffer(localizationPath)).toString(encoding));

	currentLocalCodeDefinition = localization.Definition;
	currentLocalCodeDisplay = currentLocalCodeDefinition[
		"LanguageDisplayName_" + currentLocalCode];

	// Update completion list
	graphic = basePath + "\\Graphics\\";

	graphicFXPath = graphic + "FX";
	graphicCGPath = graphic + "CG";
	graphicUIPath = graphic + "UI";
	graphicPatternFadePath = graphic + "PatternFade";
	graphicCharactersPath = graphic + "Characters";

	graphicFX = getFileList(vscode.Uri.file(graphicFXPath));
	graphicCG = getFileList(vscode.Uri.file(graphicCGPath));
	graphicUI = getFileList(vscode.Uri.file(graphicUIPath));
	graphicPatternFade = getFileList(vscode.Uri.file(graphicPatternFadePath));
	graphicCharacters = getFileList(vscode.Uri.file(graphicCharactersPath));

	audio = basePath + "\\Audio\\";

	audioBgmPath = audio + "Bgm";
	audioBgsPath = audio + "Bgs";
	audioDubsPath = audio + "Dubs";
	audioSEPath = audio + "SE";

	audioBgm = getFileList(vscode.Uri.file(audioBgmPath));
	audioBgs = getFileList(vscode.Uri.file(audioBgsPath));
	audioDubs = getFileList(vscode.Uri.file(audioDubsPath));
	audioSE = getFileList(vscode.Uri.file(audioSEPath));

	scriptPath = basePath + "\\dialogue";
	script = getFileList(vscode.Uri.file(scriptPath));

	let generateCompletionList = async (fileList: Thenable<[string, vscode.FileType][]>
		, completions: vscode.CompletionItem[]
		, basePath: string = ""
		, type: CompletionType = CompletionType.image) => {
		if (basePath === "") {
			return;
		}

		(await fileList).forEach(async element => {
			if (element[1] === vscode.FileType.File) {
				let fileName: string = element[0];
				let fileNameNoSuffix: string = element[0].lastIndexOf(".") === -1 ? element[0] : element[0].substring(0, element[0].lastIndexOf("."));
				let fileNameSuffix: string = element[0].lastIndexOf(".") === -1 ? "" : element[0].substring(element[0].lastIndexOf("."));

				let filePath: string = basePath + "\\{$FILENAME}";

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

				item.insertText = fileName;
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

				item.documentation = await getFileComment(previewStr
					, element[0]
					, filePath
					, type);

				completions.push(item);
			}
		});

	};

	graphicFXCompletions = [];
	graphicCGCompletions = [];
	graphicUICompletions = [];
	graphicPatternFadeCompletions = [];
	graphicCharactersCompletions = [];

	generateCompletionList(graphicFX, graphicFXCompletions, graphicFXPath);
	generateCompletionList(graphicCG, graphicCGCompletions, graphicCGPath);
	generateCompletionList(graphicUI, graphicUICompletions, graphicUIPath);
	generateCompletionList(graphicPatternFade, graphicPatternFadeCompletions, graphicPatternFadePath);
	generateCompletionList(graphicCharacters, graphicCharactersCompletions, graphicCharactersPath);

	audioBgmCompletions = [];
	audioBgsCompletions = [];
	audioDubsCompletions = [];
	audioSECompletions = [];

	generateCompletionList(audioBgm, audioBgmCompletions, audioBgmPath, CompletionType.audio);
	generateCompletionList(audioBgs, audioBgsCompletions, audioBgsPath, CompletionType.audio);
	generateCompletionList(audioDubs, audioDubsCompletions, audioDubsPath, CompletionType.audio);
	generateCompletionList(audioSE, audioSECompletions, audioSEPath, CompletionType.audio);

	scriptCompletions = [];

	generateCompletionList(script, scriptCompletions, scriptPath, CompletionType.script);
}

export async function activate(context: vscode.ExtensionContext) {
	console.log("AvgScript extension activated");

	//--------------------

	await updateFileList();

	//--------------------

	const sharpCommands = vscode.languages.registerCompletionItemProvider(
		'AvgScript',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				const linePrefix = document.lineAt(position).text.substring(0, position.character).trim().toLowerCase();

				if (!lineValidForCommandCompletion(linePrefix)) {
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
				const linePrefix = document.lineAt(position).text.substring(0, position.character).trim().toLowerCase();

				if (!lineValidForCommandCompletion(linePrefix)) {
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
				const linePrefix = document.lineAt(position).text.substring(0, position.character).toLowerCase().trim();

				if (!linePrefix.startsWith('#Settings='.toLowerCase())) {
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
				const linePrefix = document.lineAt(position).text.substring(0, position.character).trim().toLowerCase();

				switch (getType(linePrefix)) {
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
				const linePrefix = document.lineAt(position).text.substring(0, position.character).trim().toLowerCase();

				switch (getType(linePrefix)) {
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

	const hover = vscode.languages.registerHoverProvider('AvgScript', {
		provideHover(document, position, token) {
			let range = document.getWordRangeAtPosition(position);

			if (!range) {
				return undefined;
			}

			const line = document.lineAt(position).text.toLowerCase().trim();;
			const linePrefix = document.lineAt(position).text.substring(0, position.character).trim().toLowerCase();

			let word = document.getText(range).toLowerCase();

			if (line.startsWith('#Settings='.toLowerCase())) {
				return new vscode.Hover(getHoverContents(word, settingsParamDocList));
			}

			if (getNumberOfParam(linePrefix) === 0) {
				if ((linePrefix.lastIndexOf('@', position.character) !== -1
					|| linePrefix.lastIndexOf('#', position.character) !== -1)) {
					return new vscode.Hover(getHoverContents(word, commandDocList));
				}
				else if (line.startsWith('Lang'.toLowerCase())
					&& position.character <= 'Lang[ZH]'.length) {
					return new vscode.Hover(getHoverContents(word, langDocList));
				}
			}

			return undefined;
		}
	});

	const hoverFile = vscode.languages.registerHoverProvider('AvgScript', {
		async provideHover(document, position, token) {
			let range = document.getWordRangeAtPosition(position);

			if (!range) {
				return undefined;
			}

			const line = document.lineAt(position).text.toLowerCase().trim();
			const linePrefix = document.lineAt(position).text.substring(0, position.character).trim().toLowerCase();

			let fileName = getParamAtPosition(line, position.character);

			if (fileName === undefined) {
				return undefined;
			}

			let returnHover = async function (previewStr: string
				, fileName: string | undefined
				, filePath: string
				, type: CompletionType) {
				return new vscode.Hover(await getFileComment(previewStr
					, fileName
					, filePath
					, type));
			};

			switch (getType(linePrefix)) {
				case FileType.characters:
					return returnHover(imagePreview
						, getFileName(fileName, graphicCharactersCompletions)
						, graphicCharactersPath + "\\{$FILENAME}"
						, CompletionType.image);
				case FileType.ui:
					return returnHover(imagePreview
						, getFileName(fileName, graphicUICompletions)
						, graphicUIPath + "\\{$FILENAME}"
						, CompletionType.image);
				case FileType.cg:
					return returnHover(imagePreview
						, getFileName(fileName, graphicCGCompletions)
						, graphicCGPath + "\\{$FILENAME}"
						, CompletionType.image);
				case FileType.patternFade:
					return returnHover(imagePreview
						, getFileName(fileName, graphicPatternFadeCompletions)
						, graphicPatternFadePath + "\\{$FILENAME}"
						, CompletionType.image);

				case FileType.bgm:
					return returnHover(audioPreview
						, getFileName(fileName, audioBgmCompletions)
						, audioBgmPath + "\\{$FILENAME}"
						, CompletionType.audio);
				case FileType.bgs:
					return returnHover(audioPreview
						, getFileName(fileName, audioBgsCompletions)
						, audioBgsPath + "\\{$FILENAME}"
						, CompletionType.audio);
				case FileType.dubs:
					return returnHover(audioPreview
						, getFileName(fileName, audioDubsCompletions)
						, audioDubsPath + "\\{$FILENAME}"
						, CompletionType.audio);
				case FileType.se:
					return returnHover(audioPreview
						, getFileName(fileName, audioSECompletions)
						, audioSEPath + "\\{$FILENAME}"
						, CompletionType.audio);

				// case FileType.video:
				case FileType.script:
					return returnHover(audioPreview
						, getFileName(fileName, scriptCompletions)
						, scriptPath + "\\{$FILENAME}"
						, CompletionType.script);
				case FileType.frame:
				case FileType.label:
					return new vscode.Hover(new vscode.MarkdownString(getLabelComment(fileName)));
				default:
					return undefined;
			}
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

				for (let i = 0; i < document.lineCount; ++i) {
					const line = document.lineAt(i);

					if (!line.isEmptyOrWhitespace) {
						const text = line.text.trim();
						const paramNum = getNumberOfParam(text);
						// match command that set RGB

						if (text.match(/(#DefineRGB|#DiaColor|#NameColor|#NameOutColor|#DiaOutColor|@StrC|@StrColor)/gi) && (paramNum >= 1)
							|| text.match(/(#NameShaderOn|#DiaShaderOn)/gi) && (paramNum >= 2)
							|| text.match(/(@Str|@String|@CreateStr|@CreateString)/gi) && (paramNum >= 9)) {
							// hex
							if (text.substring(text.length - 8).match(/(#|0[x|X])[0-9a-fA-F]{6}/gi)) {
								let pos = text.lastIndexOf(":") + 1;
								if (pos === 0) {
									pos = text.lastIndexOf("=") + 1;
								}
								const colorStr = text.substring(pos);

								let charPos = 0;

								if (colorStr.startsWith("#")) {
									charPos += 1;
								}
								else if (colorStr.toLowerCase().startsWith("0x".toLowerCase())) {
									charPos += 2;
								}

								let getColor = (colorStr: string) => {
									let ret = parseInt(colorStr.substring(charPos, charPos + 2), 16);
									charPos += 2;

									return ret;
								};

								let R = getColor(colorStr);
								let G = getColor(colorStr);
								let B = getColor(colorStr);

								let range = new vscode.Range(line.lineNumber, pos, line.lineNumber, text.length);
								let color = new vscode.Color(R / 255.0, G / 255.0, B / 255.0, 1.0);
								colors.push(new vscode.ColorInformation(range, color));
							} else {
								if (text.lastIndexOf(":") === -1) {
									continue;
								}

								let pos = [0, 0, 0];
								let count = 0;

								for (let charPos = text.length - 1; charPos >= 0; charPos--) {
									if (text.charAt(charPos) === ":"
										|| text.charAt(charPos) === "=") {
										pos[count] = charPos;
										count++;

										if (count === 3) {
											break;
										}
									}
								}

								let R = parseInt(text.substring(pos[2] + 1, pos[1]), 10);
								let G = parseInt(text.substring(pos[1] + 1, pos[0]), 10);
								let B = parseInt(text.substring(pos[0] + 1, text.length), 10);

								let range = new vscode.Range(line.lineNumber, pos[2] + 1, line.lineNumber, text.length);
								let color = new vscode.Color(R / 255.0, G / 255.0, B / 255.0, 1.0);
								colors.push(new vscode.ColorInformation(range, color));
							}
						}
					}
				}
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
				if (text.substring(text.length - 8).match(/(#|0[x|X])[0-9a-fA-F]{6}/gi)) {
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
			await updateFileList();
		}
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

				let line = document.lineAt(position.line).text.trim();

				if (getType(line) !== FileType.label) {
					return undefined;
				}

				let curLabel = getNthParam(line, 1);

				labelJumpMap.forEach((line, label) => {
					if (curLabel === label) {
						let link = new vscode.Location(document.uri
							, new vscode.Position(line, 0));

						definitions.push(link);
					}
				});

				return definitions;
			}
		});

	const chapterDefinition = vscode.languages.registerDefinitionProvider('AvgScript',
		{
			async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
				let definitions: vscode.Location[] = [];

				let line = document.lineAt(position.line).text.trim();

				if (getType(line) !== FileType.script) {
					return undefined;
				}

				let nextChapter = getNthParam(line, 1);
				let nextChapterPath = basePath + "\\dialogue\\" + nextChapter;

				if (!nextChapterPath.endsWith(".asc")) {
					nextChapterPath += ".asc";
				}

				let nextChapterUri = vscode.Uri.file(nextChapterPath);

				try {
					await vscode.workspace.fs.stat(nextChapterUri);

					let link = new vscode.Location(nextChapterUri
						, new vscode.Position(0, 0));

					definitions.push(link);

					return definitions;
				} catch {
					return undefined;
				}
			}
		});

	context.subscriptions.push(labelDefinition
		, chapterDefinition);

	//--------------------

	const labelReference = vscode.languages.registerReferenceProvider(
		'AvgScript', {
		provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken) {
			let references: vscode.Location[] = [];

			let line = document.lineAt(position.line).text.trim();

			if (line[0] !== ';') {
				return undefined;
			}

			let label = line.substring(line.indexOf(";") + 1);

			for (let i = 0; i < document.lineCount; ++i) {
				const line = document.lineAt(i);

				if (!line.isEmptyOrWhitespace) {
					const text = line.text.trim();

					if (getType(text) === FileType.label) {
						let curLabel = getNthParam(text, 1);

						if (curLabel === label) {
							let link = new vscode.Location(document.uri
								, new vscode.Position(i, 0));

							references.push(link);
						}
					}
				}
			}

			return references;
		}
	});

	context.subscriptions.push(labelReference);

	//--------------------

	const rename = vscode.languages.registerRenameProvider(
		'AvgScript', {
		provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken) {
			const edit = new vscode.WorkspaceEdit();
			const line = document.lineAt(position.line).text.trim();
			const linePrefix = line.substring(0, position.character);
			let word: string;

			let replaceToken = (origin: string) => {
				const suffixPos = origin.lastIndexOf('.');
				let originNoSuffix: string = origin;
				let originHasSuffix = suffixPos !== -1;

				if (originHasSuffix) {
					originNoSuffix = origin.substring(0, suffixPos);
					newName = newName + origin.substring(suffixPos);
				}

				for (let i = 0; i < document.lineCount; ++i) {
					const line = document.lineAt(i);

					if (!line.isEmptyOrWhitespace) {
						const text = line.text.trim();

						if (text.startsWith("#")
							|| text.startsWith("@")
							|| text.startsWith(";")) {
							const regex = new RegExp(originNoSuffix, "gi");

							let start: number = line.text.length - text.length;
							let contentStart: number = 0;

							if (text.startsWith(";")) {
								contentStart = 1;
							} else if (getNumberOfParam(text) !== 0) {
								let delimiterPos = getIndexOfDelimiter(text, 0);

								if (delimiterPos === -1) {
									continue;
								}

								contentStart = delimiterPos + 1;
							} else {
								continue;
							}

							let params = getAllParams(text.substring(contentStart));
							let startPos = start + contentStart;

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
										, new vscode.Range(line.lineNumber
											, startPos
											, line.lineNumber
											, endPos)
										, newName);
								}

								startPos += curParam.length;
							}
						}
					}
				}

				return edit;
			};

			if (line.startsWith("#")
				|| line.startsWith("@")) {
				if (getNumberOfParam(linePrefix) === 0) {
					return undefined;
				}

				word = getParamAtPosition(line, position.character)!;

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

				let beginRegex = /^#Begin/gi;
				let endRegex = /^#End/gi;
				let labelRegex = /^;.*/gi;
				let keyWordRegex = /^(((#CreateSwitch|#Call|#CMP|@SetBattleScript).*)|(.*JMP.*)|(#SkipAnchor|#Ret|#StopFF|#StopFastForward))/gi;

				let commentRegex = /(\/\/.*)|(\(.*)|(\/\*(?!\*\/)[^\*\/]*)|((?!\/\*)[^\/\*]*\*\/)/gi;

				let commentRegexRep = /(\/\/.*)|(\(.*)|(\/\*(?!\*\/)[^\*\/]*)/gi;
				let commentRegexRepRest = /((?!\/\*)[^\/\*]*\*\/)/gi;

				for (let i = 0; i < document.lineCount; ++i) {
					const line = document.lineAt(i);

					if (!line.isEmptyOrWhitespace) {
						const text = line.text.trim();
						let textNoComment = text.replace(commentRegexRep, "").trim();

						if (inComment
							&& text.match(/\*\//gi)) {
							inComment = false;
							textNoComment = textNoComment.replace(commentRegexRepRest, "").trim();
						}

						if (!inComment
							&& textNoComment.length > 0) {
							let item: vscode.SymbolInformation | undefined = undefined;
							let match: RegExpMatchArray | null;

							if ((match = textNoComment.match(beginRegex)) !== null) {
								let beginName = textNoComment.substring("#Begin".length + 1).trim();

								prevSecName.push(beginName);
								prevSecRangeStart.push(i);
							}

							if ((match = textNoComment.match(endRegex)) !== null) {
								if (prevSecName.length === 1) {
									continue;
								}

								let beginName = prevSecName.pop()!;

								item = new vscode.SymbolInformation("Block: " + beginName
									, vscode.SymbolKind.Namespace
									, beginName
									, new vscode.Location(document.uri
										, new vscode.Range(
											new vscode.Position(prevSecRangeStart.pop()!, 0)
											, new vscode.Position(i, 0))));
							}

							if ((match = textNoComment.match(labelRegex)) !== null) {
								let labelName = textNoComment.substring(textNoComment.indexOf(";") + 1);

								item = new vscode.SymbolInformation("Label: " + labelName
									, vscode.SymbolKind.String
									, prevSecName[prevSecName.length - 1]
									, new vscode.Location(document.uri, new vscode.Position(i, 0)));
							}

							if ((match = textNoComment.match(keyWordRegex)) !== null) {
								let keyWord = match[0];

								item = new vscode.SymbolInformation("KeyWord: " + keyWord
									, vscode.SymbolKind.Function
									, prevSecName[prevSecName.length - 1]
									, new vscode.Location(document.uri, new vscode.Position(i, 0)));
							}

							if (item !== undefined) {
								symbols.push(item);
							}
						}

						if (!inComment
							&& !text.match(/\*\//gi)
							&& text.match(/\/\*/gi)) {
							inComment = true;;
						}
					}
				}

				return symbols;
			}
		});

	context.subscriptions.push(outline);

	//--------------------

	let activeEditor = vscode.window.activeTextEditor;
	let activeDocument = activeEditor?.document!;
	let timeout: NodeJS.Timer | undefined = undefined;

	onUpdate();

	function onUpdate() {
		getLabelCompletion(activeDocument); updateLanguageDecorations(activeEditor!
			, nonActiveLanguageDecorator
			, currentLocalCode
			, currentLocalCodeDisplay);
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

	for (let i = 0; i < document.lineCount; ++i) {
		const line = document.lineAt(i);

		if (!line.isEmptyOrWhitespace) {
			const text = line.text.trim();

			if (text.match(/(;.*)/gi)) {
				let label = text.substring(text.indexOf(";") + 1);
				let item: vscode.CompletionItem = new vscode.CompletionItem({
					label: label
					// , detail: fileNameSuffix
					, description: "at line " + i
				});

				item.kind = vscode.CompletionItemKind.Reference;

				item.insertText = label;

				labelCompletions.push(item);
				labelJumpMap.set(label, i);
			}
		}
	}
}

function updateLanguageDecorations(activeEditor: vscode.TextEditor, decorationType: vscode.TextEditorDecorationType, currentLocalCode: string, currentLocalCodeDisplay: string) {
	const regex = new RegExp("Lang\\[(?!" + currentLocalCode + ").*\\].*", "gi");
	const decoOpt: vscode.DecorationOptions[] = [];
	const document = activeEditor.document;

	for (let i = 0; i < document.lineCount; ++i) {
		const line = document.lineAt(i);

		if (!line.isEmptyOrWhitespace) {
			const text = line.text.trim();

			if (text.match(regex)) {
				const startPos = 0;
				const endPos = text.length;
				const decoration = { range: new vscode.Range(line.lineNumber, startPos, line.lineNumber, endPos), hoverMessage: "非当前语言: " + currentLocalCodeDisplay + currentLocalCode };

				decoOpt.push(decoration);
			}
		}
	}

	activeEditor.setDecorations(decorationType, decoOpt);
}

export function deactivate() {
	console.log("AvgScript extension deactivating");
}
