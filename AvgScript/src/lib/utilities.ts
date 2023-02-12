import * as vscode from 'vscode';

import { audioBgmCompletions, audioBgsCompletions, audioDubsCompletions, audioSECompletions, fileListHasItem, getCorrectPathAndType, getFullFileNameByType, graphicCGCompletions, graphicCharactersCompletions, graphicFXCompletions, graphicPatternFadeCompletions, graphicUICompletions, scriptCompletions, videoCompletions } from '../functions/file';
import { InlayHintType, commandInfoList, deprecatedKeywordList, docList, internalKeywordList } from './dict';
import { iterateLines } from './iterateLines';
import { beginRegex, endRegex } from './regExp';

import path = require('path');

const delimiter = ['=', ':'];

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getBuffer(filePath: string) {
    return Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.file(filePath)));
}

export async function getFileStat(filePath: string) {
    try {
        return await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
    } catch {
        return undefined;
    }
}

export function getCompletion(name: string, fileList: vscode.CompletionItem[]) {
    name = name.toLowerCase();

    for (let file of fileList) {
        let element = file.insertText?.toString().toLowerCase()!;

        if (element?.startsWith(name)) {
            return file;
        }
    };

    return undefined;
}

export function getFileCompletionByType(type: FileType, fileName: string) {
    // correction
    let [corType, corFileName] = getCorrectPathAndType(type, fileName)!;

    fileName = corFileName;
    type = corType;

    switch (type) {
        case FileType.fx:
            return getCompletion(fileName, graphicFXCompletions);
        case FileType.characters:
            return getCompletion(fileName, graphicCharactersCompletions);
        case FileType.ui:
            return getCompletion(fileName, graphicUICompletions);
        case FileType.cg:
            return getCompletion(fileName, graphicCGCompletions);
        case FileType.patternFade:
            return getCompletion(fileName, graphicPatternFadeCompletions);
        case FileType.bgm:
            return getCompletion(fileName, audioBgmCompletions);
        case FileType.bgs:
            return getCompletion(fileName, audioBgsCompletions);
        case FileType.dubs:
            return getCompletion(fileName, audioDubsCompletions);
        case FileType.se:
            return getCompletion(fileName, audioSECompletions);
        case FileType.video:
            return getCompletion(fileName, videoCompletions);
        case FileType.script:
            return getCompletion(fileName, scriptCompletions);
        default:
            return undefined;
    }
}

export function getLastIndexOfDelimiter(src: string, position: number) {
    let ret = -1;

    for (let i = 0; i < delimiter.length; i++) {
        let index = src.lastIndexOf(delimiter[i], position);
        if (index > -1) {
            ret = Math.max(ret, index);
        }
    }

    return ret;
}

export function getIndexOfDelimiter(src: string, position: number) {
    let ret = src.length;

    for (let i = 0; i < delimiter.length; i++) {
        let index = src.indexOf(delimiter[i], position);
        if (index > -1) {
            ret = Math.min(ret, index);
        }
    }

    return ret;
}

// position: position to start search
export function getParamAtPosition(src: string, position: number) {
    let start = getLastIndexOfDelimiter(src, position);
    let end = getIndexOfDelimiter(src, position);

    if (start === -1 || end === -1) {
        return undefined;
    }
    return src.substring(start + 1, end);
}

export function getSubStrings(src: string, delimiters: string[]) {
    let subStr: string[] = [];

    let start = -1;
    let end = -1;

    let lastChar = src[src.length - 1];

    if (!delimiters.includes(lastChar)) {
        src = src + delimiters[0];
    }

    for (let i = 0; i < src.length; i++) {
        for (let j = 0; j < delimiters.length; j++) {
            if (src[i] === delimiters[j]
                || i === src.length - 1) {
                start = end;
                end = i;

                subStr.push(src.substring(start + 1, end));
            }
        }
    }

    subStr.pop();

    return subStr;
}

export function getAllParams(src: string) {
    if ((src.match(beginRegex) !== null) || (src.match(endRegex) !== null)) {
        let appendDelimiter = delimiter.concat([' ']);

        return getSubStrings(src, appendDelimiter);
    }

    return getSubStrings(src, delimiter);
}

// position: Nth param
export function getNthParam(src: string, position: number) {
    let count = 0;
    let start = 0;
    let end = 0;

    let lastChar = src[src.length - 1];

    if (!delimiter.includes(lastChar)) {
        src = src + delimiter[0];
    }

    for (let i = 0; i < src.length; i++) {
        for (let j = 0; j < delimiter.length; j++) {
            if (src[i] === delimiter[j]) {
                start = end;
                end = i;

                if (count === position) {
                    return src.substring(start + 1, end);
                }

                count++;
            }
        }
    }

    return undefined;
}

export function getNumberOfParam(src: string, countLast: boolean = false): number {
    let count = 0;

    for (let i = 0; i < src.length; i++) {
        if (delimiter.includes(src[i])) {
            count++;
        }
    }

    if (!countLast
        && delimiter.includes(src[src.length - 1])) {
        count--;
    }

    return count;
}

export function lineIncludeDelimiter(src: string): boolean {
    for (let i = 0; i < src.length; i++) {
        if (delimiter.includes(src[i])) {
            return true;
        }
    }

    return false;
}

export function lineValidForCommandCompletion(src: string): boolean {
    let include = lineIncludeDelimiter(src);
    let startWith = (src.startsWith("@") || src.startsWith("#"));
    let endWith = (src.endsWith("@") || src.endsWith("#"));

    if (include) {
        return false;
    }

    if (startWith) {
        const noPrefix = src.substring(1);

        if (noPrefix.includes("@") || noPrefix.includes("#")) {
            return false;
        }

        return true;
    }

    return false;
}

export function getCommentList(item: string, commentList: docList): string[] | undefined {
    return commentList.getValue(item);
}

export function getCompletionItem(item: string, commentList: docList) {
    let itemCompletion = new vscode.CompletionItem(item, vscode.CompletionItemKind.Method);

    itemCompletion.detail = "说明";
    itemCompletion.documentation = new vscode.MarkdownString();

    let comment = getCommentList(item, commentList);

    if (comment === undefined) {
        itemCompletion.documentation.appendMarkdown("该项暂无说明");
    } else {
        for (let j = 0; j < comment.length; j++) {
            itemCompletion.documentation.appendMarkdown(comment[j] + "\n\n");
        }
    }

    return itemCompletion;
}

export function getCompletionItemList(src: string[], commentList: docList) {
    let ret: vscode.CompletionItem[] = [];

    for (let i = 0; i < src.length; i++) {
        let completionItem = getCompletionItem(src[i], commentList);

        if (completionItem === undefined) {
            continue;
        }

        if (deprecatedKeywordList.hasValue(src[i])
            || internalKeywordList.hasValue(src[i])) {
            completionItem.tags = [vscode.CompletionItemTag.Deprecated];
        }

        ret.push(completionItem);
    }

    return ret;
}

export function getHoverContents(item: string, commentList: docList) {
    let ret: vscode.MarkdownString[] = [];
    let comment = getCommentList(item, commentList);

    if (comment === undefined) {
        ret.push(new vscode.MarkdownString("该项暂无说明"));
    } else {
        for (let j = 0; j < comment.length; j++) {
            ret.push(new vscode.MarkdownString(comment[j]));
        }
    }

    return ret;
}

export enum FileType {
    inValid,

    fx,
    characters,
    ui,
    cg,
    patternFade,

    bgm,
    bgs,
    dubs,
    se,

    video,

    script,
    frame,
    label,
};

export const fileTypeMap = new Map<number, string>([
    [FileType.inValid, "无效"],
    [FileType.fx, "特效"],
    [FileType.characters, "人物立绘"],
    [FileType.ui, "UI"],
    [FileType.cg, "CG"],
    [FileType.patternFade, "过渡纹理"],
    [FileType.bgm, "BGM"],
    [FileType.bgs, "BGS"],
    [FileType.dubs, "语音"],
    [FileType.se, "音效"],
    [FileType.video, "视频"],
    [FileType.script, "脚本"],
    [FileType.frame, "场景"],
    [FileType.label, "标签"],
]);

export function getType(linePrefix: string, getCommand: boolean = false) {
    const params = getAllParams(linePrefix);
    const prefix = params[0][0];
    const command = params[0].substring(1);

    // update pos by checking if in param (not end by delimiter)
    let inParam = true;
    let lastChar = linePrefix[linePrefix.length - 1];

    for (let deli of delimiter) {
        if (lastChar === deli) {
            inParam = false;
        }
    }

    const paramNum = params.length - 1
        - (inParam ? 1 : 0);

    do {
        let commandInfo = commandInfoList.getValue(command);

        if (commandInfo === undefined) {
            break;
        }

        let inlayHintType = commandInfo.inlayHintType;

        if (inlayHintType === undefined) {
            break;
        }

        if (paramNum > inlayHintType.length) {
            break;
        }

        let paramType = inlayHintType[paramNum];

        if (paramType === undefined) {
            break;
        }

        switch (paramType) {
            case InlayHintType.CharacterFileName:
                return FileType.characters;
            case InlayHintType.DiaFileName:
                return FileType.ui;
            case InlayHintType.NameFileName:
                return FileType.ui;
            case InlayHintType.CGFileName:
                return FileType.cg;
            case InlayHintType.PatternFadeFileName:
                return FileType.patternFade;
            case InlayHintType.BGMFileName:
                return FileType.bgm;
            case InlayHintType.BGSFileName:
                return FileType.bgs;
            case InlayHintType.DubFileName:
                return FileType.dubs;
            case InlayHintType.SEFileName:
                return FileType.se;
            case InlayHintType.VideoFileName:
                return FileType.video;
            case InlayHintType.Chapter:
                return FileType.script;
            case InlayHintType.Frame:
                return FileType.frame;
            case InlayHintType.Label:
                return FileType.label;

            default:
                return FileType.inValid;

        }
    } while (0);

    return FileType.inValid;
}

export function getCommandType(command: string) {
    return getType(command, false);
}

export function getFilePath(linePrefix: string, fileName: string) {
    let filePath = getFileCompletionByType(getType(linePrefix), fileName)?.sortText;

    return filePath;
}

export function getUri(linePrefix: string, fileName: string) {
    let filePath = getFilePath(linePrefix, fileName);

    if (filePath === undefined) {
        return undefined;
    }

    return vscode.Uri.file(filePath);
};

export function getFileNameByType(type: FileType, fileName: string) {
    return getFileCompletionByType(type, fileName)?.insertText;
}

export function fileExists(type: FileType, fileName: string) {
    // return getFileNameByType(type, fileName) !== undefined;
    let filePath = getFullFileNameByType(type, fileName);

    if (filePath === undefined) {
        return false;
    }

    return fileListHasItem(filePath);
}

export function currentLineNotComment(document: vscode.TextDocument, position: vscode.Position)
    : undefined[] | [string, number, string, number, string] {
    const curLine = position.line;
    let curText = "";
    let curStart = 0;

    iterateLines(document, (text, lineNumber
        , lineStart, lineEnd
        , firstLineNotComment) => {
        if (lineNumber === curLine) {
            // curText = text.toLowerCase();
            curText = text;
            curStart = lineStart;
        }
    });

    if (curText === "") {
        return [undefined, undefined, undefined, undefined];
    }

    let curPos = position.character - curStart!;
    let curLinePrefix: string = curText.substring(0, curPos).trim().toLowerCase();

    return [curText.toLowerCase(), curStart, curLinePrefix, curPos, curText];
}

// usage
// const { params, commandWithPrefix, command, paramInfo } = parseCommand(textNoComment);

// if (paramInfo === undefined) {
//     return;
// }

export function parseCommand(line: string) {
    const params = getAllParams(line);

    const commandWithPrefix = params[0];
    const command = commandWithPrefix.substring(1);

    const paramInfo = commandInfoList.getValue(command);

    return { params, commandWithPrefix, command, paramInfo };
}

export interface ImageSize {
    width: number,
    height: number,
}

export function imageStretched(originSize: ImageSize, targetSize: ImageSize, tolerance: number = 0.01) {
    let sizeValidity = (size: ImageSize) => {
        let valueValidity = (num: number) => {
            const result = num !== 0 && num !== Infinity;

            return num !== 0 && num !== Infinity;
        };

        return valueValidity(size.width) && valueValidity(size.height);
    };

    if (!sizeValidity(originSize) || !sizeValidity(targetSize)) {
        return false;
    }

    const originRatio = originSize.width / originSize.height;
    const targetRatio = targetSize.width / targetSize.height;

    const diff = originRatio - targetRatio;

    return Math.abs(diff) > tolerance;
}