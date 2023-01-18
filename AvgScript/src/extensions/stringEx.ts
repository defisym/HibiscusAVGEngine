export { };

declare global {
    interface String {
        replaceAt(index: number, replacement: string): string;
        replaceRange(start: number, end: number, replacement: string): string;
        replaceRanges(ranges: [number, number][], replacement: string): string;
        startsWithStrings(searchString: string[], position?: number): boolean;
        endsWithStrings(searchString: string[], endPosition?: number): boolean;
    }
}

String.prototype.replaceAt = function (index: number, replacement: string) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
};

String.prototype.replaceRange = function (start: number, end: number, replacement: string) {
    return this.substring(0, start) + replacement + this.substring(end + 1);
};

String.prototype.replaceRanges = function (ranges: [number, number][], replacement: string) {
    let ret: string = '';
    let subRanges: number[] = [];

    subRanges.push(-1);

    for (const [start, end] of ranges) {
        subRanges.push(start);
        subRanges.push(end);
    }

    subRanges.push(-1);

    for (let i = 0; i < subRanges.length / 2; i++) {
        const start = subRanges[i * 2] + 1;
        const end = subRanges[i * 2 + 1];

        if (end !== -1) {
            ret += this.substring(start, end);
        } else {
            ret += this.substring(start);
        }
    }

    return ret;
};

String.prototype.startsWithStrings = function (searchString: string[], position?: number) {
    let result = false;

    for (let string of searchString) {
        result = result || this.startsWith(string, position);
    }

    return result;
};

String.prototype.endsWithStrings = function (searchString: string[], endPosition?: number) {
    let result = false;

    for (let string of searchString) {
        result = result || this.endsWith(string, endPosition);
    }

    return result;
};
