export const FORMAT_IGNORE_UNKNOWN = 0b00000001;
export const FORMAT_IGNORE_INCOMPLETE = 0b00000010;

export const FORMAT_IGNORE_DEFAULTFLAG = FORMAT_IGNORE_UNKNOWN | FORMAT_IGNORE_INCOMPLETE;

export const syntaxCommandList = [
    '^',
    '^-',
    '!^',
    '!',
    'ICon',
    'IConOffsetX',
    'IConOffsetY',
    'IConScale',
    'IConResample',
    'Shake',
    'Color',
    'C',
    'Font',
    'F',
    'Size',
    'S',
    'Bold',
    'B',
    '!Bold',
    '!B',
    'Italic',
    'I',
    '!Italic',
    '!I',
    'Underline',
    'U',
    '!Underline',
    '!U',
    'StrikeOut',
    'S',
    '!StrikeOut',
    '!S',
];

function stringStartWithSyntaxCommand(str: string) {
    for (let command of syntaxCommandList) {
        if (str.toLowerCase().startsWith(command.toLowerCase())
            || str[0] === '/' && str.substring(1).toLowerCase().startsWith(command.toLowerCase())) {
            return true;
        }
    }

    return false;
}

export function filterString(str: string, filterFlag: number = FORMAT_IGNORE_DEFAULTFLAG) {
    let filterText: string = str;
    let replacePos: [number, number][] = [];

    let bInCommand: boolean = false;
    let bKnownCommand: boolean = false;
    let bKnownCommandChecked: boolean = false;

    let commandStart = -1;
    let commandEnd = -1;

    const bIgnoreUnknown = filterFlag & FORMAT_IGNORE_UNKNOWN;
    const bIgnoreIncomplete = filterFlag & FORMAT_IGNORE_INCOMPLETE;

    for (let i = 0; i < str.length; i++) {
        const curChar = str[i];
        const nextChar = str[i + 1];

        if (curChar === '\\' && nextChar === '[') {
            i++;

            continue;
        }

        // Parse Format
        if (curChar === '[') {
            bInCommand = true;
            commandStart = i;
        }

        if (bInCommand && !bKnownCommandChecked) {
            if (stringStartWithSyntaxCommand(str.substring(i + 1))) {
                bKnownCommand = true;
            }

            bKnownCommandChecked = true;
        }

        if (bInCommand && curChar === ']') {
            commandEnd = i;

            if (bIgnoreUnknown || bKnownCommand) {
                replacePos.push([commandStart, commandEnd]);
            }

            bInCommand = false;
            bKnownCommand = false;
            bKnownCommandChecked = false;

            commandStart = -1;
            commandEnd = -1;
        }
    }

    filterText = filterText.replaceRanges(replacePos, '');

    if (bIgnoreIncomplete) {
        const lastIndexStart = filterText.lastIndexOf('[');
        const lastIndexEnd = filterText.lastIndexOf(']');
        if (lastIndexStart !== -1 && lastIndexEnd === -1 && filterText[lastIndexStart - 1] !== '\\') {
            filterText = filterText.substring(0, lastIndexStart);
        }
    }

    return filterText;
}

export function paddingString(str: string) {
    const replaceChar = '□';

    let bInCommand: boolean = false;

    for (let i = 0; i < str.length; i++) {
        const curChar = str[i];
        const nextChar = str[i + 1];

        if (curChar === '\\' && nextChar === '[') {
            i++;

            continue;
        }

        // Parse Format
        if (curChar === '[') {
            bInCommand = true;
        }

        if (bInCommand) {
            str.replaceAt(i, replaceChar);
        }

        if (bInCommand && curChar === ']') {
            bInCommand = false;
        }
    }

    return str;
}

export function findDelimiter(str: string) {
    return paddingString(str).lastIndexOf(':');
};