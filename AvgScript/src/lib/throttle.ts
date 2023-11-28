// ref: https://github.com/YvetteLau/Step-By-Step/issues/12

type ThrottleCallback = (...args: any[]) => void;

export class Throttle {
	private delay: number;
	private callback: ThrottleCallback[] = [];
	private timeout: NodeJS.Timer | undefined = undefined;

	constructor(delay: number = 500) {
		this.delay = delay;
	}

	public addCallback(cb: ThrottleCallback) {
		this.callback.push(cb);
	}


	private callCallback() {
		for (let cb of this.callback) {
			cb();
		}
	}

	// trigger added callbacks and function callback
	// throttle = false: trigger immediately	
	public triggerCallback(callback: (...args: any[]) => void = () => { },
		throttle: boolean = false) {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
		if (throttle) {
			this.timeout = setTimeout(() => {
				callback();
				this.callCallback();
			}, this.delay);
		} else {
			callback();
			this.callCallback();
		}
	}
}

export const throttle = new Throttle();