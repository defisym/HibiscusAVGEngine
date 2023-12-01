import { regexNumber } from "../lib/regExp";

export { };

declare global {
	interface String {
		replaceAt(index: number, replacement: string): string;
		replaceRange(start: number, end: number, replacement: string): string;
		replaceRanges(ranges: [number, number][], replacement: string): string;
		startsWithStrings(searchString: string[], position?: number): boolean;
		endsWithStrings(searchString: string[], endPosition?: number): boolean;

		matchStart(regex: string | RegExp): boolean;
		matchEntire(regex: string | RegExp): boolean;

		isNumber(): boolean;
		empty(): boolean;

		iCmp(str: string): boolean;

		after(str: string): string;
		right(index: number): string;
		left(index: number): string;

		removeAfter(str: string): string;
		removeRight(index: number): string;
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

String.prototype.matchStart = function (regex: string | RegExp): boolean {
	let match = this.match(regex);

	if (match === null) {
		return false;
	}

	const matchLength = match[0].length;

	return match[0] === this.substring(0, matchLength);
};

String.prototype.matchEntire = function (regex: string | RegExp): boolean {
	let match = this.match(regex);

	if (match === null) {
		return false;
	}

	return match[0] === this;
};

String.prototype.isNumber = function () {
	return this.matchEntire(regexNumber);
};

String.prototype.empty = function () {
	return this.trim().length === 0;
};

String.prototype.iCmp = function (str: string) {
	return this.length === str.length
		&& this.toLowerCase() === str.toLowerCase();
};

String.prototype.after = function (str: string) {
	return this.right(this.lastIndexOf(str));
};

String.prototype.right = function (index: number) {
	return index === -1
		? ''
		: this.substring(index);
};

String.prototype.left = function (index: number) {
	return index === -1
		? this.substring(0, this.length)
		: this.substring(0, index);
};

String.prototype.removeAfter = function (str: string) {
	return this.removeRight(this.lastIndexOf(str));
};

String.prototype.removeRight = function (index: number) {
	return index === -1
		? this.toString()
		: this.substring(0, index);
};