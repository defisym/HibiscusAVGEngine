/* eslint-disable @typescript-eslint/naming-convention */

import { DubInfo } from "../functions/command";
import { markdownParser, markDown_getLink, markDown_getMarkDownLevel, markDown_linkEscape, markDown_newLine } from "./_mdToHtml";
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

    // char title
    const charListTitle = 'Character List';
    let charList = markDown_getMarkDownLevel(2)
        + charListTitle
        + markDown_newLine;

    const charListAppend = ',\t\t\t\t\t\t\t\t';
    const charListWidth = 8;
    let charListCount = 0;

    const charListTitleLink = markDown_linkEscape(charListTitle);

    dubMap.forEach((value: DubInfo[], key: string) => {
        let checkInternal = (info: DubInfo) => {
            let name = key !== narrator
                ? info.dialogueStruct.m_name
                : narrator;
            let internalName = key !== narrator
                ? info.dialogueStruct.m_namePartRaw
                : narrator;

            // console.log(name, internalName);

            // if (internalName !== name) {
            //     console.log("diff");
            // }

            return (internalName !== name
                ? 'internal name: ' + '\`' + internalName + '\`' + ' '
                : '');
        };

        let oldInternal: undefined | string = undefined;
        let bInternalChanged = false;

        for (const info of value) {
            let internalName = key !== narrator
                ? info.dialogueStruct.m_namePartRaw
                : narrator;

            if (oldInternal === undefined) {
                oldInternal = internalName;
            }

            if (oldInternal !== internalName) {
                bInternalChanged = true;

                break;
            }
        }

        let wordCount = 0;
        let diaContent = '';

        let infoIndex = 0;
        let curScript = '';

        // chapter title
        const chapterListTitle = 'Chapter List';
        let chapterList = markDown_getMarkDownLevel(3)
            + chapterListTitle
            + markDown_newLine;

        const chapterListAppend = ',\t\t\t\t\t\t\t\t';
        const chapterListWidth = 5;
        let chapterListCount = 0;

        const chapterListTitleLink = markDown_linkEscape(chapterListTitle);

        let chapterContent = '';

        for (const info of value) {
            if (curScript !== info.script) {
                curScript = info.script;
                infoIndex = 0;

                // update chapter title link
                const curScriptCrop = curScript.substring(curScript.length - 4).iCmp('.asc')
                    ? curScript.substring(0, curScript.length - 4)
                    : curScript;

                let chapterTitle = 'Script ' + curScriptCrop;

                const chapterLink = markDown_linkEscape('↩ ' + chapterTitle);
                chapterList += markDown_getLink(curScriptCrop, '#' + chapterLink.toLowerCase());
                chapterListCount++;

                if (chapterListCount >= chapterListWidth) {
                    chapterList += markDown_newLine;
                    chapterListCount = 0;
                } else {
                    chapterList += chapterListAppend;
                }

                chapterTitle = markDown_getLink('↩', '#' + chapterListTitleLink.toLowerCase())
                    + ' '
                    + chapterTitle;

                chapterContent += markDown_getMarkDownLevel(3)
                    + chapterTitle;
                chapterContent += markDown_newLine;
            }

            const dia = info.dialogueStruct.m_dialoguePart;
            wordCount += dia.length;

            if (bInternalChanged) {
                let internal = checkInternal(info);

                chapterContent += internal !== ''
                    ? markDown_getMarkDownLevel(3) + internal
                    : '';
                chapterContent += markDown_newLine;
            }

            chapterContent += markDown_getLink('↪'
                , info.uri + '#' + info.line.toString())
                + ' '
                + infoIndex.toString().padStart(Math.max(4, value.length.toString().length), '0')
                + ' '
                + dia;
            chapterContent += markDown_newLine;

            infoIndex++;
        }

        diaContent += chapterList.substring(0, chapterList.length - chapterListAppend.length)
            + markDown_newLine
            + chapterContent;

        const templateInfo = value[0];

        let name = key !== narrator
            ? templateInfo.dialogueStruct.m_name
            : narrator;
        // let internalName = key !== narrator
        //     ? templateInfo.dialogueStruct.m_namePartRaw
        //     : narrator;

        // update char title link
        let charTitle = name + ': '
            // + checkInternal(templateInfo)
            + value.length.toString() + ' lines'
            + ', '
            + wordCount.toString() + ' words';

        const charTitleLink = markDown_linkEscape('↩ ' + charTitle);

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