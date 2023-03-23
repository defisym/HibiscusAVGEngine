import * as vscode from 'vscode';
import { AppendType, currentLineDialogue, parseDialogue } from '../lib/dialogue';
import { DubParser } from '../lib/dubs';
import { iterateLines } from '../lib/iterateLines';
import { getSettings } from '../lib/settings';
import { cropScript, sleep } from '../lib/utilities';
import { narrator } from '../webview/dubList';
import { commandDeleteDub, commandUpdateDub } from './command';
import { diagnosticUpdateCore } from './diagnostic';
import { basePath, fileListInitialized } from './file';

const durationPerWord = (1.0 * 60 / 120);
const durationRange = 0.5;
const durationThreshold = 2.0;

export const dubError: Map<vscode.Uri, vscode.Range[]> = new Map();

export class CodelensProvider implements vscode.CodeLensProvider {
    private bUpdating = false;
    private bFirstRun = true;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        vscode.workspace.onDidChangeTextDocument((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public async refresh() {
        while (this.bUpdating) {
            await sleep(50);
        }

        this._onDidChangeCodeLenses.fire();
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        let codeLenses: vscode.CodeLens[] = [];
        this.bUpdating = true;

        const settings = getSettings(document);
        const bSettingsSideEffect = settings && settings.NoSideEffect;
        let bNoSideEffect = bSettingsSideEffect;

        let lineCountMap: Map<string, number> = new Map();

        const curChapter = cropScript(document.fileName.substring(basePath.length + 1));
        let dubState = new DubParser(curChapter);
        dubState.parseSettings(settings);

        dubError.clear();

        iterateLines(document, (text, lineNumber
            , lineStart, lineEnd
            , firstLineNotComment) => {
            // ----------
            // Parse command
            // ----------
            if (!currentLineDialogue(text)) {
                if (bSettingsSideEffect) {
                    if (text.matchStart('#SideEffect')) {
                        bNoSideEffect = false;

                        return;
                    }
                    if (text.matchStart('#NoSideEffect')) {
                        bNoSideEffect = true;

                        return;
                    }
                }

                dubState.parseCommand(text);
            }
            // ----------
            // Parse dialogue
            // ----------
            else {
                const dialogueStruct = parseDialogue(text, text!);
                const range = new vscode.Range(new vscode.Position(lineNumber, lineStart),
                    new vscode.Position(lineNumber, lineEnd));

                // depend on display name
                let name = dialogueStruct.m_name;

                if (name.empty()) {
                    name = narrator;
                }

                let lineCount = lineCountMap.get(name);

                if (lineCount === undefined) {
                    lineCountMap.set(name, 0);
                    lineCount = lineCountMap.get(name);
                }

                if (lineCount === undefined) {
                    return;
                }

                if (bNoSideEffect) {
                    lineCountMap.set(name, lineCount + 1);
                }

                // ----------
                // Dialogue type & line number
                // ----------

                let codeLens = new vscode.CodeLens(range);

                const typeText = dialogueStruct.m_bDialogue ? '对白' : '旁白';
                const appendTypeText = dialogueStruct.m_appendType !== AppendType.none
                    ? (dialogueStruct.m_appendType === AppendType.sameLine ? '同行桥接' : '换行桥接')
                    : '';

                codeLens.command = {
                    title: bNoSideEffect
                        ? (name
                            + ' Line ' + lineCount.toString()
                            + (appendTypeText !== ''
                                ? ', ' + appendTypeText
                                : ''))
                        : (appendTypeText !== ''
                            ? appendTypeText
                            : typeText),
                    tooltip: "当前行的信息",
                    command: "",
                };

                codeLenses.push(codeLens);

                if (bNoSideEffect) {
                    dubState.updateState(name);
                    const fileName = dubState.getPlayFileName();

                    do {
                        // basic
                        let codeLensDubFileName = new vscode.CodeLens(range);

                        codeLensDubFileName.command = {
                            title: "对应语音文件名: "
                                + (dubState.dubChapter.iCmp(curChapter)
                                    ? ''
                                    : dubState.dubChapter + '\\')
                                + dubState.fileName,
                            tooltip: "点击指定当前行对应的语音文件，将拷贝选定文件至对应路径，并重命名为对应语音文件名",
                            command: commandUpdateDub,
                            arguments: [dubState.dubChapter + '\\' + dubState.fileName]
                        };

                        codeLenses.push(codeLensDubFileName);

                        // preview
                        do {
                            if (!fileListInitialized && this.bFirstRun) {
                                let codeLensPlayDub = new vscode.CodeLens(range);

                                codeLensPlayDub.command = {
                                    title: "播放语音 🔊: 更新文件中...",
                                    tooltip: "等待文件列表刷新",
                                    command: "",
                                };

                                codeLenses.push(codeLensPlayDub);

                                break;
                            }

                            if (fileName === undefined) {
                                let codeLensPlayDub = new vscode.CodeLens(range);

                                codeLensPlayDub.command = {
                                    title: "播放语音 🔊: 无语音文件",
                                    tooltip: "当前行无对应的语音文件",
                                    command: "",
                                };

                                codeLenses.push(codeLensPlayDub);

                                break;
                            }

                            let codeLensPlayDub = new vscode.CodeLens(range);

                            codeLensPlayDub.command = {
                                title: "播放语音 🔊",
                                tooltip: "点击播放当前行对应的语音文件",
                                command: "vscode.open",
                                arguments: [vscode.Uri.file(fileName), vscode.ViewColumn.Beside]
                            };

                            codeLenses.push(codeLensPlayDub);

                            do {
                                const fileInfo = dubState.getPlayFileInfo(fileName);

                                if (fileInfo === undefined) {
                                    break;
                                }

                                const duration = fileInfo.format.duration;

                                if (duration === undefined) {
                                    break;
                                }

                                const expectedDuration = dialogueStruct.m_dialoguePart.length * durationPerWord + durationRange;

                                if (duration >= durationThreshold && expectedDuration <= duration) {
                                    let ranges = dubError.get(document.uri);

                                    if (ranges === undefined) {
                                        dubError.set(document.uri, []);
                                        ranges = dubError.get(document.uri);
                                    }

                                    ranges!.push(range);
                                }
                            } while (0);

                            let codeLensDeleteDub = new vscode.CodeLens(range);

                            codeLensDeleteDub.command = {
                                title: "删除语音 🗑️",
                                tooltip: "点击删除当前行对应的语音文件",
                                command: commandDeleteDub,
                                arguments: [fileName]
                            };

                            codeLenses.push(codeLensDeleteDub);

                        } while (0);
                    } while (0);
                }
            }

            dubState.afterPlay();
        });

        this.bUpdating = false;
        this.bFirstRun = false;

        if (!dubError.get(document.uri)?.empty()) {
            diagnosticUpdateCore(fileListInitialized);
        }

        return codeLenses;
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        return undefined;
    }
}

export const codeLensProviderClass = new CodelensProvider();

export const codeLensProvider = vscode.languages.registerCodeLensProvider('AvgScript', codeLensProviderClass);