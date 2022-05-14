import * as vscode from 'vscode';

import { pinyin } from 'pinyin-pro';

import { getNumberOfParam, lineValidForCommandCompletion, getCompletionItem, getCompletionItemList, getHoverContents, getType, FileType, getParam, getIndexOfDelimiter, getFileName, getFileStat } from './lib/utilities';
import {
	sharpKeywordList, atKeywordList
	, keywordList, settingsParamList
	, commandDocList, settingsParamDocList, langDocList
} from './lib/dict';

// command
const confBasePath: string = "conf.AvgScript.basePath";
const commandBasePath: string = "config.AvgScript.basePath";

// file
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

enum CompletionType { image, audio, video };

const nonePreview = "暂无预览";

// const imagePreview = "<div><img src =\"{$FILENAME}\" width = \"300\"/></div>";
const imagePreview = "<div align=\"center\"><img src =\"{$FILENAME}\" height = \"160\"/></div>";
const audioPreview = nonePreview;
const videoPreview = nonePreview;

async function getFileComment(previewStr: string
	, fileName: string | undefined
	, filePath: string) {
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
			+ "	Modified: `" + new Date(stat.mtime).toUTCString() + "`\n\n");
		// preview.appendMarkdown("\n\n----------\n\n");
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
	let basePath: string = vscode.workspace.getConfiguration().get<string>(confBasePath, "");

	if (basePath === "") {
		return;
	}

	if (basePath.endsWith("\\")) {
		basePath = basePath.substring(0, basePath.length - 1);
	}

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

				switch (type) {
					case CompletionType.image:
						item.detail = "Image file preview";

						item.documentation = await getFileComment(imagePreview
							, element[0]
							, filePath);

						break;
					case CompletionType.audio:
						item.detail = "Audio file";

						item.documentation = await getFileComment(audioPreview
							, element[0]
							, filePath);

						break;
					case CompletionType.video:
						item.detail = "Video file";

						item.documentation = await getFileComment(videoPreview
							, element[0]
							, filePath);

						break;
				}


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

			let fileName = getParam(line, position.character);

			if (fileName === undefined) {
				return undefined;
			}

			let returnHover = async function (previewStr: string
				, fileName: string | undefined
				, filePath: string) {
				return new vscode.Hover(await getFileComment(previewStr, fileName, filePath));
			};

			switch (getType(linePrefix)) {
				case FileType.characters:
					return returnHover(imagePreview
						, getFileName(fileName, graphicCharactersCompletions)
						, graphicCharactersPath + "\\{$FILENAME}");
				case FileType.ui:
					return returnHover(imagePreview
						, getFileName(fileName, graphicUICompletions)
						, graphicUIPath + "\\{$FILENAME}");
				case FileType.cg:
					return returnHover(imagePreview
						, getFileName(fileName, graphicCGCompletions)
						, graphicCGPath + "\\{$FILENAME}");

				case FileType.patternFade:
					return returnHover(imagePreview
						, getFileName(fileName, graphicPatternFadeCompletions)
						, graphicPatternFadePath + "\\{$FILENAME}");
				case FileType.bgm:
					return returnHover(audioPreview
						, getFileName(fileName, audioBgmCompletions)
						, audioBgmPath + "\\{$FILENAME}");
				case FileType.bgs:
					return returnHover(audioPreview
						, getFileName(fileName, audioBgsCompletions)
						, audioBgsPath + "\\{$FILENAME}");
				case FileType.dubs:
					return returnHover(audioPreview
						, getFileName(fileName, audioDubsCompletions)
						, audioDubsPath + "\\{$FILENAME}");
				case FileType.se:
					return returnHover(audioPreview
						, getFileName(fileName, audioSECompletions)
						, audioSEPath + "\\{$FILENAME}");

				// case FileType.video:
			}

			return undefined;
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
						const text = line.text;
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
		let basePath: string = vscode.workspace.getConfiguration().get<string>(confBasePath, "");

		const value = await vscode.window.showInputBox({
			value: basePath,
			prompt: "Base path for the assets files"
		});

		if (value !== undefined
			&& value !== basePath) {
			// 2) Get the configuration
			const configuration = vscode.workspace.getConfiguration();

			// 3) Get the current value
			//const currentValue = configuration.get<{}>(confBasePath);

			// 4) Update the value in the User Settings
			await configuration.update(confBasePath, value, vscode.ConfigurationTarget.Global);

			// 5) Update fileList
			await updateFileList();
		}
	});
}

export function deactivate() {
	console.log("AvgScript extension deactivating");
}
