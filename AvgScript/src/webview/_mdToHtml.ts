/* eslint-disable @typescript-eslint/naming-convention */
import marked = require('marked');

export function markdownParser(markdown: string) {
    return marked.marked.parse(markdown);
}

export const markDown_newLine = '\r\n\r\n';
export const markDown_Level = '#';

export function markDown_getMarkDownLevel(level: number = 1) {
    let ret = '';

    for (let i = 0; i < level; i++) {
        ret += markDown_Level;
    }

    return ret += ' ';
}

export function markDown_getLink(text: string, link: string) {
    return '[' + text + ']' + '(' + link + ')';
}