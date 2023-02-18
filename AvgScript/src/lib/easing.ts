/* eslint-disable @typescript-eslint/naming-convention */

import { extraInlayHintInfoInvalid } from "../functions/inlayHint";

export function easing_getFuncName(id: number) {
    switch (id) {
        case 0:
            return 'Linear';
        case 1:
            return 'Quadratic';
        case 2:
            return 'Cubic';
        case 3:
            return 'Quart';
        case 4:
            return 'Quint';
        case 5:
            return 'Sine';
        case 6:
            return 'Exponential';
        case 7:
            return 'Circular';
        case 8:
            return 'Back';
        case 9:
            return 'Elastic';
        case 10:
            return 'Bounce';
        default:
            return extraInlayHintInfoInvalid;
    }
}

export function easing_getModeName(id: number) {
    switch (id) {
        case 0:
            return 'Ease-In';
        case 1:
            return 'Ease-Out';
        case 2:
            return 'Ease-In-Out';
        case 3:
            return 'Ease-Out-In';
        default:
            return extraInlayHintInfoInvalid;
    }
}