import * as vscode from 'vscode';

import { atKeywordList, commandDocList, settingsParamDocList, settingsParamList, sharpKeywordList } from '../lib/dict';
import { FileType, currentLineNotComment, getCompletionItemList, getSubStrings, getType, lineValidForCommandCompletion } from '../lib/utilities';
import { audioBgmCompletions, audioBgsCompletions, audioDubsCompletions, audioSECompletions, fileListInitialized, graphicCGCompletions, graphicCharactersCompletions, graphicPatternFadeCompletions, graphicUICompletions, scriptCompletions, videoCompletions } from './file';
import { labelCompletions } from './label';

function completionItemsProvider(document: vscode.TextDocument, position: vscode.Position, src: string[]) {
    let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

    if (line === undefined) {
        return undefined;
    }

    if (!lineValidForCommandCompletion(linePrefix!)) {
        return undefined;
    }

    return getCompletionItemList(src, commandDocList);
}

export const sharpCommands = vscode.languages.registerCompletionItemProvider(
    'AvgScript',
    {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            return completionItemsProvider(document, position, sharpKeywordList);
        }
    },
    '#' // triggered whenever a '#' is being typed
);

export const atCommands = vscode.languages.registerCompletionItemProvider(
    'AvgScript',
    {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            return completionItemsProvider(document, position, atKeywordList);
        }
    },
    '@' // triggered whenever a '@' is being typed
);

export const settingsParam = vscode.languages.registerCompletionItemProvider(
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

            // filter setting params that already exists
            let curParams = getSubStrings(line, ['=', '|']);
            let paramList: typeof settingsParamList = [];

            for (let param of settingsParamList) {
                if (!curParams.hasValue(param)) {
                    paramList.push(param);
                }
            }

            return getCompletionItemList(paramList, settingsParamDocList);
        }
    },
    '=', '|'
);

export const langPrefix = vscode.languages.registerCompletionItemProvider(
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

export const fileSuffix = vscode.languages.registerCompletionItemProvider(
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

export const fileName = vscode.languages.registerCompletionItemProvider(
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
