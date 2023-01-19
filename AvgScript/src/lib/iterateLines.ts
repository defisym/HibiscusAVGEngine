import * as vscode from 'vscode';

// iterateLines(document, (text, lineNumber
//     , lineStart, lineEnd
//     , firstLineNotComment) => {
//     });

export function iterateLines(document: vscode.TextDocument,
    callBack: (text: string, lineNum: number,
        lineStart: number, lineEnd: number,
        firstLineNotComment: number) => void) {
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

    let firstLineNotComment: number | undefined = undefined;

    for (let i = 0; i < document.lineCount; ++i) {
        const line = document.lineAt(i);

        if (!line.isEmptyOrWhitespace) {
            const text = line.text.trim();
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
                const lineStart: number = line.firstNonWhitespaceCharacterIndex
                    + text.length - textRemoveFront.length;
                const lineEnd: number = lineStart + textNoComment.length;

                if (firstLineNotComment === undefined) {
                    firstLineNotComment = i;
                }

                callBack(textNoComment, i,
                    lineStart, lineEnd,
                    firstLineNotComment);
            }

            if (!inComment
                && !text.match(/\*\//gi)
                && text.match(/\/\*/gi)) {
                inComment = true;;
            }
        }
    }
}
