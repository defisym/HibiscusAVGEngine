export { };

declare global {
    interface Array<T> {
        empty(): boolean;
        hasValue(item: T): boolean;
    }
}

Array.prototype.empty = function () {
    return this.length === 0;
};

Array.prototype.hasValue = function <T>(item: T) {
    for (let i in this) {
        if (i === "empty") {
            continue;
        }

        if (typeof item !== (typeof this[i])) {
            return false;
        }

        if (typeof item === "string") {
            if ((<typeof item>this[i]).toLowerCase() === item.toLowerCase()) {
                return true;
            }
        }

        else if (this[i] === item) {
            return true;
        }
    }

    return false;
};