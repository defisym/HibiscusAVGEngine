import * as vscode from 'vscode';

export interface LineInfo {
    emptyLine: boolean,

    lineIsComment: boolean,

    originText: string
    textNoComment: string,

    lineNum: number,

    lineStart: number,
    lineEnd: number,

    firstLineNotComment: number | undefined
}

export function iterateLinesWithComment(document: vscode.TextDocument,
    lineCallBack: (lineInfo: LineInfo) => void) {
    let inComment: boolean = false;

    let beginRegex = /^#Begin/gi;
    let endRegex = /^#End/gi;
    let labelRegex = /^;.*/gi;
    let keyWordRegex = /^(((#CreateSwitch|#Call|#CMP|@SetBattleScript).*)|(.*JMP.*)|(#SkipAnchor|#Ret|#StopFF|#StopFastForward))/gi;

    let commentRegex = /(\/\/.*)|(\(.*)|(\/\*(?!\*\/)[^\*\/]*)|((?!\/\*)[^\/\*]*\*\/)/gi;

    // line starts with // ( /*
    // remove back
    let commentRegexRepBack = /(\/\/.*)|(\(.*)|(\/\*(?!\*\/)[^\*\/]*)/gi;
    // line starts with ...*/
    // remove beginning
    let commentRegexRepFront = /((?!\/\*)[^\/\*]*\*\/)/gi;
    // block //
    let commentRegexEntire = /(\/\/.*)|(\(.*)|(\/\*(?!\*\/)[^\*\/]*)\*\//gi;

    let firstLineNotComment: number | undefined = undefined;

    for (let i = 0; i < document.lineCount; ++i) {
        const line = document.lineAt(i);

        if (!line.isEmptyOrWhitespace) {
            const text = line.text.replace(commentRegexEntire, "").trim();

            let textRemoveBack = text.replace(commentRegexRepBack, "").trim();
            let textRemoveFront = text;

            let textNoComment = textRemoveBack;

            // TODO ABC /* */ ACB
            if (inComment
                && text.match(commentRegexRepFront)) {
                inComment = false;
                textRemoveFront = text.replace(commentRegexRepFront, "").trim();
                textNoComment = textRemoveBack.replace(commentRegexRepFront, "").trim();
            }

            if (!inComment
                && textNoComment.length > 0) {

                if (firstLineNotComment === undefined) {
                    firstLineNotComment = i;
                }
            }

            const lineStart: number = line.firstNonWhitespaceCharacterIndex
                + text.length - textRemoveFront.length;
            const lineEnd: number = lineStart + textNoComment.length;

            lineCallBack(
                {
                    emptyLine: false,

                    lineIsComment: inComment || textNoComment.empty(),

                    originText: line.text,
                    textNoComment: textNoComment,

                    lineNum: i,

                    lineStart: lineStart,
                    lineEnd: lineEnd,

                    firstLineNotComment: firstLineNotComment
                }
            );

            if (!inComment
                && !text.match(/\*\//gi)
                && text.match(/\/\*/gi)) {
                inComment = true;;
            }
        } else {
            lineCallBack(
                {
                    emptyLine: true,

                    lineIsComment: false,

                    originText: line.text,
                    textNoComment: '',

                    lineNum: i,

                    lineStart: 0,
                    lineEnd: line.text.length,

                    firstLineNotComment: firstLineNotComment
                }
            );
        }
    }
}

// iterateLines(document, (text, lineNumber
//     , lineStart, lineEnd
//     , firstLineNotComment) => {
//     });

export function iterateLines(document: vscode.TextDocument,
    callBack: (text: string, lineNum: number,
        lineStart: number, lineEnd: number,
        firstLineNotComment: number) => void) {
    iterateLinesWithComment(document, (info: LineInfo) => {
        let { lineIsComment,

            originText,
            textNoComment,

            lineNum,

            lineStart,
            lineEnd,

            firstLineNotComment } = info;

        if (!lineIsComment) {
            callBack(textNoComment, lineNum,
                lineStart, lineEnd,
                firstLineNotComment!);
        }
    });
}
