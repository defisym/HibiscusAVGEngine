import * as vscode from 'vscode';

import { graphicCharactersCompletions, graphicUICompletions, graphicCGCompletions, graphicPatternFadeCompletions, audioBgmCompletions, audioBgsCompletions, audioDubsCompletions, audioSECompletions, videoCompletions, scriptCompletions, getFullFileNameByType, fileListHasItem, graphicFXCompletions, getCorrectPathAndType, projectConfig, audioBgmPath, audioBgsPath, audioDubsPath, audioSEPath, getFullFilePath, graphicCGPath, graphicCharactersPath, graphicPatternFadePath, graphicUIPath, scriptPath, videoPath } from '../functions/file';
import { commandInfoList, deprecatedKeywordList, docList, InlayHintType, internalKeywordList } from './dict';
import { regexNumber } from './regExp';

const delimiter = ['=', ':'];

declare global {
    interface Array<T> {
        empty(): boolean;
    }
}

Array.prototype.empty = function () {
    return this.length === 0;
};

declare global {
    interface String {
        replaceAt(index: number, replacement: string): string;
        replaceRange(start: number, end: number, replacement: string): string;
        replaceRanges(ranges: [number, number][], replacement: string): string;
    }
}

String.prototype.replaceAt = function (index: number, replacement: string) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
};

String.prototype.replaceRange = function (start: number, end: number, replacement: string) {
    return this.substring(0, start) + replacement + this.substring(end + 1);
};

String.prototype.replaceRanges = function (ranges: [number, number][], replacement: string) {
    let ret: string = '';
    let subRanges: number[] = [];

    subRanges.push(-1);

    for (const [start, end] of ranges) {
        subRanges.push(start);
        subRanges.push(end);
    }

    subRanges.push(-1);

    for (let i = 0; i < subRanges.length / 2; i++) {
        const start = subRanges[i * 2] + 1;
        const end = subRanges[i * 2 + 1];

        if (end !== -1) {
            ret += this.substring(start, end);
        } else {
            ret += this.substring(start);
        }
    }

    return ret;
};

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

    //return (!include) && (!startWith);
    return (!include);
}

export function iterateArray<T>(array: T[]) {
    for (let i = 0; i < array.length; i++) {
        let watch = array[i];
    }
}

export function arrayHasValue(item: number, array: number[]): boolean;
export function arrayHasValue(item: string, array: string[]): boolean;
export function arrayHasValue(item: string | number, array: (string | number)[]): boolean {
    for (let i in array) {
        if(i === "empty"){
            continue;
        }
        
        if (typeof item !== (typeof array[i])) {
            return false;
        }

        if (typeof item === "string") {
            if ((<typeof item>array[i]).toLowerCase() === item.toLowerCase()) {
                return true;
            }
        }

        else if (array[i] === item) {
            return true;
        }
    }

    return false;
}

// always return the element position in array
export function arrayUniquePush<T>(array: T[], elementToPush: T) {
    return arrayUniquePushIf(array, elementToPush, (l: T, r: T) => {
        return l === r;
    });
};

export function arrayUniquePushIf<T>(array: T[], elementToPush: T
    , cmp: (l: T, r: T) => boolean) {
    let elementPosition = arrayFindIf(array, elementToPush, cmp);

    if (elementPosition === -1) {
        return array.push(elementToPush) - 1;
    } else {
        return elementPosition;
    }

};

export function arrayFindIf<T>(array: T[], elementToPush: T
    , cmp: (l: T, r: T) => boolean) {
    let elementPosition = -1;

    for (let i = 0; i < array.length; i++) {
        const element = array[i];

        if (cmp(element, elementToPush)) {
            elementPosition = i;

            break;
        }
    }

    return elementPosition;
};

export function getMapValue<V>(item: string, map: Map<string, V>): V | undefined {
    let ret: V | undefined = undefined;

    if (map === undefined || item === undefined) {
        return undefined;
    }

    map.forEach((value, key) => {
        if(key === undefined){
            return;
        }

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

        if (arrayHasValue(src[i], deprecatedKeywordList)
            || arrayHasValue(src[i], internalKeywordList)) {
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
        let commandInfo = getMapValue(command, commandInfoList);

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

export function matchEntire(src: string, regex: RegExp) {
    let match = src.match(regex);

    if (match === null) {
        return false;
    }

    return match[0] === src;
}

export function strIsNum(src: string) {
    return matchEntire(src, regexNumber);
}

// iterateLines(document, (text, lineNumber
//     , lineStart, lineEnd
//     , firstLineNotComment) => {

//     });

export function iterateLines(document: vscode.TextDocument
    , callBack: (text: string, lineNum: number
        , lineStart: number, lineEnd: number
        , firstLineNotComment: number) => void) {
    let inComment: boolean = false;

    let beginRegex = /^#Begin/gi;
    let endRegex = /^#End/gi;
    let labelRegex = /^;.*/gi;
    let keyWordRegex = /^(((#CreateSwitch|#Call|#CMP|@SetBattleScript).*)|(.*JMP.*)|(#SkipAnchor|#Ret|#StopFF|#StopFastForward))/gi;

    let commentRegex = /(\/\/.*)|(\(.*)|(\/\*(?!\*\/)[^\*\/]*)|((?!\/\*)[^\/\*]*\*\/)/gi;

    // line starts with // ( /*
    // remove back
    let commentRegexRepBack = /(\/\/.*)|(\(.*)|(\/\*(?!\*\/)[^\*\/]*)/gi;
    // line starts with ...*/
    // remove beginning
    let commentRegexRepFront = /((?!\/\*)[^\/\*]*\*\/)/gi;

    let firstLineNotComment: number | undefined = undefined;

    for (let i = 0; i < document.lineCount; ++i) {
        const line = document.lineAt(i);

        if (!line.isEmptyOrWhitespace) {
            const text = line.text.trim();
            let textRemoveBack = text.replace(commentRegexRepBack, "").trim();
            let textRemoveFront = text;

            let textNoComment = textRemoveBack;

            // TODO ABC /* */ ACB
            if (inComment
                && text.match(commentRegexRepFront)) {
                inComment = false;
                textRemoveFront = text.replace(commentRegexRepFront, "").trim();
                textNoComment = textRemoveBack.replace(commentRegexRepFront, "").trim();
            }

            if (!inComment
                && textNoComment.length > 0) {
                const lineStart: number = line.firstNonWhitespaceCharacterIndex
                    + text.length - textRemoveFront.length;
                const lineEnd: number = lineStart + textNoComment.length;

                if (firstLineNotComment === undefined) {
                    firstLineNotComment = i;
                }

                callBack(textNoComment, i
                    , lineStart, lineEnd
                    , firstLineNotComment);
            }

            if (!inComment
                && !text.match(/\*\//gi)
                && text.match(/\/\*/gi)) {
                inComment = true;;
            }
        }
    }
}

export function currentLineNotComment(document: vscode.TextDocument, position: vscode.Position): undefined[] | [string, number, string, number, string] {
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

export async function iterateScripts(
    newScriptCallback: (script: string, document: vscode.TextDocument) => void
    , paramCallback: (initScript: string
        , script: string, lineNumber: number
        , currentType: InlayHintType, currentParam: string) => void) {
    // get settings
    do {
        await sleep(50);
    } while (projectConfig === undefined);

    let initSettings: string = projectConfig.System.Initial_AVG;
    let initScript = initSettings.substring(initSettings.lastIndexOf('\\') + 1);

    // generate ref list
    let scripts: string[] = [initScript];
    let scannedScripts: string[] = [];

    let praseScript = async (scripts: string[]) => {
        let referredScripts: string[] = [];

        for (let script of scripts) {
            let filePath = scriptPath + '\\' + script;

            if (filePath.substring(filePath.length - 4).toLowerCase() !== '.asc') {
                filePath += '.asc';
            }

            let document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));

            newScriptCallback(script, document);

            iterateLines(document, (text, lineNumber
                , lineStart, lineEnd
                , firstLineNotComment) => {
                const params = getAllParams(text);
                const command = params[0].substring(1);

                let commandInfo = getMapValue(command, commandInfoList);

                if (commandInfo === undefined) {
                    return;
                }

                let inlayHintType = commandInfo.inlayHintType;

                if (inlayHintType === undefined) {
                    return;
                }

                const itNum = Math.min(inlayHintType.length, params.length - 1);

                for (let i = 0; i < itNum; i++) {
                    const currentType = inlayHintType[i];
                    let currentParam = params[i + 1];

                    if (currentType === InlayHintType.Chapter
                        && !arrayHasValue(currentParam, scannedScripts)) {
                        scannedScripts.push(currentParam);
                        referredScripts.push(currentParam);
                    }

                    paramCallback(initScript
                        , script, lineNumber
                        , currentType, currentParam);
                }
            });
        }

        if (referredScripts.length === 0) {
            return;
        } else {
            await praseScript(referredScripts);
        }
    };

    await praseScript(scripts);
}