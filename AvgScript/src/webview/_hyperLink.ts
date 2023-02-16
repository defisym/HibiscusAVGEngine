/* eslint-disable @typescript-eslint/naming-convention */

export function html_getHyperLink(text: string, link: string) {
    return `<a href="` + link + `">` + text + `</a>`;
}