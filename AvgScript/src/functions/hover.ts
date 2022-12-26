import * as vscode from 'vscode';

import { getNumberOfParam, getHoverContents, getType, FileType, getParamAtPosition, currentLineNotComment, getCompletion } from '../lib/utilities';
import {
    commandDocList, settingsParamDocList, langDocList
} from '../lib/dict';
import { getLabelComment } from './label';
import { fileListInitialized, graphicCharactersCompletions, graphicUICompletions, graphicCGCompletions, graphicPatternFadeCompletions, audioBgmCompletions, audioBgsCompletions, audioDubsCompletions, audioSECompletions, videoCompletions, scriptCompletions } from './file';

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

        switch (getType(linePrefix!)) {
            case FileType.characters:
                return new vscode.Hover(getCompletion(fileName, graphicCharactersCompletions)?.documentation!);
            case FileType.ui:
                return new vscode.Hover(getCompletion(fileName, graphicUICompletions)?.documentation!);
            case FileType.cg:
                return new vscode.Hover(getCompletion(fileName, graphicCGCompletions)?.documentation!);
            case FileType.patternFade:
                return new vscode.Hover(getCompletion(fileName, graphicPatternFadeCompletions)?.documentation!);

            case FileType.bgm:
                return new vscode.Hover(getCompletion(fileName, audioBgmCompletions)?.documentation!);
            case FileType.bgs:
                return new vscode.Hover(getCompletion(fileName, audioBgsCompletions)?.documentation!);
            case FileType.dubs:
                return new vscode.Hover(getCompletion(fileName, audioDubsCompletions)?.documentation!);
            case FileType.se:
                return new vscode.Hover(getCompletion(fileName, audioSECompletions)?.documentation!);

            case FileType.video:
                return new vscode.Hover(getCompletion(fileName, videoCompletions)?.documentation!);

            case FileType.script:
                return new vscode.Hover(getCompletion(fileName, scriptCompletions)?.documentation!);
            case FileType.frame:
            case FileType.label:
                return new vscode.Hover(new vscode.MarkdownString(getLabelComment(fileName)));
            default:
                return undefined;
        }

        // let returnHover = async function (previewStr: string
        // 	, fileName: string | undefined
        // 	, filePath: string
        // 	, type: CompletionType) {
        // 	return new vscode.Hover(await getFileComment(previewStr
        // 		, fileName
        // 		, filePath
        // 		, type));
        // };

        // switch (getType(linePrefix!)) {
        // 	case FileType.characters:
        // 		return returnHover(imagePreview
        // 			, getFileName(fileName, graphicCharactersCompletions)
        // 			, graphicCharactersPath + "\\{$FILENAME}"
        // 			, CompletionType.image);
        // 	case FileType.ui:
        // 		return returnHover(imagePreview
        // 			, getFileName(fileName, graphicUICompletions)
        // 			, graphicUIPath + "\\{$FILENAME}"
        // 			, CompletionType.image);
        // 	case FileType.cg:
        // 		return returnHover(imagePreview
        // 			, getFileName(fileName, graphicCGCompletions)
        // 			, graphicCGPath + "\\{$FILENAME}"
        // 			, CompletionType.image);
        // 	case FileType.patternFade:
        // 		return returnHover(imagePreview
        // 			, getFileName(fileName, graphicPatternFadeCompletions)
        // 			, graphicPatternFadePath + "\\{$FILENAME}"
        // 			, CompletionType.image);

        // 	case FileType.bgm:
        // 		return returnHover(audioPreview
        // 			, getFileName(fileName, audioBgmCompletions)
        // 			, audioBgmPath + "\\{$FILENAME}"
        // 			, CompletionType.audio);
        // 	case FileType.bgs:
        // 		return returnHover(audioPreview
        // 			, getFileName(fileName, audioBgsCompletions)
        // 			, audioBgsPath + "\\{$FILENAME}"
        // 			, CompletionType.audio);
        // 	case FileType.dubs:
        // 		return returnHover(audioPreview
        // 			, getFileName(fileName, audioDubsCompletions)
        // 			, audioDubsPath + "\\{$FILENAME}"
        // 			, CompletionType.audio);
        // 	case FileType.se:
        // 		return returnHover(audioPreview
        // 			, getFileName(fileName, audioSECompletions)
        // 			, audioSEPath + "\\{$FILENAME}"
        // 			, CompletionType.audio);

        // 	// case FileType.video:
        // 	case FileType.script:
        // 		return returnHover(audioPreview
        // 			, getFileName(fileName, scriptCompletions)
        // 			, scriptPath + "\\{$FILENAME}"
        // 			, CompletionType.script);
        // 	case FileType.frame:
        // 	case FileType.label:
        // 		return new vscode.Hover(new vscode.MarkdownString(getLabelComment(fileName)));
        // 	default:
        // 		return undefined;
        // }
    }
});