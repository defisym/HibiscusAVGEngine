/* eslint-disable @typescript-eslint/naming-convention */

import { DubInfo } from "../functions/command";
import { markDown_getLink, markDown_getMarkDownLevel, markDown_newLine, markdownParser } from "./_mdToHtml";
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

    let markdown = markDown_getMarkDownLevel(1)
        + 'Dub List'
        + markDown_newLine;

    dubMap.forEach((value: DubInfo[], key: string) => {
        const templateInfo = value[0];

        let wordCount = 0;
        let diaContent = '';

        for (const info of value) {
            const dia = info.dialogueStruct.m_dialoguePart;
            wordCount += dia.length;

            // diaContent += dia;
            diaContent += markDown_getLink(dia
                , info.uri + '#' + info.line.toString());
            diaContent += markDown_newLine;
        }

        let name = key !== narrator
            ? templateInfo.dialogueStruct.m_name
            : narrator;
        let internalName = key !== narrator
            ? templateInfo.dialogueStruct.m_namePartRaw
            : narrator;

        name += ': '
            + (internalName !== name
                ? 'internal name: ' + internalName
                : '')
            + 'line count: ' + value.length.toString()
            + ', '
            + 'word count: ' + diaContent.length.toString();

        markdown += markDown_getMarkDownLevel(2)
            + name
            + markDown_newLine;

        markdown += diaContent;
    });

    const html = markdownParser(markdown);

    let page = pageTemplate.replace('{$BODY}', html);

    return page;
}