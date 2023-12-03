/* eslint-disable @typescript-eslint/naming-convention */
import { comparator } from "./general";

export { };

declare global {
	interface Map<K, V> {
		getValue(item: K): V | undefined;
		getWithInit(item: K, init: V): V | undefined;
		keyToArray(): K[];
		removeIf(cmp: (key: K, value: V) => boolean): boolean;
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
// get item with init
Map.prototype.getWithInit = function <K, V>(item: K, init: V): V | undefined {
	let value = this.get(item);

	if (value === undefined) {
		this.set(item, init);
		value = this.get(item);
	}

	return value;
};

Map.prototype.keyToArray = function <K, V>(): K[] {
	let ret: K[] = [];

	this.forEach((value, key) => {
		if (key === undefined) {
			return;
		}

		ret.push(key);
	});

	return ret;
};

Map.prototype.removeIf = function <K, V>(cmp: (key: K, value: V) => boolean): boolean {
	let bRemoved = false;

	for (let [key, value] of this) {
		if (cmp(key, value)) {
			bRemoved = true;
			this.delete(key);
		}
	}

	return bRemoved;
};