import * as vscode from 'vscode';
import { lineCommentCache } from '../lib/comment';
import { AppendType, currentLineDialogue } from '../lib/dialogue';
import { dubParseCache } from '../lib/dubs';
import { Throttle } from '../lib/throttle';
import { cropScript } from '../lib/utilities';
import { commandDeleteDub, commandUpdateDub, confCodeLens_ShowTotalLineCount } from './command';
import { basePath, basePathUpdated, fileListInitialized } from './file';

enum CodeLensExType {
	lineInfo,
	fileName,
	play,
	delete,
}

class CodeLensEx extends vscode.CodeLens {
	document: vscode.TextDocument;
	type: CodeLensExType;

	constructor(document: vscode.TextDocument,
		type: CodeLensExType,
		range: vscode.Range,
		command?: vscode.Command) {
		super(range, command);

		this.document = document;
		this.type = type;
	}
}

class CodelensProvider implements vscode.CodeLensProvider {
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	private throttle = new Throttle();

	constructor() {
		vscode.workspace.onDidChangeTextDocument(async (event) => {
			dubParseCache.updateDocumentCache(event.document, event.contentChanges);
			this.refresh();
		});
		vscode.workspace.onDidCloseTextDocument(document => {
			dubParseCache.removeDocumentCache(document);
		});
	}

	public refresh() {
		this.throttle.triggerCallback(() => {
			// console.log("trigger code lens parse");
			this._onDidChangeCodeLenses.fire();
		}, true);
	}

	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): CodeLensEx[] | Thenable<CodeLensEx[]> {
		// console.log("provide code lens");

		let codeLenses: CodeLensEx[] = [];
		if (!basePathUpdated) { return codeLenses; }

		dubParseCache.getDocumentCache(document);
		lineCommentCache.iterateDocumentCacheWithoutComment(document, (lineInfo) => {
			let text = lineInfo.textNoComment;
			let lineNumber = lineInfo.lineNum;
			let lineStart = lineInfo.lineStart;
			let lineEnd = lineInfo.lineEnd;

			const range = new vscode.Range(new vscode.Position(lineNumber, lineStart),
				new vscode.Position(lineNumber, lineEnd));

			// resolve by the push order
			if (currentLineDialogue(text)) {
				codeLenses.push(new CodeLensEx(document, CodeLensExType.lineInfo, range));
				codeLenses.push(new CodeLensEx(document, CodeLensExType.fileName, range));
				codeLenses.push(new CodeLensEx(document, CodeLensExType.play, range));
				codeLenses.push(new CodeLensEx(document, CodeLensExType.delete, range));
			}
		});

		// console.log("provide code lens complete");

		return codeLenses;
	}

	public resolveCodeLens(codeLens: CodeLensEx, token: vscode.CancellationToken) {
		const document = codeLens.document;
		const line = codeLens.range.start.line;

		const dubCache = dubParseCache.getDocumentCacheAt(document, line);

		if (dubCache === undefined) { return undefined; }

		const dubState = dubCache.dubParser;

		switch (codeLens.type) {
			case CodeLensExType.lineInfo: {
				const dialogueStruct = dubCache.dialogueStruct;
				const typeText = dialogueStruct.m_bDialogue ? '对白' : '旁白';
				const appendTypeText = dialogueStruct.m_appendType !== AppendType.none
					? (dialogueStruct.m_appendType === AppendType.sameLine ? '同行桥接' : '换行桥接')
					: '';

				let lineCount = dubState.lineCountMap.getWithInit(dubState.curName, 0)!;
				const curLineInfo = dubState.bNoSideEffect
					? (dubState.curName
						+ ' Line ' + lineCount.toString()
						+ (appendTypeText !== ''
							? ', ' + appendTypeText
							: ''))
					: (appendTypeText !== ''
						? appendTypeText
						: typeText);

				let showTotalLineCount = vscode.workspace.getConfiguration().get<boolean>(confCodeLens_ShowTotalLineCount, false);
				const totalLineInfo = showTotalLineCount ?
					'[' + dubState.totalLineCount.toString() + ']'
					: '';

				codeLens.command = {
					title: totalLineInfo + curLineInfo,
					tooltip: "当前行的信息",
					command: "",
				};

				break;
			}
			case CodeLensExType.fileName: {
				const curChapter = cropScript(document.fileName.substring(basePath.length + 1));
				const dialogueStruct = dubCache.dialogueStruct;

				codeLens.command = {
					title: "对应语音文件名: "
						+ (dubState.dubChapter.iCmp(curChapter)
							? ''
							: dubState.dubChapter + '\\')
						+ dubState.fileName,
					tooltip: "点击指定当前行对应的语音文件，将拷贝选定文件至对应路径，并重命名为对应语音文件名",
					command: commandUpdateDub,
					arguments: [
						dialogueStruct.m_dialoguePart,
						dubState.dubChapter,
						dubState.fileName
					]
				};
				break;
			}
			case CodeLensExType.play: {
				if (!fileListInitialized) {
					codeLens.command = {
						title: "播放语音 🔊: 更新文件中...",
						tooltip: "等待文件列表刷新",
						command: "",
					};

					break;
				}

				const fileName = dubState.getPlayFileName();

				if (fileName === undefined) {
					codeLens.command = {
						title: "播放语音 🔊: 无语音文件",
						tooltip: "当前行无对应的语音文件",
						command: "",
					};

					break;
				}

				codeLens.command = {
					title: "播放语音 🔊",
					tooltip: "点击播放当前行对应的语音文件",
					command: "vscode.open",
					arguments: [vscode.Uri.file(fileName), vscode.ViewColumn.Beside]
				};

				break;
			}
			case CodeLensExType.delete: {
				if (!fileListInitialized) {
					codeLens.command = {
						title: "删除语音 🗑️: 更新文件中...",
						tooltip: "等待文件列表刷新",
						command: "",
					};

					break;
				}

				const fileName = dubState.getPlayFileName();

				if (fileName === undefined) {
					codeLens.command = {
						title: "删除语音 🗑️: 无语音文件",
						tooltip: "当前行无对应的语音文件",
						command: "",
					};

					break;
				}

				codeLens.command = {
					title: "删除语音 🗑️",
					tooltip: "点击删除当前行对应的语音文件",
					command: commandDeleteDub,
					arguments: [fileName]
				};

				break;
			}
		}

		return codeLens;
	}
}

export const codeLensProviderClass = new CodelensProvider();

export const codeLensProvider = vscode.languages.registerCodeLensProvider('AvgScript', codeLensProviderClass);