import * as vscode from 'vscode';

import * as mm from 'music-metadata';
import { pinyin } from 'pinyin-pro';
import { ImageProbe } from '@zerodeps/image-probe';

import { currentLineNotComment, getBuffer, getParamAtPosition, getUri } from '../lib/utilities';
import { confBasePath } from './command';

// file
// Get full file path in Node.js
// https://stackoverflow.com/questions/31317007/get-full-file-path-in-node-js
// https://nodejs.org/api/path.html#pathresolvepaths
import path = require("path");

// state
export let fileListInitialized = false;

// settings
export let currentLocalCode: string;
export let currentLocalCodeDefinition: any;
export let currentLocalCodeDisplay: string;

// paths
export let basePath: string;

export let graphic: string;

export let graphicFXPath: string;
export let graphicCGPath: string;
export let graphicUIPath: string;
export let graphicPatternFadePath: string;
export let graphicCharactersPath: string;

// completion
export let graphicFXCompletions: vscode.CompletionItem[] = [];
export let graphicCGCompletions: vscode.CompletionItem[] = [];
export let graphicUICompletions: vscode.CompletionItem[] = [];
export let graphicPatternFadeCompletions: vscode.CompletionItem[] = [];
export let graphicCharactersCompletions: vscode.CompletionItem[] = [];

export let audio: string;

export let audioBgmPath: string;
export let audioBgsPath: string;
export let audioDubsPath: string;
export let audioSEPath: string;

export enum CompletionType { image, audio, video, script };

export let audioBgmCompletions: vscode.CompletionItem[] = [];
export let audioBgsCompletions: vscode.CompletionItem[] = [];
export let audioDubsCompletions: vscode.CompletionItem[] = [];
export let audioSECompletions: vscode.CompletionItem[] = [];

export let videoPath: string;

export let videoCompletions: vscode.CompletionItem[] = [];

export let scriptPath: string;

export let scriptCompletions: vscode.CompletionItem[] = [];

// preview
const nonePreview = "暂无预览";

// const imagePreview = "<div><img src =\"{$FILENAME}\" width = \"300\"/></div>";
const imagePreview = "<div align=\"center\"><img src =\"{$FILENAME}\" height = \"160\"/></div>";
const audioPreview = nonePreview;
const videoPreview = nonePreview;
const scriptPreview = nonePreview;

export async function getFileInfo(filePath: string, type: CompletionType) {
    let getDuration = (duration: number) => {
        let minutes = Math.floor(duration / 60);
        let seconds = Math.floor(duration % 60);

        return "Duration: `"
            + minutes.toString() + ":"
            + (seconds < 10 ? "0" + seconds.toString() : seconds.toString()) + "`";
    };

    try {
        switch (type) {
            case CompletionType.image:
                const data = ImageProbe.fromBuffer(await getBuffer(filePath));

                if (data === undefined) {
                    throw new Error("ImageProbe.fromBuffer() failed");
                }

                return "Width: `" + data.width.toString() + "` Height: `" + data.height.toString() + "`";
            case CompletionType.audio:
                const metadata = await mm.parseBuffer(await getBuffer(filePath));

                return "`" + (metadata.format.sampleRate! / 1000).toFixed(1) + "KHz`\t"
                    + "`" + (metadata.format.bitrate! / 1000).toFixed() + "kbps`\t"
                    + getDuration(metadata.format.duration!);
            case CompletionType.video:
                const ffprobe = require('ffprobe');
                const ffprobeStatic = require('ffprobe-static');

                let info = (await ffprobe(filePath, { path: ffprobeStatic.path })).streams[0];

                return "Width: `" + info.width.toString() + "` Height: `" + info.height.toString() + "`\t"
                    + getDuration(info.duration!);
            case CompletionType.script:
                const commentRegex = new RegExp("(\\/\\*(.|[\r\n])*?\\*\\/)|(\\/\\/[^\r\n]*)|(\\([^\r\n]*)|Lang\\[(?!" + currentLocalCode + ").*\\].*", "gi");
                const blankRegex = new RegExp(";.*|\s*$|#begin.*|#end.*", "gi");
                const string = (await getBuffer(filePath)).toString('utf-8').replace(commentRegex, "");
                const lines = string.split('\r\n');

                for (let i in lines) {
                    let line = lines[i].trim().replace(blankRegex, "");

                    if (line.length > 0
                        && !line.startsWith("#")
                        && !line.startsWith("@")) {
                        return "\n\n" + line;
                    }
                }
        }
    }
    catch (err) {
        console.log(filePath);
        console.log(err);

        return undefined;
    }
}

export async function getFileComment(previewStr: string
    , fileName: string | undefined
    , filePath: string
    , type: CompletionType) {
    let preview: vscode.MarkdownString | undefined = undefined;

    if (fileName === undefined) {
        preview = new vscode.MarkdownString("文件不存在");
    } else {
        previewStr = previewStr.replace('{$FILENAME}', fileName);
        filePath = filePath.replace('{$FILENAME}', fileName);

        let stat = await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
        let size = stat.size / (1024);

        preview = new vscode.MarkdownString(fileName);
        preview.appendMarkdown("\n\n" + "Size: `" + size.toFixed(2) + " KB`"
            + "\tModified: `" + new Date(stat.mtime).toUTCString() + "`\t");

        let detail = await getFileInfo(filePath, type);
        if (detail !== undefined) {
            preview.appendMarkdown(detail);
        }

        preview.appendMarkdown("\n\n");
        preview.appendMarkdown(previewStr);

        preview.baseUri = vscode.Uri.file(filePath);
        preview.supportHtml = true;
    }

    return preview;
}

export async function getFileList(uri: vscode.Uri) {
    return vscode.workspace.fs.readDirectory(uri);
}

export async function getFileListRecursively(filePath: string) {
    let fileList: [string, vscode.FileType][] = [];
    await getFileListRecursivelyFunc(filePath, fileList);

    return fileList;
}

export async function getFileListRecursivelyFunc(filePath: string, fileList: [string, vscode.FileType][]) {
    let uri = vscode.Uri.file(filePath);
    let result: [string, vscode.FileType][] = await getFileList(uri);
    let promiseList: Promise<void>[] = [];

    for (let i in result) {
        let fileName = result[i][0];
        let type = result[i][1];

        if (type === vscode.FileType.Directory) {
            promiseList.push(new Promise(async (resolve, reject) => {
                let subFilePath = filePath + "\\" + fileName;
                await getFileListRecursivelyFunc(subFilePath, fileList);

                resolve();
            }));
        } else if (type === vscode.FileType.File) {
            fileList.push([filePath + "\\" + fileName, type]);
        }
    }

    await Promise.all(promiseList);
}

export function updateBasePath(newPath: string) {
    basePath = newPath;
}

export async function updateFileList(progress: vscode.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
}>) {
    fileListInitialized = false;

    const total = 100;
    const steps = 27;

    const incrementPerStep = total / steps;

    progress.report({ increment: 0, message: "Updating file list..." });

    basePath = vscode.workspace.getConfiguration().get<string>(confBasePath, "");

    if (basePath === "") {
        return;
    }

    // Update config
    progress.report({ increment: 0, message: "Updating settings..." });

    let iniParser = require('ini');
    let encoding: BufferEncoding = 'utf-8';

    let configPath = basePath + "\\..\\settings\\settings.ini";
    let config = iniParser.parse((await getBuffer(configPath)).toString(encoding));

    progress.report({ increment: incrementPerStep, message: "Updating LocalSettings..." });

    currentLocalCode = config.Display.Language;

    let localizationPath = basePath + "\\..\\localization\\Localization.dat";
    let localization = iniParser.parse((await getBuffer(localizationPath)).toString(encoding));

    currentLocalCodeDefinition = localization.Definition;
    currentLocalCodeDisplay = currentLocalCodeDefinition[
        "LanguageDisplayName_" + currentLocalCode];

    // Update completion list		
    progress.report({ increment: incrementPerStep, message: "Updating graphic fileList..." });

    graphic = basePath + "\\Graphics\\";

    graphicFXPath = graphic + "FX";
    graphicCGPath = graphic + "CG";
    graphicUIPath = graphic + "UI";
    graphicPatternFadePath = graphic + "PatternFade";
    graphicCharactersPath = graphic + "Characters";

    progress.report({ increment: incrementPerStep, message: "Updating FX fileList..." });
    let graphicFX = await getFileListRecursively(graphicFXPath);
    // let graphicFX = await getFileList(vscode.Uri.file(graphicFXPath));
    progress.report({ increment: incrementPerStep, message: "Updating CG fileList..." });
    let graphicCG = await getFileListRecursively(graphicCGPath);
    progress.report({ increment: incrementPerStep, message: "Updating UI fileList..." });
    let graphicUI = await getFileListRecursively(graphicUIPath);
    progress.report({ increment: incrementPerStep, message: "Updating PatternFade fileList..." });
    let graphicPatternFade = await getFileListRecursively(graphicPatternFadePath);
    progress.report({ increment: incrementPerStep, message: "Updating Characters fileList..." });
    let graphicCharacters = await getFileListRecursively(graphicCharactersPath);

    progress.report({ increment: incrementPerStep, message: "Updating audio fileList..." });

    audio = basePath + "\\Audio\\";

    audioBgmPath = audio + "Bgm";
    audioBgsPath = audio + "Bgs";
    audioDubsPath = audio + "Dubs";
    audioSEPath = audio + "SE";

    progress.report({ increment: incrementPerStep, message: "Updating BGM fileList..." });
    let audioBgm = await getFileListRecursively(audioBgmPath);
    progress.report({ increment: incrementPerStep, message: "Updating BGS fileList..." });
    let audioBgs = await getFileListRecursively(audioBgsPath);
    progress.report({ increment: incrementPerStep, message: "Updating Dubs fileList..." });
    let audioDubs = await getFileListRecursively(audioDubsPath);
    progress.report({ increment: incrementPerStep, message: "Updating SE fileList..." });
    let audioSE = await getFileListRecursively(audioSEPath);

    progress.report({ increment: incrementPerStep, message: "Updating video fileList..." });
    videoPath = basePath + "\\Assets\\Movies\\";

    let videoVideo = await getFileListRecursively(videoPath);

    progress.report({ increment: incrementPerStep, message: "Updating script fileList..." });

    scriptPath = basePath + "\\dialogue";
    let script = await getFileListRecursively(scriptPath);

    let generateCompletionList = async (fileList: [string, vscode.FileType][]
        , completions: vscode.CompletionItem[]
        , basePath: string = ""
        , type: CompletionType = CompletionType.image) => {
        if (basePath === "") {
            return;
        }

        let promiseList: Promise<void>[] = [];

        fileList.forEach(async element => {
            if (element[1] === vscode.FileType.File) {
                promiseList.push(new Promise(async (resolve, reject) => {
                    let fileName: string = element[0].substring(element[0].lastIndexOf("\\") + 1);
                    let fileRelativeName: string = element[0].substring(basePath.length + 1);

                    // let fileNameNoSuffix: string = fileName.lastIndexOf(".") === -1 ? fileName : fileName.substring(0, fileName.lastIndexOf("."));
                    let fileNameNoSuffix: string = fileRelativeName.lastIndexOf(".") === -1 ? fileRelativeName : fileRelativeName.substring(0, fileRelativeName.lastIndexOf("."));
                    // let fileNameSuffix: string = fileName.lastIndexOf(".") === -1 ? "" : fileName.substring(fileName.lastIndexOf("."));
                    let fileNameSuffix: string = fileRelativeName.lastIndexOf(".") === -1 ? "" : fileRelativeName.substring(fileRelativeName.lastIndexOf("."));

                    // let filePath: string = basePath + "\\{$FILENAME}";
                    let filePath: string = element[0];

                    let py = pinyin(fileNameNoSuffix
                        , {
                            toneType: 'none',
                            nonZh: 'consecutive'
                        });

                    let romanize: string = require('japanese').romanize(fileNameNoSuffix);

                    let delimiter = "\t\t";
                    let fileNameToEnglish = fileNameNoSuffix + delimiter + py + delimiter + romanize;

                    let item: vscode.CompletionItem = new vscode.CompletionItem({
                        label: fileNameNoSuffix
                        , detail: fileNameSuffix
                        // , description: ".ogg"
                    }
                        , vscode.CompletionItemKind.File);

                    item.insertText = fileRelativeName;
                    item.filterText = fileNameToEnglish;
                    let previewStr: string = nonePreview;
                    let detail: string | undefined = undefined;

                    switch (type) {
                        case CompletionType.image:
                            item.detail = "Image file preview";
                            previewStr = imagePreview;

                            break;
                        case CompletionType.audio:
                            item.detail = "Audio file";
                            previewStr = audioPreview;

                            break;
                        case CompletionType.video:
                            previewStr = videoPreview;
                            item.detail = "Video file";

                            break;
                        case CompletionType.script:
                            item.detail = "Script file";
                            previewStr = scriptPreview;

                            break;
                    }

                    // normal
                    // item.documentation = await getFileComment(previewStr
                    // 	, element[0]
                    // 	, filePath
                    // 	, type);

                    // recursive
                    item.documentation = await getFileComment(previewStr
                        , fileName
                        , filePath
                        , type);

                    // sort based on file path
                    item.sortText = filePath;

                    completions.push(item);

                    resolve();
                }));
            }
        });

        await Promise.all(promiseList);
    };

    progress.report({ increment: incrementPerStep, message: "Generating graphic completionList..." });

    graphicFXCompletions = [];
    graphicCGCompletions = [];
    graphicUICompletions = [];
    graphicPatternFadeCompletions = [];
    graphicCharactersCompletions = [];

    progress.report({ increment: incrementPerStep, message: "Generating FX completionList..." });
    await generateCompletionList(graphicFX, graphicFXCompletions, graphicFXPath);
    progress.report({ increment: incrementPerStep, message: "Generating CG completionList..." });
    await generateCompletionList(graphicCG, graphicCGCompletions, graphicCGPath);
    progress.report({ increment: incrementPerStep, message: "Generating UI completionList..." });
    await generateCompletionList(graphicUI, graphicUICompletions, graphicUIPath);
    progress.report({ increment: incrementPerStep, message: "Generating PatternFade completionList..." });
    await generateCompletionList(graphicPatternFade, graphicPatternFadeCompletions, graphicPatternFadePath);
    progress.report({ increment: incrementPerStep, message: "Generating Characters completionList..." });
    await generateCompletionList(graphicCharacters, graphicCharactersCompletions, graphicCharactersPath);

    progress.report({ increment: incrementPerStep, message: "Generating audio completionList..." });

    audioBgmCompletions = [];
    audioBgsCompletions = [];
    audioDubsCompletions = [];
    audioSECompletions = [];

    progress.report({ increment: incrementPerStep, message: "Generating BGM completionList..." });
    await generateCompletionList(audioBgm, audioBgmCompletions, audioBgmPath, CompletionType.audio);
    progress.report({ increment: incrementPerStep, message: "Generating BGS completionList..." });
    await generateCompletionList(audioBgs, audioBgsCompletions, audioBgsPath, CompletionType.audio);
    progress.report({ increment: incrementPerStep, message: "Generating Dubs completionList..." });
    await generateCompletionList(audioDubs, audioDubsCompletions, audioDubsPath, CompletionType.audio);
    progress.report({ increment: incrementPerStep, message: "Generating SE completionList..." });
    await generateCompletionList(audioSE, audioSECompletions, audioSEPath, CompletionType.audio);

    progress.report({ increment: incrementPerStep, message: "Generating video completionList..." });

    videoCompletions = [];

    await generateCompletionList(videoVideo, videoCompletions, videoPath, CompletionType.video);

    progress.report({ increment: incrementPerStep, message: "Generating script completionList..." });

    scriptCompletions = [];

    await generateCompletionList(script, scriptCompletions, scriptPath, CompletionType.script);

    progress.report({ increment: 0, message: "Done" });

    fileListInitialized = true;
}

export const fileDefinition = vscode.languages.registerDefinitionProvider('AvgScript',
    {
        async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
            let definitions: vscode.Location[] = [];

            let [line, lineStart, linePrefix, curPos] = currentLineNotComment(document, position);

            if (line === undefined) {
                return undefined;
            }

            let fileName = getParamAtPosition(line, curPos!);

            if (fileName === undefined) {
                return undefined;
            }

            const fileUri = getUri(linePrefix!, fileName);

            if (fileUri === undefined) {
                return undefined;
            }

            let link = new vscode.Location(fileUri
                , new vscode.Position(0, 0));

            definitions.push(link);

            return definitions;
        }
    });
