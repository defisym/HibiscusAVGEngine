export const regexNumber = /(\+|\-)?([0-9]+)(\.[0-9]+)?/gi;
export const regexHexColor = /(#|0[x|X])[0-9a-fA-F]{6}/gi;
export const regexRep = /\<.*\>/gi;

export const beginRegex = /^#Begin/gi;
export const endRegex = /^#End/gi;
export const keyWordRegex = /^(((#CreateSwitch|#Call|#CMP|@SetBattleScript).*)|(.*JMP.*)|(#SkipAnchor|#Ret|#StopFF|#StopFastForward))/gi;

export const langFilter = /(Lang\[[^\[\]]*\])(.*)/gi;

export function getLangRegex(localCode: string) {
    const langReg = new RegExp("Lang\\[(?!" + localCode + ").*\\].*", "gi");

    return langReg;
}