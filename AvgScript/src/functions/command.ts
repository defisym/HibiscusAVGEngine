/* eslint-disable @typescript-eslint/naming-convention */

import path = require('path');
import * as vscode from 'vscode';

import { activeEditor } from '../extension';
import { currentLineNotComment } from '../lib/comment';
import { currentLineDialogue, DialogueStruct, parseDialogue } from '../lib/dialogue';
import { commandInfoList, generateList, GetDefaultParamInfo, inlayHintMap, InlayHintType, ParamInfo, ParamTypeMap, resetList } from '../lib/dict';
import { DubParser } from '../lib/dubs';
import { iterateParams } from '../lib/iterateParams';
import { iterateScripts } from "../lib/iterateScripts";
import { FileType } from '../lib/utilities';
import { createWebviewPanel } from '../webview/_create';
import { handleOnClickLink } from '../webview/_onClickLink';
import { assetList_getWebviewContent } from '../webview/assetList';
import { dubList_getWebviewContent } from '../webview/dubList';
import { formatHint_getFormatControlContent } from '../webview/formatHint';
import { jumpFlow_getWebviewContent } from '../webview/jumpFlow';
import { updateAtCompletionList, updateSharpCompletionList } from './completion';
import { diagnosticUpdate, refreshFileDiagnostics } from './diagnostic';
import { audio, audioBgmPath, audioBgsPath, audioSEPath, currentLocalCode, fileListHasItem, getFullFileNameByType, getFullFilePath, graphicCGPath, graphicCharactersPath, graphicPatternFadePath, graphicUIPath, projectFileInfoList, scriptPath, updateBasePath, updateFileList, videoPath, waitForFileListInit } from './file';
import { getLabelJumpMap } from './label';

// config
export const confBasePath: string = "conf.AvgScript.basePath";
export const confAutoUpdate: string = "conf.AvgScript.autoUpdate";

export const confCommandExt: string = "conf.AvgScript.commandExtension";
export const confReplaceScript: string = "conf.AvgScript.replaceScript";

export const confPreview_AlwaysSendingMessage: string = "conf.AvgScript.preview.alwaysSendingMessage";
export const confCodeLens_ShowTotalLineCount: string = "conf.AvgScript.codeLens.totalLineCount";
export const confDub_EnableDubMapping: string = "conf.AvgScript.dub.dubMapping";

export const confFormatRules_emptyLineAfterDialogue: string = "conf.AvgScript.formatRules.emptyLineAfterDialogue";
export const confFormatRules_emptyLineBeforeComment: string = "conf.AvgScript.formatRules.emptyLineBeforeComment";
export const confFormatRules_emptyLineLabel: string = "conf.AvgScript.formatRules.emptyLineLabel";
export const confFormatRules_emptyLineCommand: string = "conf.AvgScript.formatRules.emptyLineCommand";
export const confFormatRules_removeEmptyLines: string = "conf.AvgScript.formatRules.removeEmptyLines";
export const confFormatRules_formatEmptyLines: string = "conf.AvgScript.formatRules.formatEmptyLines";

// command
export const commandBasePath: string = "config.AvgScript.basePath";
export const commandRefreshAssets: string = "config.AvgScript.refreshAssets";
export const commandUpdateCommandExtension: string = "config.AvgScript.updateCommandExtension";
export const commandGetAssetsList: string = "config.AvgScript.getAssetsList";
export const commandShowJumpFlow: string = "config.AvgScript.showJumpFlow";
export const commandReplaceScript: string = "config.AvgScript.replaceScript";

export const commandAppendDialogue: string = "config.AvgScript.appendDialogue";
export const commandShowDialogueFormatHint: string = "config.AvgScript.showDialogueFormatHint";
export const commandShowHibiscusDocument: string = "config.AvgScript.showHibiscusDocument";

export const commandGetDubList: string = "config.AvgScript.getDubList";

export const commandUpdateDub: string = "config.AvgScript.updateDub";
export const commandDeleteDub: string = "config.AvgScript.deleteDub";

export const commandBasePath_impl = async () => {
	// 1) Getting the value
	let oldBasePath = vscode.workspace.getConfiguration().get<string>(confBasePath, "");
	let value: string | undefined = undefined;

	do {
		// press esc -> return undefined
		value = await vscode.window.showInputBox({
			value: oldBasePath,
			prompt: "Absolute path of main program, e.g., \"C:\\Hibiscus\\AVG.exe\""
		});
	} while (!await updateBasePath(value));

	if (value === oldBasePath) {
		return;
	}

	const configuration = vscode.workspace.getConfiguration();

	await configuration.update(confBasePath
		, value
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
};

export const commandRefreshAssets_impl = async () => {
	if (!await updateBasePath()) {
		await vscode.commands.executeCommand(commandBasePath);
	}

	vscode.window.withProgress({
		location: vscode.ProgressLocation.Window,
		title: "Refreshing assets...\t",
		cancellable: false
	}, async (progress, token) => {
		await updateFileList(progress);
		refreshFileDiagnostics();
	});
};

export const commandUpdateCommandExtension_impl = async () => {
	// reset list to base
	resetList();

	// add ext
	do {
		interface InlayHintAdd {
			key: string,
			value: string,
		}

		interface CommandExt extends ParamInfo {
			// basic
			command: string,

			// diagnostic
			paramType: string[],

			// inlayHint
			inlayHint: string[],
			inlayHintAdd: InlayHintAdd[][],
		}

		let copyToInfo = (commandExtItem: CommandExt) => {
			let paramInfo: ParamInfo = GetDefaultParamInfo();

			// copy content
			paramInfo.prefix = commandExtItem.prefix;
			paramInfo.minParam = commandExtItem.minParam;
			paramInfo.maxParam = commandExtItem.maxParam;
			paramInfo.description = commandExtItem.description;
			paramInfo.required = commandExtItem.required;

			// outline
			paramInfo.outlineKeyword = commandExtItem.outlineKeyword;

			// diagnostic
			paramInfo.internal = commandExtItem.internal;
			paramInfo.deprecated = commandExtItem.deprecated;
			paramInfo.VNModeOnly = commandExtItem.VNModeOnly;
			paramInfo.NonVNModeOnly = commandExtItem.NonVNModeOnly;

			// formatting
			paramInfo.indentIn = commandExtItem.indentIn;
			paramInfo.indentOut = commandExtItem.indentOut;
			paramInfo.emptyLineBefore = commandExtItem.emptyLineBefore;
			paramInfo.emptyLineAfter = commandExtItem.emptyLineAfter;

			// processing
			paramInfo.minParam = Math.max(0, commandExtItem.minParam);
			paramInfo.maxParam = Math.max(paramInfo.minParam, commandExtItem.maxParam);

			// convert to index
			let paramType = commandExtItem.paramType;

			for (let type of paramType) {
				const paramType = ParamTypeMap.get(type);
				if (paramType !== undefined) {
					paramInfo.type.push(paramType);
				}
			}

			// convert to index
			let inlayHints = commandExtItem.inlayHint;

			if (inlayHints !== undefined) {
				paramInfo.inlayHintType = [];
				for (let hints of inlayHints) {
					let pos = inlayHintMap.size;
					inlayHintMap.set(pos, hints);
					paramInfo.inlayHintType.push(pos);
				}
			}

			// inlay addition
			let inlayHintAdds = commandExtItem.inlayHintAdd;

			if (inlayHintAdds !== undefined) {
				paramInfo.inlayHintAddition = [];

				for (let adds of inlayHintAdds) {
					let map = new Map<string, string>([]);

					for (let add of adds) {
						map.set(add.key, add.value);
					}

					paramInfo.inlayHintAddition.push(map);
				}
			}

			return paramInfo;
		};

		let commandExt = vscode.workspace.getConfiguration().get<CommandExt[]>(confCommandExt);

		if (commandExt === undefined) {
			break;
		}

		let insertCommandExt = (commandExtItem: CommandExt) => {
			let command = commandExtItem.command;
			let paramInfo = copyToInfo(commandExtItem);

			commandInfoList.set(command, paramInfo);
		};

		for (let commandExtItem of commandExt!) {
			insertCommandExt(commandExtItem);
		}
	} while (0);

	// update list
	generateList();

	updateSharpCompletionList();
	updateAtCompletionList();

	// update diagnostic
	diagnosticUpdate();
};

export let assetsListPanel: vscode.WebviewPanel;
export interface RefInfo {
	fileExist: boolean;
	type: FileType[];
	uri: vscode.Uri;
	webUri: vscode.Uri;
	refCount: number;
	refScript: Map<string, number[]>;
};

export const commandGetAssetsList_impl = async () => {
	await waitForFileListInit();

	vscode.window.withProgress({
		// location: vscode.ProgressLocation.Notification,
		location: vscode.ProgressLocation.Window,
		title: "Generating assets list...\t",
		cancellable: false
	}, async (progress, token) => {
		// close old ones
		progress.report({ increment: 0, message: "Closing tab..." });

		if (assetsListPanel !== undefined) {
			assetsListPanel.dispose();
		}

		assetsListPanel = createWebviewPanel('AssetList', 'Asset List', vscode.ViewColumn.Active);

		// generate ref list
		progress.report({ increment: 80, message: "Parsing scripts..." });

		let assets = new Map<string, RefInfo>();
		let unusedFileList = projectFileInfoList.keyToArray();

		await iterateParams(
			(script: string, document: vscode.TextDocument) => {
				progress.report({ increment: 0, message: "Parsing script " + script });
			},
			(initScript: string
				, script: string, lineNumber: number
				, currentType: InlayHintType, currentParam: string) => {
				let UpdateAssets = (fileName: string, fileType: FileType) => {
					let fullName = getFullFilePath(fileName);
					fileName = fullName !== undefined ? fullName : fileName;

					unusedFileList.remove(fileName);

					let refInfo = assets.get(fileName);

					if (refInfo === undefined) {
						assets.set(fileName, {
							fileExist: fileListHasItem(fileName)
							, type: []
							, uri: vscode.Uri.file(fileName)
							, webUri: assetsListPanel.webview.asWebviewUri(vscode.Uri.file(fileName))
							, refCount: 0
							, refScript: new Map<string, number[]>()
						});
					}

					refInfo = assets.get(fileName)!;

					// ref count
					refInfo.refCount++;

					// ref type
					refInfo.type.uniquePush(fileType);

					// ref position
					let posIt = refInfo.refScript.get(script);

					if (posIt === undefined) {
						refInfo.refScript.set(script, []);
					}

					posIt = refInfo.refScript.get(script);

					posIt?.push(lineNumber);
				};

				switch (currentType) {
					case InlayHintType.CharacterFileName:
						UpdateAssets(graphicCharactersPath + '\\' + currentParam, FileType.characters);

						break;
					case InlayHintType.DiaFileName:
						UpdateAssets(graphicUIPath + '\\' + currentParam, FileType.ui);

						break;
					case InlayHintType.NameFileName:
						UpdateAssets(graphicUIPath + '\\' + currentParam, FileType.ui);

						break;
					case InlayHintType.CGFileName:
						UpdateAssets(graphicCGPath + '\\' + currentParam, FileType.cg);

						break;
					case InlayHintType.PatternFadeFileName:
						UpdateAssets(graphicPatternFadePath + '\\' + currentParam, FileType.patternFade);

						break;
					case InlayHintType.BGMFileName:
						UpdateAssets(audioBgmPath + '\\' + currentParam, FileType.bgm);

						break;
					case InlayHintType.BGSFileName:
						UpdateAssets(audioBgsPath + '\\' + currentParam, FileType.bgs);

						break;
					case InlayHintType.DubFileName:
						// UpdateAssets(audioDubsPath + '\\' + currentParam, FileType.dubs);
						UpdateAssets(currentParam, FileType.dubs);

						break;
					case InlayHintType.SEFileName:
						UpdateAssets(audioSEPath + '\\' + currentParam, FileType.se);

						break;
					case InlayHintType.VideoFileName:
						UpdateAssets(videoPath + '\\' + currentParam, FileType.video);

						break;
					case InlayHintType.Chapter:
						UpdateAssets(scriptPath + '\\' + currentParam, FileType.script);

						break;

					default:
						break;
				}
			});

		// And set its HTML content
		progress.report({ increment: 20, message: "Generating webview..." });
		assetsListPanel.webview.html = assetList_getWebviewContent(assets, unusedFileList);

		assetsListPanel.webview.onDidReceiveMessage(async (message: any) => {
			assetsListPanel.reveal();
			handleOnClickLink(message);
		});

		// outputChannel.clear();
		// outputChannel.show();

		// outputChannel.appendLine('Unused file:');

		// unusedFileList.sort();

		// for (let file of unusedFileList) {
		//     outputChannel.appendLine(file);
		// }

		// done
		progress.report({ increment: 0, message: "Done" });

		return;
	});
};

export let jumpFlowPanel: vscode.WebviewPanel;
export interface NodeInfo {
	type: InlayHintType,
	script: string,
	lineNumber: number
};

// TODO not finished yet
export const commandShowJumpFlow_impl = async () => {
	await waitForFileListInit();

	vscode.window.withProgress({
		// location: vscode.ProgressLocation.Notification,
		location: vscode.ProgressLocation.Window,
		title: "Generating jump flows...\t",
		cancellable: false
	}, async (progress, token) => {
		// close old ones
		progress.report({ increment: 0, message: "Closing tab..." });

		if (jumpFlowPanel !== undefined) {
			jumpFlowPanel.dispose();
		}

		jumpFlowPanel = createWebviewPanel('JumpFlow', 'Jump Flow', vscode.ViewColumn.Active);

		// generate jump flow
		progress.report({ increment: 80, message: "Parsing scripts..." });

		// [node, jump to index]
		let jumpTable: [NodeInfo, number][] = [];
		let curLabelJumpMap: Map<string, number>;

		await iterateParams(
			(script: string, document: vscode.TextDocument) => {
				curLabelJumpMap = getLabelJumpMap(document);
			},
			(initScript: string
				, script: string, lineNumber: number
				, currentType: InlayHintType, currentParam: string) => {
				let cur: NodeInfo = { type: currentType, script: script, lineNumber: lineNumber };
				let target: NodeInfo = { type: currentType, script: script, lineNumber: -1 };

				let cmp = (l: [NodeInfo, number], r: [NodeInfo, number]) => {
					return l[0].type === r[0].type
						&& l[0].script === r[0].script;
				};

				let updateNodes = () => {
					let targetIndexInArray = jumpTable.uniquePushIf([target, -1], cmp);
					let curIndexInArray = jumpTable.uniquePushIf([cur, targetIndexInArray], cmp);

					jumpTable[curIndexInArray][0] = cur;
					jumpTable[curIndexInArray][1] = targetIndexInArray;
				};

				switch (currentType) {
					case InlayHintType.Label: {
						const labelTarget = curLabelJumpMap.get(currentParam);

						if (labelTarget === undefined) {
							break;
						}

						cur.script = cur.script + " Label at " + lineNumber.toString();

						target.script = target.script + " Label at " + labelTarget.toString();
						target.lineNumber = labelTarget;

						updateNodes();

						break;
					}
					case InlayHintType.Frame: {
						cur.script = cur.script + " Frame jump";

						target.script = "Frame " + currentParam;

						updateNodes();

						break;
					}
					case InlayHintType.Chapter: {
						cur.script = cur.script + " Chapter jump";

						target.script = currentParam + " Chapter jump";

						updateNodes();

						break;
					}

					default:
						break;
				}
			});

		// And set its HTML content
		progress.report({ increment: 20, message: "Generating webview..." });
		jumpFlowPanel.webview.html = jumpFlow_getWebviewContent(jumpTable);

		// done
		progress.report({ increment: 0, message: "Done" });

		return;
	});
};

export const commandReplaceScript_impl = async () => {
	vscode.window.withProgress({
		// location: vscode.ProgressLocation.Notification,
		location: vscode.ProgressLocation.Window,
		title: "Replacing Script...\t",
		cancellable: false
	}, async (progress, token) => {
		interface ReplacePair {
			"regex": string;
			"repStr": string;
		}

		let regexArray: ReplacePair[] = vscode.workspace.getConfiguration().get<ReplacePair[]>(confReplaceScript, []);
		let bEmpty = regexArray.empty();

		if (bEmpty) {
			return;
		}

		if (activeEditor === undefined) {
			return;
		}

		const document = activeEditor.document;

		if (document === undefined) {
			return;
		}

		vscode.languages.setTextDocumentLanguage(document, 'AvgScript');

		let count = 0;
		let increase = 100 / regexArray.length;

		const editOptions = { undoStopBefore: false, undoStopAfter: false };

		for (let item of regexArray) {
			progress.report({ increment: increase, message: "Replacing " + item.regex + " by " + item.repStr });

			const regex: RegExp = new RegExp(item.regex);
			const repStr: string = item.repStr;

			for (let i = 0; i < document.lineCount; ++i) {
				const line = document.lineAt(i);

				if (!line.isEmptyOrWhitespace) {
					let range = new vscode.Range(i, 0, i, line.text.length);
					let repResult = line.text.replace(regex, repStr);

					if (repResult !== line.text) {
						await activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
							editBuilder.replace(range, repResult);
						}, editOptions);

						count++;
					}
				}
			}
		}

		await activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
			editBuilder.insert(new vscode.Position(0, 0), "// #Settings=\n\n");
		}, editOptions);

		await activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
			editBuilder.insert(new vscode.Position(document.lineCount, 0), "\n\n\n#JmpCha=NextChapter\n\n#EOF");
		}, editOptions);

		await vscode.commands.executeCommand("editor.action.formatDocument");

		// done
		progress.report({ increment: 0, message: "Done" });

		vscode.window.showInformationMessage('Replace complete');

		return;
	});
};

export const commandAppendDialogue_impl = async () => {
	if (!activeEditor) {
		return undefined;
	}

	let document = activeEditor.document;

	if (!document) {
		return undefined;
	}

	const cursor = activeEditor.selection.active;
	const documentLineAt = document.lineAt(cursor.line).text;
	const documentLineLength = documentLineAt.length;

	let [line, lineStart, linePrefix, curPos, lineRaw] = currentLineNotComment(document, cursor);

	if (line === undefined) {
		return undefined;
	}

	const spaceLength = documentLineLength - lineRaw!.length;
	let indentString = documentLineAt.substring(0, spaceLength);

	// normal text
	if (currentLineDialogue(line)) {
		const dialogueStruct = parseDialogue(lineRaw!);

		const curLineNew = lineRaw!.substring(0, linePrefix!.length);
		let nextLine = lineRaw!.substring(linePrefix!.length);

		nextLine = (!dialogueStruct.m_namePartEmpty
			? "$" + dialogueStruct.m_namePartRaw + ":"
			: "")
			+ "&" + nextLine + '\r\n';

		const editOptions = { undoStopBefore: false, undoStopAfter: false };
		await activeEditor.edit((editBuilder: vscode.TextEditorEdit) => {
			editBuilder.replace(new vscode.Range(cursor.line, 0
				, cursor.line, documentLineLength)
				, indentString + curLineNew);
			editBuilder.insert(new vscode.Position(cursor.line + 1, 0), indentString + nextLine);
		}, editOptions);

		return;
	}

	vscode.window.showInformationMessage('Current line is not dialogue');
	return undefined;
};

export let formatHintPanel: vscode.WebviewPanel;
export const commandShowDialogueFormatHint_impl = async () => {
	if (formatHintPanel !== undefined) {
		formatHintPanel.dispose();
	}

	formatHintPanel = createWebviewPanel('FormatHint', 'Format Hint', vscode.ViewColumn.Beside);

	formatHintPanel.webview.html = formatHint_getFormatControlContent();
};

export const commandShowHibiscusDocument_impl = async () => {
	const ext = vscode.extensions.getExtension("defisym.avgscript");
	const extPath = ext!.extensionPath;

	const fileName = path.resolve(extPath + "/document/Hibiscus AVG Engine V6.0.md");
	const uri = vscode.Uri.file(fileName);

	// show raw
	// const helpDoc = await vscode.workspace.openTextDocument(uri);
	// const helpEditor = await vscode.window.showTextDocument(helpDoc, { preview: false });

	// show preview
	await vscode.commands.executeCommand("markdown.showPreviewToSide", uri);

	return;
};

export let dubListPanel: vscode.WebviewPanel;
export interface DubInfo {
	dialogueStruct: DialogueStruct;
	dubFileName: string | undefined;
	script: string;
	line: number;

	uri: vscode.Uri;
	webUri: vscode.Uri;
};

export const commandGetDubList_impl = async () => {
	await waitForFileListInit();

	vscode.window.withProgress({
		// location: vscode.ProgressLocation.Notification,
		location: vscode.ProgressLocation.Window,
		title: "Generating dub list...\t",
		cancellable: false
	}, async (progress, token) => {
		// close old ones
		progress.report({ increment: 0, message: "Closing tab..." });

		if (dubListPanel !== undefined) {
			dubListPanel.dispose();
		}

		dubListPanel = createWebviewPanel('DubList', 'Dub List', vscode.ViewColumn.Active);

		// generate ref list
		progress.report({ increment: 80, message: "Parsing scripts..." });

		let dubMap = new Map<string, DubInfo[]>();

		let dubParser: DubParser | undefined = undefined;
		let fileName: string | undefined = undefined;
		let uri: vscode.Uri | undefined = undefined;
		let webUri: vscode.Uri | undefined = undefined;

		await iterateScripts(
			(script: string, document: vscode.TextDocument) => {
				progress.report({ increment: 0, message: "Parsing script " + script });
				dubParser = DubParser.getDubParser(document);
				fileName = getFullFileNameByType(FileType.script, script);

				if (fileName === undefined) {
					return;
				}

				uri = vscode.Uri.file(fileName);
				webUri = dubListPanel.webview.asWebviewUri(vscode.Uri.file(fileName));
			},
			(initScript: string,
				script: string,
				line: string, lineNumber: number,
				lineStart: number, lineEnd: number,
				firstLineNotComment: number) => {
				dubParser!.parseLine(line, (dp: DubParser, dialogueStruct: DialogueStruct) => {
					if (fileName === undefined) {
						return;
					}

					const dubFileName = dp.getPlayFileName();
					let dubInfo = dubMap.getWithInit(dp.curName, []);

					if (dubInfo === undefined) {
						return;
					}

					dubInfo.push({
						dialogueStruct: dialogueStruct,
						dubFileName: dubFileName,
						script: script,
						line: lineNumber,

						uri: uri!,
						webUri: webUri!,
					});
				});
			},
			(initScript: string
				, script: string, lineNumber: number, line: string
				, currentType: InlayHintType, currentParam: string) => { });

		// And set its HTML content
		progress.report({ increment: 20, message: "Generating webview..." });
		dubListPanel.webview.html = dubList_getWebviewContent(dubMap);

		dubListPanel.webview.onDidReceiveMessage(async (message: any) => {
			dubListPanel.reveal();
			handleOnClickLink(message);
		});

		// done
		progress.report({ increment: 0, message: "Done" });

		return;
	});
};

let previousUri: vscode.Uri | undefined = undefined;

export const commandUpdateDub_impl = async (document: vscode.TextDocument, dialogue: string, chapter: string, fileName: string) => {
	const clipLength = 20;

	let options: vscode.OpenDialogOptions = {
		openLabel: '更新',
		canSelectMany: false,
		title: '更新 \'' + fileName + '\' 语音: '
			+ dialogue.substring(0, clipLength)
			+ (dialogue.length > clipLength ? '……' : ''),
	};

	if (previousUri !== undefined) {
		options.defaultUri = previousUri;
	}

	let file = await vscode.window.showOpenDialog(options);

	if (file === undefined) {
		return;
	}

	const src = file[0].path;
	const folder = audio + "dubs\\" + currentLocalCode + "\\" + chapter + "\\";
	const target = folder + fileName + '.ogg';

	previousUri = vscode.Uri.file(path.dirname(src));

	vscode.workspace.fs.copy(vscode.Uri.file(src), vscode.Uri.file(target), { overwrite: true });

	return;
};

export const commandDeleteDub_impl = (targetFile: string) => {
	const target = targetFile;

	vscode.workspace.fs.delete(vscode.Uri.file(target), { recursive: false, useTrash: true });

	return;
};