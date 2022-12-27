/* eslint-disable @typescript-eslint/naming-convention */

import { RefInfo } from "../functions/command";
import { fileTypeMap } from "../lib/utilities";

export function assetList_getWebviewContent(assets: Map<string, RefInfo>) {
    const pageTemplate = `<!DOCTYPE html>
                        <html lang="en">
                        
                        <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Asset List</title>
                        </head>
                        
                        <body>
                        {$BODY}
                        </body>
                        
                        </html>`;


    const tableTemplate = `<!-- <h4>Script: </h4> -->
                            <table border="1">
                            <tr>
                                <th>File Name</th>
                                <th>Ref Count</th>
                                <th>Used As</th>
                                <th>Used At</th>
                            </tr>
                            {$CONTENT}
                            </table>`;
    const lineTemplate = `<tr>
                                <td>{$FileName}</td>
                                <td>{$RefCount}</td>
                                <td>{$UsedAs}</td>
                                <td>{$UsedAt}</td>
                            </tr>`;

    let content = '';

    assets.forEach((value: RefInfo, key: string) => {
        let line = lineTemplate;

        line = line.replace('{$FileName}', key);
        line = line.replace('{$RefCount}', value.refCount.toString());

        let usedAs = '';

        for (let type of value.type) {
            usedAs += fileTypeMap.get(type) + ', ';
        }

        usedAs = usedAs.substring(0, usedAs.length - 2);

        line = line.replace('{$UsedAs}', usedAs);

        let usedAt = '';

        value.refScript.forEach((lineNumbers: number[], script: string) => {
            usedAt += 'File: ' + script + ', line: ';

            for (let lineNumber of lineNumbers) {
                usedAt += (lineNumber + 1).toString() + ', ';
            }

            usedAt = usedAt.substring(0, usedAt.length - 2);
            usedAt += `<br>`;
        });

        line = line.replace('{$UsedAt}', usedAt);

        content += line;
    });

    let table = tableTemplate.replace('{$CONTENT}', content);
    let page = pageTemplate.replace('{$BODY}', table);

    return page;
}