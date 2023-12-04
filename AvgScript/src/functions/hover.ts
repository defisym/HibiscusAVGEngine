import * as vscode from 'vscode';

import { currentLineNotComment } from '../lib/comment';
import { AppendType, currentLineDialogue, parseDialogue } from '../lib/dialogue';
import {
	commandDocList, dialogueTextElement, docList, langDocList, narratorTextElement, narratorTextPlain, normalTextDoc, settingsParamDocList
} from '../lib/dict';
import { langFilter } from '../lib/regExp';
import { getAllParams, getCommandParamFileType, getParamAtPosition } from '../lib/utilities';
import { FileType, fileListInitialized, getFileCompletionByType } from './file';
import { getLabelComment } from './label';

export const hover = vscode.languages.registerHoverProvider('AvgScript', {
	provideHover(document, position, token) {
		let range = document.getWordRangeAtPosition(position);

		if (!range) {
			return undefined;
		}

		const parseCommentResult = currentLineNotComment(document, position);

		if (parseCommentResult === undefined) {
			return undefined;
		}

		let { line, lineStart, linePrefix, curPos, lineRaw, langPrefixLength } = parseCommentResult;

		let word: string = document.getText(range).toLowerCase();
		const lineLower = line.toLowerCase();
		// settings		
		if (line.matchStart(/#Settings/gi)) {
			return new vscode.Hover(getHoverContents(word, settingsParamDocList));
		}

		// language prefix
		const array = [...lineRaw.matchAll(langFilter)];

		if (array.length !== 0 && curPos + langPrefixLength <= array[0][1].length) {
			return new vscode.Hover(getHoverContents(word, langDocList));
		}

		// normal text
		if (currentLineDialogue(line)) {
			const dialogueStruct = parseDialogue(line);

			// script
			let curLine = `### 当前行(无格式)为{$Type}
            
            {$Element}
            `;

			const typeText = dialogueStruct.m_bDialogue ? '对白' : '旁白';
			const appendTypeText = dialogueStruct.m_appendType !== AppendType.none
				? (dialogueStruct.m_appendType === AppendType.sameLine ? '同行桥接' : '换行桥接')
				: typeText;

			let elementText = dialogueStruct.m_bDialogue
				? dialogueTextElement
				: dialogueStruct.m_bNoNamePart
					? narratorTextPlain
					: narratorTextElement;

			let outPutText = (str: string) => {
				return str === ''
					? '无'
					: str;
			};

			elementText = elementText.replace('{$Name}', outPutText(dialogueStruct.m_name));
			elementText = elementText.replace('{$HeadHint}', outPutText(dialogueStruct.m_headHint));
			elementText = elementText.replace('{$DubHint}', outPutText(dialogueStruct.m_dubHint));
			elementText = elementText.replace('{$Dialogue}', dialogueStruct.m_dialoguePart);

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

		const parseCommentResult = currentLineNotComment(document, position);

		if (parseCommentResult === undefined) {
			return undefined;
		}

		let { line, lineStart, linePrefix, curPos } = parseCommentResult;

		let fileName = getParamAtPosition(line, curPos!);

		if (fileName === undefined) {
			return undefined;
		}

		const type = getCommandParamFileType(linePrefix!);

		switch (type) {
			case FileType.frame:
			case FileType.label:
				return new vscode.Hover(new vscode.MarkdownString(getLabelComment(document, fileName)));
			default:
				const fileCompletion = getFileCompletionByType(type, fileName);
				if (fileCompletion === undefined) { return undefined; }

				const doc = fileCompletion.documentation;

				return doc !== undefined
					? new vscode.Hover(doc)
					: undefined;
		}
	}
});

function getHoverContents(item: string, commentList: docList) {
	let ret: vscode.MarkdownString[] = [];
	let comment = commentList.getValue(item);

	if (comment === undefined) {
		ret.push(new vscode.MarkdownString("该项暂无说明"));
	} else {
		for (let j = 0; j < comment.length; j++) {
			ret.push(new vscode.MarkdownString(comment[j]));
		}
	}

	return ret;
}
