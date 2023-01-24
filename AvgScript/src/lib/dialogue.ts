/* eslint-disable @typescript-eslint/naming-convention */
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

export function currentLineDialogue(line: string) {
    return !line.startsWith('@') && !line.startsWith('#') && !line.startsWith(';');
}

// dialogue
export enum AppendType {
    none = 0,
    sameLine = 1,
    nextLine = 2,
}

export interface DialogueStruct {
    m_bDialogue: boolean;
    m_bNoNamePart: boolean;
    m_appendType: AppendType;
    m_bMatch: boolean;

    m_name: string;
    m_headHint: string;
    m_dubHint: string;

    m_namePart: string;
    m_namePartRaw: string;
    m_dialoguePart: string;
    m_dialoguePartRaw: string;
}

export function parseDialogue(line: string, lineRaw: string): DialogueStruct {
    let bDialogue = false;
    let bNoNamePart = false;

    const delimiterPos = findDelimiter(line);

    if (delimiterPos !== -1 && !line.startsWith('$')) {
        bDialogue = true;
    }

    bNoNamePart = delimiterPos === -1;

    // name
    const nameRegex = /(.*)(\[([^\[\]]+)\])/gi;
    let namePart = lineRaw!.substring(0, delimiterPos);

    if (namePart.startsWith('$')) {
        namePart = namePart.substring(1);
    }

    const namePartRaw = namePart;
    namePart = filterString(namePart, FORMAT_IGNORE_INCOMPLETE);

    let array = [...namePart.matchAll(nameRegex)];

    const matched = array.length !== 0;

    const name = matched ? array[0][1] : namePart;
    const dubHint = matched ? array[0][1] : namePart;
    const headHint = matched ? array[0][3] : dubHint;

    let appendType = AppendType.none;
    let dialoguePart = lineRaw!.substring(delimiterPos + 1);

    if (dialoguePart[0] === '&') {
        if (dialoguePart[1] === '&') {
            appendType = AppendType.nextLine;
        } else {
            appendType = AppendType.sameLine;
        }
    }

    dialoguePart = dialoguePart.substring(appendType);

    const dialoguePartRaw = dialoguePart;
    dialoguePart = filterString(dialoguePartRaw, FORMAT_IGNORE_INCOMPLETE);

    const dialogueStruct: DialogueStruct = {
        m_bDialogue: bDialogue,
        m_bNoNamePart: bNoNamePart,
        m_appendType: appendType,
        m_bMatch: matched,

        m_name: name,
        m_headHint: headHint,
        m_dubHint: dubHint,

        m_namePart: namePart,
        m_namePartRaw: namePartRaw,
        m_dialoguePart: dialoguePart,
        m_dialoguePartRaw: dialoguePartRaw
    };

    return dialogueStruct;
}
