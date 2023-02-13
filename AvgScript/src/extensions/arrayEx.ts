import { comparator } from "./general";

export { };

declare global {
    interface Array<T> {
        empty(): boolean;
        hasValue(item: T): boolean;
        findIf(cmp: (item: T) => boolean): number;

        removeIf(cmp: (item: T) => boolean): boolean;
        remove(elementToRemove: T): boolean;

        uniquePush(elementToPush: T): number;
        uniquePushIf(elementToPush: T, cmp: (l: T, r: T) => boolean): number;
    }
}

Array.prototype.empty = function () {
    return this.length === 0;
};

Array.prototype.hasValue = function <T>(item: T) {
    let elementPosition = this.findIf((it: T) => {
        return comparator(it, item);
    });

    return elementPosition !== -1;
};

// always return the element position in array
Array.prototype.findIf = function <T>(cmp: (item: T) => boolean) {
    let elementPosition = -1;

    for (let i = 0; i < this.length; i++) {
        const element = this[i];

        if (cmp(element)) {
            elementPosition = i;

            break;
        }
    }

    return elementPosition;
};

Array.prototype.removeIf = function <T>(cmp: (item: T) => boolean) {
    let pos = this.findIf(cmp);

    if (pos === -1) {
        return false;
    }

    this[pos] = this[this.length - 1];
    this.pop();

    return true;
};


Array.prototype.remove = function <T>(elementToRemove: T) {
    return this.removeIf((item: T) => {
        return comparator(item, elementToRemove);
    });
};

// always return the element position in array
Array.prototype.uniquePushIf = function <T>(elementToPush: T, cmp: (l: T, r: T) => boolean): number {
    let elementPosition = this.findIf((item: T) => {
        return cmp(item, elementToPush);
    });

    if (elementPosition === -1) {
        return this.push(elementToPush) - 1;
    } else {
        return elementPosition;
    }
};

// always return the element position in array
// if type is string, then compare it ignore case
Array.prototype.uniquePush = function <T>(elementToPush: T): number {
    return this.uniquePushIf(elementToPush, (l: T, r: T) => {
        return comparator(l, r);
    });
};