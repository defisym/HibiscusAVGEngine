import * as vscode from 'vscode';
import { AppendType, currentLineDialogue, parseDialogue } from '../lib/dialogue';
import { DubParser } from '../lib/dubs';
import { iterateLines } from '../lib/iterateLines';
import { getSettings } from '../lib/settings';
import { cropScript, sleep } from '../lib/utilities';
import { narrator } from '../webview/dubList';
import { commandUpdateDub } from './command';
import { basePath, fileListInitialized } from './file';

// const refresher = setInterval(() => {
//     codeLensProviderClass.refresh();
// }, 500);

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
        while(this.bUpdating) {
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
                            title: "对应语音文件: "
                                + (dubState.dubChapter.iCmp(curChapter)
                                    ? ''
                                    : dubState.dubChapter + '\\')
                                + dubState.fileName,
                            command: commandUpdateDub,
                            arguments: [dubState.dubChapter + '\\' + dubState.fileName]
                        };

                        codeLenses.push(codeLensDubFileName);

                        // preview
                        let codeLensPlayDub = new vscode.CodeLens(range);

                        do {
                            if (!fileListInitialized && this.bFirstRun) {
                                codeLensPlayDub.command = {
                                    title: "播放语音 🔊: 更新文件中...",
                                    command: "",
                                };

                                break;
                            }

                            if (fileName === undefined) {
                                codeLensPlayDub.command = {
                                    title: "播放语音 🔊: 无语音文件",
                                    command: "",
                                };

                                break;
                            }

                            codeLensPlayDub.command = {
                                title: "播放语音 🔊",
                                command: "vscode.open",
                                arguments: [vscode.Uri.file(fileName), vscode.ViewColumn.Beside]
                            };
                        } while (0);

                        codeLenses.push(codeLensPlayDub);
                    } while (0);
                }
            }

            dubState.afterPlay();
        });

        this.bUpdating = false;
        this.bFirstRun = false;

        return codeLenses;
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        return undefined;
    }
}

export const codeLensProviderClass = new CodelensProvider();

export const codeLensProvider = vscode.languages.registerCodeLensProvider('AvgScript', codeLensProviderClass);