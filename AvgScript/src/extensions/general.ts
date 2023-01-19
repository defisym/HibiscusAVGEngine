// if type is string, then compare it ignore case
export function comparator<T>(l:T,r:T){
    if (typeof l === "string") {
        return (<typeof l>r).iCmp(l);
    }

    return l === r;
}