import * as vscode from 'vscode';

import { commandInfoList, ParamType } from '../lib/dict';
import { iterateLines } from "../lib/iterateLines";
import { regexHexColor, regexRep } from '../lib/regExp';
import { getAllParams } from '../lib/utilities';

export const colorProvider = vscode.languages.registerColorProvider('AvgScript',
    new (class implements vscode.DocumentColorProvider {
        provideDocumentColors(
            document: vscode.TextDocument, token: vscode.CancellationToken
        ): vscode.ProviderResult<vscode.ColorInformation[]> {
            // find all colors in the document
            let colors: vscode.ColorInformation[] = [];

            iterateLines(document, (text, lineNumber
                , lineStart, lineEnd
                , firstLineNotComment) => {
                const params = getAllParams(text);
                const paramNum = params.length - 1;

                // match command that set RGB
                let handleHex = (hex: string, start: number) => {
                    let charPos = 0;

                    if (hex.startsWith("#")) {
                        charPos += 1;
                    }
                    else if (hex.toLowerCase().startsWith("0x".toLowerCase())) {
                        charPos += 2;
                    }

                    let getColor = (colorStr: string) => {
                        let ret = parseInt(colorStr.substring(charPos, charPos + 2), 16);
                        charPos += 2;

                        return ret;
                    };

                    let R = getColor(hex);
                    let G = getColor(hex);
                    let B = getColor(hex);

                    let range = new vscode.Range(lineNumber, start, lineNumber, start + hex.length);
                    let color = new vscode.Color(R / 255.0, G / 255.0, B / 255.0, 1.0);
                    colors.push(new vscode.ColorInformation(range, color));
                };

                let handleRGB = (r: string, g: string, b: string, start: number) => {
                    if (r.isNumber() && g.isNumber() && b.isNumber()) {
                        let R = parseInt(r, 10);
                        let G = parseInt(g, 10);
                        let B = parseInt(b, 10);

                        let range = new vscode.Range(lineNumber, start
                            , lineNumber, start + r.length + 1 + g.length + 1 + b.length);
                        let color = new vscode.Color(R / 255.0, G / 255.0, B / 255.0, 1.0);
                        colors.push(new vscode.ColorInformation(range, color));
                    }
                };

                let handle = (paramStart: number, start: number) => {
                    if (params[paramStart].match(regexHexColor)) {
                        handleHex(params[paramStart], start);
                    } else {
                        handleRGB(params[paramStart], params[paramStart + 1], params[paramStart + 2], start);
                    }
                };


                if (text.startsWith("#")
                    || text.startsWith("@")) {
                    const command = params[0].substring(1);
                    const paramDefinition = commandInfoList.getValue(command);

                    if (paramDefinition === undefined) {
                        return;
                    }

                    let contentStart: number = lineStart + command.length + 1;

                    const paramFormat = paramDefinition.type;

                    for (let j = 1; j < params.length; j++) {
                        let curParam = params[j];
                        let currentType = paramFormat[j - 1];

                        contentStart++;

                        if (curParam.match(regexRep)) {
                            continue;
                        }

                        if (currentType === ParamType.Color) {
                            handle(j, contentStart);
                        }

                        contentStart += curParam.length;
                    }
                }
            });

            return colors;
        }
        provideColorPresentations(
            color: vscode.Color, context: { document: vscode.TextDocument, range: vscode.Range }, token: vscode.CancellationToken
        ): vscode.ProviderResult<vscode.ColorPresentation[]> {
            // user hovered/tapped the color block/return the color they picked
            let colors: vscode.ColorPresentation[] = [];
            let document = context.document;
            let range = context.range;

            const line = document.lineAt(range.start.line).text;
            const text = line.substring(range.start.character, range.end.character);
            const oldRange = new vscode.Range(range.start.line, range.start.character, range.start.line, range.start.character + text.length);

            const colR = Math.round(color.red * 255);
            const colG = Math.round(color.green * 255);
            const colB = Math.round(color.blue * 255);

            let colorLabel: string = "";
            if (text.substring(text.length - 8).match(regexHexColor)) {
                let toHex = (color: number) => {
                    let hex = color.toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                };

                colorLabel = (toHex(colR) + toHex(colG) + toHex(colB)).toUpperCase();

                if (text.startsWith("#")) {
                    colorLabel = "#" + colorLabel;
                }
                else if (text.toLowerCase().startsWith("0x".toLowerCase())) {
                    colorLabel = "0x" + colorLabel;
                }
            } else {
                colorLabel = colR.toString(10) + ":" + colG.toString(10) + ":" + colB.toString(10);
            }

            if (colorLabel.length > 0) {
                let rgbColorPres = new vscode.ColorPresentation(colorLabel);
                rgbColorPres.textEdit = new vscode.TextEdit(oldRange, colorLabel);
                colors.push(rgbColorPres);
            }

            return colors;
        }
    })()
);