import * as vscode from 'vscode';

import { activeEditor } from '../extension';
import { lineCommentCache } from '../lib/comment';
import { currentLineCommand, currentLineDialogue, currentLineLabel, parseDialogue } from '../lib/dialogue';
import { InlayHintType, ParamType, atKeywordList, commandInfoList, commandListInitialized, deprecatedKeywordList, internalImageID, internalKeywordList, settingsParamDocList, sharpKeywordList } from '../lib/dict';
import { DubCache, dubDiagnostic, dubParseCache } from '../lib/dubs';
import { LineInfo } from "../lib/iterateLines";
import { regexHexColor, regexRep } from '../lib/regExp';
import { ScriptSettings, parseSettings } from '../lib/settings';
import { Throttle } from '../lib/throttle';
import { getAllParams, getCommandParamFileType, imageStretched } from '../lib/utilities';
import { FileType, basePathUpdated, currentLocalCode, currentLocalCodeDisplay, fileExistsInFileList, fileListInitialized, getFileInfoFromInfoList, getFullFileNameByType, projectConfig } from './file';
import { labelCache } from './label';

export const diagnosticsCollection = vscode.languages.createDiagnosticCollection('AvgScript');
const nonActiveLanguageDecorator = vscode.window.createTextEditorDecorationType({
	opacity: '0.5',
});
let decoOpt: vscode.DecorationOptions[] = [];

function updateDiagnostics(document: vscode.TextDocument, checkFile: boolean = false) {
	if (!commandListInitialized) { return; }
	if (!basePathUpdated) { return; }

	if (document.languageId !== 'AvgScript') {
		diagnosticsCollection.delete(document.uri);

		return;
	}

	let diagnostics: vscode.Diagnostic[] = [];
	let labels: string[] = [];
	let blockCount: number = 0;
	let blockPos: vscode.Range[] = [];

	let settings: ScriptSettings;

	let settingsParsed = false;
	let liteMode = false;
	let bVNMode = false;

	let EOF = false;
	let nextJMP = false;

	decoOpt = [];

	let curDubCache: DubCache[] | undefined = undefined;
	let curDubCacheIndex = 0;

	if (checkFile) {
		curDubCache = dubParseCache.getDocumentCache(document);
		const dubErrors = dubDiagnostic(document);

		for (const dubError of dubErrors) {
			let info = "Dub file duration " + dubError.info + " than excepted";

			diagnostics.push(new vscode.Diagnostic(dubError.range
				, info
				, vscode.DiagnosticSeverity.Information
			));
		}
	}

	lineCommentCache.iterateDocumentCacheWithComment(document, (info: LineInfo) => {
		let { lineIsComment,

			originText,
			textNoComment,
			textNoCommentAndLangPrefix,
			langPrefixLength,

			lineNum,

			lineStart,
			lineEnd,

			firstLineNotComment } = info;

		// decorate
		if (info.lineNotCurLanguage) {
			const decoration = { range: new vscode.Range(lineNum, lineStart, lineNum, lineEnd), hoverMessage: "非当前语言: " + currentLocalCodeDisplay + currentLocalCode };

			decoOpt.push(decoration);
		}

		if (lineIsComment && !info.lineNotCurLanguage) {
			return;
		}

		const lineStartWithLangPrefix = lineStart + langPrefixLength;

		// normal parse
		if (currentLineLabel(textNoCommentAndLangPrefix)) {
			if (labels.includes(textNoCommentAndLangPrefix)) {
				diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, lineEnd)
					, "Duplicated Label: " + textNoCommentAndLangPrefix.substring(1)
					, vscode.DiagnosticSeverity.Warning));

				return;
			}

			labels.push(textNoCommentAndLangPrefix);

			return;
		}

		if (currentLineCommand(textNoCommentAndLangPrefix)) {
			if (textNoCommentAndLangPrefix.matchStart(/#Settings/gi)) {
				let start = textNoCommentAndLangPrefix.indexOf('=');
				let params = textNoCommentAndLangPrefix.substring(start + 1).split('|');

				start += lineStartWithLangPrefix;

				for (let settingsParam of params) {
					let cutSettingsParam = settingsParam;
					let cutSettingsParamLength = cutSettingsParam.length;

					start++;

					if (settingsParamDocList.getValue(cutSettingsParam) === undefined) {
						diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, start, lineNum, start + cutSettingsParamLength)
							, "Invalid Setting Param: " + cutSettingsParam
							, vscode.DiagnosticSeverity.Warning));
					}

					start += cutSettingsParamLength;
				}

				if (lineNum !== firstLineNotComment) {
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, lineEnd)
						, "Settings Not At First Line"
						, vscode.DiagnosticSeverity.Error));
				}

				if (!settingsParsed) {
					settings = parseSettings(textNoCommentAndLangPrefix, true)!;

					if (settings) {
						if (settings.LiteMode) {
							liteMode = true;
						}

						if (settings.VNMode) {
							bVNMode = true;
						}
					}
				}

				if (settingsParsed) {
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, lineEnd)
						, "Duplicated Setting"
						, vscode.DiagnosticSeverity.Error));
				}

				settingsParsed = true;

				return;
			}

			if (textNoCommentAndLangPrefix.matchStart(/#EOF/gi)) {
				EOF = true;

				return;
			}

			if (textNoCommentAndLangPrefix.matchStart(/(#CJMP|#JMPCha|#FJMP|#JMPFra)/gi)) {
				nextJMP = true;
			}

			if (textNoCommentAndLangPrefix.matchStart(/#Begin/gi)) {
				blockCount++;
				blockPos.push(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, lineEnd));

				return;
			}

			if (textNoCommentAndLangPrefix.matchStart(/#End/gi)) {
				if (blockCount === 0) {
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, lineEnd)
						, "End Without Begin"
						, vscode.DiagnosticSeverity.Warning));

					return;
				}

				blockCount--;
				blockPos.pop();

				return;
			}

			const params = getAllParams(textNoCommentAndLangPrefix);
			const prefix = params[0][0];
			const command = params[0].substring(1);
			const paramNum = params.length - 1;
			const paramDefinition = commandInfoList.getValue(command);

			// unknown command, return
			if (paramDefinition === undefined) {
				diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, lineEnd)
					, "Undocumented Command: " + params[0]
					, vscode.DiagnosticSeverity.Information));

				return;
			}

			if ((prefix === '@' && sharpKeywordList.hasValue(command))
				|| (prefix === '#' && atKeywordList.hasValue(command))) {
				diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, lineStartWithLangPrefix + 1)
					, "Wrong Command Prefix: " + params[0]
					, vscode.DiagnosticSeverity.Error));
			}

			let contentStart: number = lineStartWithLangPrefix + command.length + 1;

			if (internalKeywordList.hasValue(command)) {
				diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, contentStart)
					, "User Shouldn't Use Internal Command: " + params[0]
					, vscode.DiagnosticSeverity.Error));
			}

			if (deprecatedKeywordList.hasValue(command)) {
				diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, contentStart)
					, "User Shouldn't Use Deprecated Command: " + params[0]
					, vscode.DiagnosticSeverity.Warning));
			}

			if (!bVNMode && paramDefinition.VNModeOnly) {
				diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, lineEnd)
					, "Using VNMode Exclusive command in Non VNMode"
					, vscode.DiagnosticSeverity.Warning));
			}

			if (bVNMode && paramDefinition.NonVNModeOnly) {
				diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix, lineNum, lineEnd)
					, "Using Non VNMode Exclusive command in VNMode"
					, vscode.DiagnosticSeverity.Warning));
			}

			// check internal ID
			enum ImageBehavior {
				create,
				destroy
			}

			let imageBehavior;
			let checkImageID = false;
			let checkPos = 0;

			if (params[0].matchEntire(/(@Char|@Character)/gi)) {
				checkImageID = true;
				imageBehavior = ImageBehavior.create;
				checkPos = 2;
			}

			if (params[0].matchEntire(/(@CD|@CharDispose)/gi)) {
				checkImageID = true;
				imageBehavior = ImageBehavior.destroy;
				checkPos = 1;
			}

			// Check param valid
			const paramFormat = paramDefinition.type;
			const paramHint = paramDefinition.inlayHintType;
			const paramNumMin = paramDefinition.minParam;
			const paramNumMax = paramDefinition.maxParam;

			const treatAsOneParam = paramDefinition.treatAsOneParam === undefined
				? false
				: paramDefinition.treatAsOneParam;

			let curLinePrefix = params[0];

			for (let j = 1; j < params.length; j++) {
				// too much param, return
				if (!treatAsOneParam && j > paramNumMax) {
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, lineEnd)
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

				// replace, don't check, continue
				if (curParam.match(regexRep)) {
					contentStart += curParam.length;
					continue;
				}

				// unexpected param, don't need follow check, continue
				if (paramDefinition.required !== undefined) {
					const curRequired = paramDefinition.required[j - 1];

					if (curRequired !== undefined && !curRequired.empty()) {
						if (!curRequired.includes(curParam)) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
								, "Unexpected Param"
								, vscode.DiagnosticSeverity.Error));

							contentStart += curParam.length;
							continue;
						}
					}
				}

				if (checkImageID && checkPos === j) {
					const availableBehavior = internalImageID.get(parseInt(curParam));
					if (availableBehavior !== undefined) {
						switch (imageBehavior) {
							case ImageBehavior.create: {
								if (!availableBehavior.Create) {
									diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
										, "Cannot Be Created Using Internal ID " + curParam
										, vscode.DiagnosticSeverity.Error));
								}

								break;
							}
							case ImageBehavior.destroy: {
								if (!availableBehavior.Destroy) {
									diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
										, "Cannot Be Destroyed Using Internal ID " + curParam
										, vscode.DiagnosticSeverity.Error));
								}

								break;
							}
						}
					}
				}

				switch (currentType) {
					case ParamType.String:

						break;
					case ParamType.Number:
						if (!curParam.isNumber()) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
								, "Invalid Number: " + curParam
								, vscode.DiagnosticSeverity.Error));
						}

						break;
					case ParamType.ZeroOne:
						let curParamVal = parseInt(curParam);

						if (curParamVal !== 0 && curParamVal !== 1) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
								, "Invalid ZeroOne Param: " + curParam
								, vscode.DiagnosticSeverity.Error));
						}

						break;
					case ParamType.Boolean:
						if (!curParam.isNumber()
							&& (!curParam.iCmp("on") && !curParam.iCmp("off"))) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
								, "Invalid Option: " + curParam
								, vscode.DiagnosticSeverity.Error));
						}

						break;
					case ParamType.Volume:
						if (!curParam.isNumber()
							|| !curParam.iCmp("BGM")
							|| !curParam.iCmp("BGS")
							|| !curParam.iCmp("SE")
							|| !curParam.iCmp("DUB")) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
								, "Invalid Volume: " + curParam
								, vscode.DiagnosticSeverity.Error));
						}

						break;
					case ParamType.Order:
						if (!curParam.iCmp("Front")
							|| !curParam.iCmp("Back")
							|| Number.isNaN(parseInt(curParam))) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
								, "Invalid Order: " + curParam
								, vscode.DiagnosticSeverity.Error));
						}

						break;
					case ParamType.ObjType:
						// if (!curParam.iCmp("Pic")
						//     && !curParam.iCmp("Str")) {
						//     diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNumber, contentStart, lineNumber, contentStart + curParam.length)
						//         , "Invalid Object Type: " + curParam
						//         , vscode.DiagnosticSeverity.Error));
						// }

						break;
					case ParamType.Color:
						if (curParam.matchEntire(regexHexColor)) {
							if (j !== params.length - 1) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, lineEnd)
									, "Too Many Params"
									, vscode.DiagnosticSeverity.Warning));
							}
						} else {
							if (j + 2 >= params.length) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineEnd, lineNum, lineEnd)
									, "Too Few Params"
									, vscode.DiagnosticSeverity.Warning));
							}
							if (!curParam.isNumber()) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
									, "Invalid Number: " + curParam
									, vscode.DiagnosticSeverity.Error));
							}
						}

						break;
					case ParamType.File:
						if (!checkFile) { break; }

						const commandType = getCommandParamFileType(curLinePrefix);

						let fileParam = curParam;

						if (commandType === FileType.dubs) {
							if (settings && settings.NoSideEffect) {
								while (curDubCache![curDubCacheIndex].totalLine < lineNum) {
									curDubCacheIndex++;
								}

								let curDubState = curDubCache![curDubCacheIndex].dubParser;

								fileParam = curDubState.getFileRelativePrefix() + fileParam;
							} else {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
									, "Cannot diagnostic file " + curParam + " if script has side effect"
									, vscode.DiagnosticSeverity.Information));

								break;
							}
						}

						if (!fileExistsInFileList(commandType, fileParam)) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
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
					case InlayHintType.Alpha: {
						let curParamVal = parseInt(curParam);

						if (curParamVal < 0
							|| curParamVal > 255) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
								, "Invalid Alpha Param: " + curParam
								, vscode.DiagnosticSeverity.Error));
						}

						break;
					}

					case InlayHintType.Label: {
						let curCache = labelCache.getDocumentCache(document);
						if (curCache.labelJumpMap.getValue(curParam) === undefined) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart, lineNum, contentStart + curParam.length)
								, "Invalid Label: " + curParam
								, vscode.DiagnosticSeverity.Error));
						}

						break;
					}

					case InlayHintType.Width: {
						// if cur is width, then next must be height
						const nextParam = params[j + 1];

						// don't have ignorable width & height
						if (command.matchEntire('BackZoom')) {
							if (nextParam === undefined) {
								break;
							}

							if (projectConfig === undefined) {
								break;
							}

							const width = parseInt(curParam);
							const height = parseInt(nextParam);

							const projWidth = projectConfig.Display.RenderResolutionX;
							const projHeight = projectConfig.Display.RenderResolutionY;

							if (projWidth === undefined || projHeight === undefined) {
								break;
							}

							if (imageStretched({
								width: projWidth,
								height: projHeight,
							}, {
								width: width,
								height: height,
							})) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart
									, lineNum, contentStart + curParam.length + 1 + nextParam.length)
									, "BackZoom Ratio doesn't match Resolution Ratio"
									, vscode.DiagnosticSeverity.Warning));
							}

							let outOfScreen = false;

							const x = parseInt(params[1]);
							const y = parseInt(params[2]);

							outOfScreen = outOfScreen || (x - width / 2) < (-1 * projWidth / 2);
							outOfScreen = outOfScreen || (x + width / 2) > (projWidth / 2);

							outOfScreen = outOfScreen || (y - height / 2) < (0);
							outOfScreen = outOfScreen || (y + height / 2) > (projHeight);

							if (outOfScreen) {
								diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart - 1 - params[1].length - 1 - params[2].length
									, lineNum, contentStart + curParam.length + 1 + nextParam.length)
									, "BackZoom has area out of screen"
									, vscode.DiagnosticSeverity.Warning));
							}
						}

						if (!checkFile) {
							break;
						}

						const filePath = getFullFileNameByType(FileType.characters, params[1]);

						if (filePath === undefined) {
							break;
						}

						const data = getFileInfoFromInfoList(filePath);

						if (data === undefined) {
							break;
						}

						const width = parseInt(curParam);
						const height = nextParam === undefined
							? data.height
							: parseInt(nextParam);

						if (imageStretched({
							width: data.width,
							height: data.height,
						}, {
							width: width,
							height: height,
						})) {
							diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, contentStart
								, lineNum, contentStart + curParam.length + (nextParam === undefined
									? 0
									: 1 + nextParam.length))
								, "Stretched Ratio doesn't match Image Ratio"
								, vscode.DiagnosticSeverity.Warning));
						}

						break;
					}

				}

				contentStart += curParam.length;
			}

			if (paramNum < paramNumMin) {
				diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineEnd, lineNum, lineEnd)
					, "Too Few Params"
					, vscode.DiagnosticSeverity.Warning));
			}

			return;
		}

		if (currentLineDialogue(textNoCommentAndLangPrefix) && projectConfig) {
			const maxLength = parseInt(projectConfig.Debug.Debug_MaxLength);
			const dialogueStruct = parseDialogue(textNoCommentAndLangPrefix);
			if (dialogueStruct.m_dialoguePart.length > maxLength) {
				diagnostics.push(new vscode.Diagnostic(new vscode.Range(lineNum, lineStartWithLangPrefix + maxLength, lineNum, lineEnd)
					, "Text maybe too long, expected less than " + maxLength.toString() + " characters"
					, vscode.DiagnosticSeverity.Warning));
			}

			return;
		}
	});

	for (let blockPosItem of blockPos) {
		diagnostics.push(new vscode.Diagnostic(blockPosItem
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

	diagnosticsCollection.set(document.uri, diagnostics);
}

//--------------------

function diagnosticUpdateCore(checkFile: boolean = false) {
	if (activeEditor === undefined) {
		return;
	}

	let activeDocument = activeEditor.document;

	updateDiagnostics(activeDocument, checkFile);
	activeEditor.setDecorations(nonActiveLanguageDecorator, decoOpt);
}

export const diagnosticThrottle = new Throttle();

diagnosticThrottle.addCallback(() => {
	diagnosticUpdateCore(fileListInitialized);
});