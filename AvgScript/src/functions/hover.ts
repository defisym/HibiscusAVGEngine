import * as vscode from 'vscode';

import { getNumberOfParam, getHoverContents, getType, FileType, getParamAtPosition, currentLineNotComment, getFileCompletionByType } from '../lib/utilities';
import {
    commandDocList, settingsParamDocList, langDocList
} from '../lib/dict';
import { getLabelComment } from './label';
import { fileListInitialized } from './file';

export const hover = vscode.languages.registerHoverProvider('AvgScript', {
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

export const hoverFile = vscode.languages.registerHoverProvider('AvgScript', {
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

        const type = getType(linePrefix!);

        switch (type) {
            case FileType.frame:
            case FileType.label:
                return new vscode.Hover(new vscode.MarkdownString(getLabelComment(fileName)));
            default:
                return new vscode.Hover(getFileCompletionByType(type, fileName)?.documentation!);
        }
    }
});