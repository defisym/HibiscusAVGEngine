import * as vscode from 'vscode';

import { getHoverContents, getType, FileType, getParamAtPosition, currentLineNotComment, getFileCompletionByType, getAllParams } from '../lib/utilities';
import {
    commandDocList, settingsParamDocList, langDocList, normalTextDoc, dialogueTextElement, narratorTextElement, narratorTextPlain
} from '../lib/dict';
import { getLabelComment } from './label';
import { fileListInitialized } from './file';
import { filterString, findDelimiter, FORMAT_IGNORE_INCOMPLETE } from '../lib/dialogue';

export const hover = vscode.languages.registerHoverProvider('AvgScript', {
    provideHover(document, position, token) {
        let range = document.getWordRangeAtPosition(position);

        if (!range) {
            return undefined;
        }

        let [line, lineStart, linePrefix, curPos, lineRaw] = currentLineNotComment(document, position);

        if (line === undefined) {
            return undefined;
        }

        let word: string = document.getText(range).toLowerCase();

        // settings
        if (line.startsWith('#Settings='.toLowerCase())) {
            return new vscode.Hover(getHoverContents(word, settingsParamDocList));
        }

        // language prefix
        if (line.startsWith('Lang'.toLowerCase())
            // the length of language code (ZH) is 2
            && curPos! <= 'Lang[ZH]'.length) {
            return new vscode.Hover(getHoverContents(word, langDocList));
        }

        // normal text
        if (!line.startsWith('@') && !line.startsWith('#')) {
            let bDialogue = false;
            let bNoNamePart = false;

            const delimiterPos = findDelimiter(line);

            if (delimiterPos !== -1 && !line.startsWith('$')) {
                bDialogue = true;
            }

            bNoNamePart = delimiterPos === -1;

            // name
            const nameRegex = /(.*)(\[([^\[\]]+)\])/gi;
            let namePart = lineRaw!.substring(0, delimiterPos);

            if (namePart.startsWith('$')) {
                namePart = namePart.substring(1);
            }

            let array = [...filterString(namePart, FORMAT_IGNORE_INCOMPLETE).matchAll(nameRegex)];
            namePart = filterString(namePart, FORMAT_IGNORE_INCOMPLETE);

            const matched = array.length !== 0;

            const name = matched ? array[0][1] : namePart;
            const dubHint = matched ? array[0][1] : namePart;
            const headHint = matched ? array[0][3] : dubHint;

            // dialogue
            enum AppendType {
                none = 0,
                sameLine = 1,
                nextLine = 2,
            }

            let appendType = AppendType.none;
            let dialoguePart = lineRaw!.substring(delimiterPos + 1);

            if (dialoguePart[0] === '&') {
                if (dialoguePart[1] === '&') {
                    appendType = AppendType.nextLine;
                } else {
                    appendType = AppendType.sameLine;
                }
            }

            dialoguePart = dialoguePart.substring(appendType);
            dialoguePart = filterString(dialoguePart, FORMAT_IGNORE_INCOMPLETE);

            // script
            let curLine = `### 当前行(无格式)为{$Type}
            
            {$Element}
            `;

            const typeText = bDialogue ? '对白' : '旁白';
            const appendTypeText = appendType !== AppendType.none
                ? (appendType === AppendType.sameLine ? '同行桥接' : '换行桥接')
                : typeText;

            let elementText = bDialogue
                ? dialogueTextElement
                : bNoNamePart
                    ? narratorTextPlain
                    : narratorTextElement;

            let outPutText = (str: string) => {
                return str === ''
                    ? '无'
                    : str;
            };

            elementText = elementText.replace('{$Name}', outPutText(name));
            elementText = elementText.replace('{$HeadHint}', outPutText(headHint));
            elementText = elementText.replace('{$DubHint}', outPutText(dubHint));
            elementText = elementText.replace('{$Dialogue}', dialoguePart);

            curLine = curLine.replace('{$Type}', appendTypeText);
            curLine = curLine.replace('{$Element}', elementText);

            let curLineMD = new vscode.MarkdownString(curLine);

            // basic
            curLineMD.appendMarkdown('\n--------------------\n');
            curLineMD.appendMarkdown(normalTextDoc);

            // return
            return new vscode.Hover(curLineMD);
        }
        // command
        else {
            const params = getAllParams(line);
            const command = params[0];

            if (curPos! <= command.length) {
                return new vscode.Hover(getHoverContents(word, commandDocList));
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