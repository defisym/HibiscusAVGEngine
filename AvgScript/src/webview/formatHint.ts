/* eslint-disable @typescript-eslint/naming-convention */

import { normalTextDoc } from "../lib/dict";
import { markdownParser } from "./_mdToHtml";

export function formatHint_getFormatControlContent() {
    const pageTemplate = `<!DOCTYPE html>
                        <html lang="en">
                        
                        <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Format Hint</title>
                        </head>
                        
                        <body>
                        {$BODY}
                        </body>
                        
                        </html>`;

    const html = markdownParser(normalTextDoc);

    let page = pageTemplate.replace('{$BODY}', html);

    return page;
}