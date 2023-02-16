/* eslint-disable @typescript-eslint/naming-convention */

import { DubInfo } from "../functions/command";
import { markDown_getLink, markDown_getMarkDownLevel, markDown_linkEscape, markDown_newLine, markdownParser } from "./_mdToHtml";
import { onClickLinkScript } from "./_onClickLink";

export const narrator = '旁白';

export function dubList_getWebviewContent(dubMap: Map<string, DubInfo[]>) {
    const pageTemplate = `<!DOCTYPE html>
                        <html lang="en">
                        
                        <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Format Hint</title>
                        </head>
                        
                        <body>
                        {$BODY}
                        </body>`
        + onClickLinkScript
        + `</html>`;

    let markdown = '';

    let title = markDown_getMarkDownLevel(1)
        + 'Dub List'
        + markDown_newLine;

    const charListTitle = 'Character List';
    let charList = markDown_getMarkDownLevel(2)
        + charListTitle
        + markDown_newLine;

    const charListAppend = ',\t\t\t\t\t\t\t\t';
    const charListWidth = 8;
    let charListCount = 0;
    const charListTitleLink = markDown_linkEscape(charListTitle);

    dubMap.forEach((value: DubInfo[], key: string) => {
        const templateInfo = value[0];

        let wordCount = 0;
        let diaContent = '';

        for (const info of value) {
            const dia = info.dialogueStruct.m_dialoguePart;
            wordCount += dia.length;

            // diaContent += dia;
            // diaContent += markDown_getLink(dia
            //     , info.uri + '#' + info.line.toString());
            diaContent += markDown_getLink('↪'
                , info.uri + '#' + info.line.toString())
                + ' '
                + dia;
            diaContent += markDown_newLine;
        }

        let name = key !== narrator
            ? templateInfo.dialogueStruct.m_name
            : narrator;
        let internalName = key !== narrator
            ? templateInfo.dialogueStruct.m_namePartRaw
            : narrator;

        let charTitle = name + ': '
            + (internalName !== name
                ? 'internal name: ' + '\`' + internalName + '\`' + ', '
                : '')
            + value.length.toString() + ' lines'
            + ', '
            + wordCount.toString() + ' words';

        const charTitleLink = markDown_linkEscape('↩ ' + charTitle);

        // charList += markDown_getLink(name, '#' + charTitleLink.toLowerCase())
        //     + markDown_newLine;

        charList += markDown_getLink(name, '#' + charTitleLink.toLowerCase());
        charListCount++;

        if (charListCount >= charListWidth) {
            charList += markDown_newLine;
            charListCount = 0;
        } else {
            charList += charListAppend;
        }

        charTitle = markDown_getLink('↩', '#' + charListTitleLink.toLowerCase())
            + ' '
            + charTitle;

        markdown += markDown_getMarkDownLevel(2)
            + charTitle
            + markDown_newLine;

        markdown += diaContent;
    });

    markdown = title
        + charList.substring(0, charList.length - charListAppend.length) + markDown_newLine
        + markdown;

    const html = markdownParser(markdown);

    let page = pageTemplate.replace('{$BODY}', html);

    return page;
}