import * as vscode from 'vscode';
import { docList } from './dict';

const delimiter = ['=', ':'];

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

export function getParam(src: string, position: number) {
    let start = getLastIndexOfDelimiter(src, position);
    let end = getIndexOfDelimiter(src, position);

    if (start === -1 || end === -1) {
        return undefined;
    }
    return src.substring(start + 1, end);
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

export function getCommentList(item: string, commentList: docList) {
    let comment: string[] = [];

    commentList.forEach((value: string[], key: string) => {
        if (key.toLowerCase() === item.toLowerCase()) {
            comment = value;
        }
    });

    return (comment.length === 0) ? undefined : comment;
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

export function getType(linePrefix: string) {
    const paramNum = getNumberOfParam(linePrefix, true);
    // image
    if (linePrefix.match(/(@Char|@Character|@CC|@CharChange|@CPF|@CPatternFade|@CPFI|@CPatternFadeIn|@CPFO|@CPatternFadeOut|@CharPF|@CharPatternFade)/gi)
        && (paramNum === 1)) {
        return FileType.characters;
    }

    if (linePrefix.match(/(@Dia|@DiaChange|@Name|@NameChange)/gi)
        && (paramNum === 1)) {
        return FileType.ui;
    }

    if (linePrefix.match(/(@Dia|@DiaChange|@Name|@NameChange)/gi)
        && (paramNum === 1)) {
        return FileType.ui;
    }

    if (linePrefix.match(/(@CG|@CGChange|@CGPFI|@CGPatternFadeIn|@CGPFO|@CGPatternFadeOut)/gi)
        && (paramNum === 1)) {
        return FileType.cg;
    }

    if (linePrefix.match(/(@CPF|@CPatternFade|@CPFI|@CPatternFadeIn|@CPFO|@CPatternFadeOut|@CGPFI|@CGPatternFadeIn|@CGPFO|@CGPatternFadeOut|@CharPF|@CharPatternFade)/gi)
        && (paramNum === 2)) {
        return FileType.patternFade;
    }

    if (linePrefix.match(/(@PF|@PatternFade|@PFO|@PatternFadeOut)/gi)
        && (paramNum === 1)) {
        return FileType.patternFade;
    }

    // audio
    if (linePrefix.match(/(@P|@Play)/gi)
        && (paramNum === 1)) {
        return FileType.inValid;
    }

    if (linePrefix.match(/(@BGM|@BgmLoop|@BgmPre|@BgmPreludeLoop)/gi)
        && (paramNum === 1)) {
        return FileType.bgm;
    }

    if (linePrefix.match(/(@Bgs|@BgsLoop)/gi)
        && (paramNum === 1)) {
        return FileType.bgs;
    }

    if (linePrefix.match(/(@Dub|@DubPlay)/gi)
        && (paramNum === 1)) {
        return FileType.dubs;
    }

    if (linePrefix.match(/(@SE)/gi)
        && (paramNum === 1)) {
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