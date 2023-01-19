/* eslint-disable @typescript-eslint/naming-convention */
import { comparator } from "./general";

export { };

declare global {
    interface Map<K, V> {
        getValue(item: K): V | undefined;
    }
}

const Terminate_Search = 0;

// if type is string, then compare it ignore case
Map.prototype.getValue = function <K, V>(item: K): V | undefined {
    let ret: V | undefined = undefined;

    if (this === undefined || item === undefined) {
        return undefined;
    }

    try {
        this.forEach((value, key) => {
            if (key === undefined) {
                return;
            }

            if (comparator(key, item)) {
                ret = value;

                throw Terminate_Search;
            }
        });
    } catch {

    }

    return ret;
};