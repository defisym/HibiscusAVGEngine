import * as vscode from 'vscode';
import { docList } from './dict';
import { audioBgmCompletions, audioBgmPath, audioBgsCompletions, audioBgsPath, audioDubsCompletions, audioDubsPath, audioSECompletions, audioSEPath, graphicCGCompletions, graphicCGPath, graphicCharactersCompletions, graphicCharactersPath, graphicPatternFadeCompletions, graphicPatternFadePath, graphicUICompletions, graphicUIPath, scriptCompletions, scriptPath } from './../extension';

const delimiter = ['=', ':'];

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

export function getFileName(name: string, fileList: vscode.CompletionItem[]) {
    name = name.toLowerCase();

    for (let i in fileList) {
        let element = fileList[i].insertText?.toString().toLowerCase();

        if (element?.startsWith(name)) {
            return element;
        }
    };

    return undefined;
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

export function getAllParams(src: string) {
    let params: string[] = [];

    let start = -1;
    let end = -1;

    let lastChar = src[src.length - 1];

    if (!delimiter.includes(lastChar)) {
        src = src + delimiter[0];
    }

    for (let i = 0; i < src.length; i++) {
        for (let j = 0; j < delimiter.length; j++) {
            if (src[i] === delimiter[j]
                || i === src.length - 1) {
                start = end;
                end = i;

                params.push(src.substring(start + 1, end));
            }
        }
    }

    params.pop();

    return params;
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

    //return (!include) && (!startWith);
    return (!include);
}

export function getMapValue<V>(item: string, map: Map<string, V>): V | undefined {
    let ret: V | undefined = undefined;

    map.forEach((value, key) => {
        if (key.toLowerCase() === item.toLowerCase()) {
            ret = value;
        }
    });

    return ret;
}

export function getCommentList(item: string, commentList: docList): string[] | undefined {
    return getMapValue<string[]>(item, commentList);
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

export function getType(linePrefix: string, getCommand: boolean = false) {
    const paramNum = getNumberOfParam(linePrefix, true);
    // image
    if (linePrefix.match(/(@Char|@Character|@CC|@CharChange|@CPF|@CPatternFade|@CPFI|@CPatternFadeIn|@CPFO|@CPatternFadeOut|@CharPF|@CharPatternFade)/gi)
        && (getCommand || (paramNum === 1))) {
        return FileType.characters;
    }

    if (linePrefix.match(/(@Dia|@DiaChange|@Name|@NameChange)/gi)
        && (getCommand || (paramNum === 1))) {
        return FileType.ui;
    }

    if (linePrefix.match(/(@Dia|@DiaChange|@Name|@NameChange)/gi)
        && (getCommand || (paramNum === 1))) {
        return FileType.ui;
    }

    if (linePrefix.match(/(@CG|@CGChange|@CGPFI|@CGPatternFadeIn|@CGPFO|@CGPatternFadeOut)/gi)
        && (getCommand || (paramNum === 1))) {
        return FileType.cg;
    }

    if (linePrefix.match(/(@CPF|@CPatternFade|@CPFI|@CPatternFadeIn|@CPFO|@CPatternFadeOut|@CGPFI|@CGPatternFadeIn|@CGPFO|@CGPatternFadeOut|@CharPF|@CharPatternFade)/gi)
        && (getCommand || (paramNum === 2))) {
        return FileType.patternFade;
    }

    if (linePrefix.match(/(@PF|@PatternFade|@PFO|@PatternFadeOut)/gi)
        && (getCommand || (paramNum === 1))) {
        return FileType.patternFade;
    }

    // audio
    if (linePrefix.match(/(@P|@Play)/gi)
        && (getCommand || (paramNum === 1))) {
        return FileType.inValid;
    }

    if (linePrefix.match(/(@BGM|@BgmLoop|@BgmPre|@BgmPreludeLoop)/gi)
        && (getCommand || (paramNum === 1))) {
        return FileType.bgm;
    }

    if (linePrefix.match(/(@Bgs|@BgsLoop)/gi)
        && (getCommand || (paramNum === 1))) {
        return FileType.bgs;
    }

    if (linePrefix.match(/(@Dub|@DubPlay)/gi)
        && (getCommand || (paramNum === 1))) {
        return FileType.dubs;
    }

    if (linePrefix.match(/(@SE)/gi)
        && (getCommand || (paramNum === 1))) {
        return FileType.se;
    }

    if (linePrefix.match(/(@PV|@PlayVideo|@OV|@OpenVideo)/gi)) {
        return FileType.video;
    }

    if (linePrefix.match(/(#CJMP|#JMPCha)/gi)) {
        return FileType.script;
    }

    if (linePrefix.match(/(#FJMP|#JMPFra)/gi)) {
        return FileType.frame;
    }

    if (linePrefix.match(/(#Call|#JMP|#NJMP)/gi)) {
        return FileType.label;
    }

    return FileType.inValid;
}

export function getCommandType(command: string) {
    return getType(command, true);
}

export function getFilePath(linePrefix: string, fileName: string) {
    let realFileName: string | undefined = undefined;
    let filePath: string;

    switch (getType(linePrefix)) {
        case FileType.characters:
            realFileName = getFileName(fileName, graphicCharactersCompletions);
            filePath = graphicCharactersPath + "\\";

            break;
        case FileType.ui:
            realFileName = getFileName(fileName, graphicUICompletions);
            filePath = graphicUIPath + "\\";

            break;
        case FileType.cg:
            realFileName = getFileName(fileName, graphicCGCompletions);
            filePath = graphicCGPath + "\\";

            break;
        case FileType.patternFade:
            realFileName = getFileName(fileName, graphicPatternFadeCompletions);
            filePath = graphicPatternFadePath + "\\";

            break;
        case FileType.bgm:
            realFileName = getFileName(fileName, audioBgmCompletions);
            filePath = audioBgmPath + "\\";

            break;
        case FileType.bgs:
            realFileName = getFileName(fileName, audioBgsCompletions);
            filePath = audioBgsPath + "\\";

            break;
        case FileType.dubs:
            realFileName = getFileName(fileName, audioDubsCompletions);
            filePath = audioDubsPath + "\\";

            break;
        case FileType.se:
            realFileName = getFileName(fileName, audioSECompletions);
            filePath = audioSEPath + "\\";

            break;
        // case FileType.video:
        case FileType.script:
            realFileName = getFileName(fileName, scriptCompletions);
            filePath = scriptPath + "\\";

            break;
        default:
            return undefined;
    }

    if (realFileName === undefined) {
        return undefined;
    }

    return filePath + realFileName;
}

export function getUri(linePrefix: string, fileName: string) {
    let filePath = getFilePath(linePrefix, fileName);

    if (filePath === undefined) {
        return undefined;
    }

    return vscode.Uri.file(filePath);
};

export function getFileNameByType(type: FileType, fileName: string) {
    switch (type) {
        case FileType.characters:
            return getFileName(fileName, graphicCharactersCompletions);
        case FileType.ui:
            return getFileName(fileName, graphicUICompletions);
        case FileType.cg:
            return getFileName(fileName, graphicCGCompletions);
        case FileType.patternFade:
            return getFileName(fileName, graphicPatternFadeCompletions);
        case FileType.bgm:
            return getFileName(fileName, audioBgmCompletions);
        case FileType.bgs:
            return getFileName(fileName, audioBgsCompletions);
        case FileType.dubs:
            return getFileName(fileName, audioDubsCompletions);
        case FileType.se:
            return getFileName(fileName, audioSECompletions);
        // case FileType.video:
        case FileType.script:
            return getFileName(fileName, scriptCompletions);
        default:
            return undefined;
    }
}

export function fileExists(type: FileType, fileName: string) {
    return getFileNameByType(type, fileName) !== undefined;
}

export function matchEntire(src: string, regex: RegExp) {
    let match = src.match(regex);

    if (match === null) {
        return false;
    }

    return match[0] === src;
}

export function strIsNum(src: string) {
    const regexNumber = /\+[0-9]+(.[0-9]+)?|-[0-9]+(.[0-9]+)?|[0-9]+(.[0-9]+)?/gi;
    return matchEntire(src, regexNumber);
}