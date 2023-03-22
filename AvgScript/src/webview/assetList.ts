/* eslint-disable @typescript-eslint/naming-convention */

import * as vscode from 'vscode';

import { RefInfo } from "../functions/command";
import { getFullFileNameByType, nonePreview } from "../functions/file";
import { FileType, fileTypeMap } from "../lib/utilities";
import { html_getHyperLink } from "./_hyperLink";
import { markdownParser, markDown_getMarkDownLevel, markDown_newLine } from './_mdToHtml';
import { onClickLinkScript } from "./_onClickLink";

export function assetList_getWebviewContent(assets: Map<string, RefInfo>, unusedFileList: string[]) {
    const pageTemplate = `<!DOCTYPE html>
                        <html lang="en">
                        
                        <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Asset List</title>
                        </head>
                        
                        <body>
                        {$BODY}
                        </body>`
        + onClickLinkScript
        + `</html>`;


    const tableTemplate = `<!-- <h4>Script: </h4> -->
                            <table border="1">
                            <tr>
                                <th>File Name</th>
                                <th>Preview</th>
                                <th>Ref Count</th>
                                <th>Used As</th>
                                <th>Used At</th>
                            </tr>
                            {$CONTENT}
                            </table>`;
    const lineTemplate = `<tr>
                                <td>{$FileName}</td>
                                <td>{$Preview}</td>
                                <td>{$RefCount}</td>
                                <td>{$UsedAs}</td>
                                <td>{$UsedAt}</td>
                            </tr>`;

    // const imagePreview = `<img src="{$URI}" width="300" />`;
    const imagePreview = `<div align="center"><img src ="{$URI}" width = "300"/></div>`;
    const audioPreview = nonePreview;
    const videoPreview = nonePreview;

    let content = '';

    assets.forEach((value: RefInfo, key: string) => {
        let line = lineTemplate;

        let fileName = value.fileExist
            ? key
            :
            (value.type.includes(FileType.dubs)
                ? `无法推导: <font color="blue"><b>` + key + `</b></font>`
                : `文件不存在: <font color="red"><b>` + key + `</b></font>`
            );

        line = line.replace('{$FileName}', fileName);

        let preview: string = nonePreview;

        if (value.fileExist) {
            switch (value.type[0]) {
                case FileType.fx:
                case FileType.characters:
                case FileType.ui:
                case FileType.cg:
                case FileType.patternFade:
                    preview = imagePreview;

                    break;
                case FileType.bgm:
                case FileType.bgs:
                case FileType.dubs:
                case FileType.se:
                    preview = audioPreview;

                    break;
                case FileType.video:
                    preview = videoPreview;

                    break;
                case FileType.script:
                    preview = nonePreview;

                    break;
                default:
                    preview = nonePreview;
            }
        } else {
            preview = value.type.includes(FileType.dubs)
                ? '无法推导'
                : '文件不存在';
        }

        preview = preview.replace('{$URI}', value.webUri.toString());
        line = line.replace('{$Preview}', /*'Preview:<br>' + */preview);

        line = line.replace('{$RefCount}', value.refCount.toString());

        let usedAs = '';

        for (let type of value.type) {
            usedAs += fileTypeMap.get(type) + ', ';
        }

        usedAs = usedAs.substring(0, usedAs.length - 2);

        line = line.replace('{$UsedAs}', usedAs);

        let usedAt = '';

        value.refScript.forEach((lineNumbers: number[], script: string) => {

            let scriptFileName = getFullFileNameByType(FileType.script, script);
            const scriptUri = scriptFileName === undefined
                ? undefined
                : vscode.Uri.file(scriptFileName).toString();

            usedAt += 'File: '
                + (scriptUri === undefined
                    ? script
                    : html_getHyperLink(script, scriptUri.toString()))
                + ', line: ';

            for (let lineNumber of lineNumbers) {
                // usedAt += (lineNumber + 1).toString() + ', ';
                const lineNumberString = (lineNumber + 1).toString();
                usedAt += (scriptUri === undefined
                    ? lineNumberString
                    : html_getHyperLink(lineNumberString
                        , scriptUri.toString() + '#' + lineNumber.toString()))
                    + ', ';
            }

            usedAt = usedAt.substring(0, usedAt.length - 2);
            usedAt += `<br>`;
        });

        line = line.replace('{$UsedAt}', usedAt);

        content += line;
    });

    let unusedFileListMD = markDown_getMarkDownLevel(1) + '未显式引用' + markDown_newLine;

    unusedFileList.sort();

    for (let file of unusedFileList) {
        unusedFileListMD += '  - ' + file + markDown_newLine;
    }

    let table = tableTemplate.replace('{$CONTENT}', content);
    let page = pageTemplate.replace('{$BODY}', table + markdownParser(unusedFileListMD));

    return page;
}