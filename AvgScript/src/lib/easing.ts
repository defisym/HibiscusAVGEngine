/* eslint-disable @typescript-eslint/naming-convention */

import { extraInlayHintInfoInvalid } from "../functions/inlayHint";

export const easing_inlayHintAddition_funcName = new Map<string, string>([
    ["0", "Linear"],
    ["1", "Quadratic"],
    ["2", "Cubic"],
    ["3", "Quart"],
    ["4", "Quint"],
    ["5", "Sine"],
    ["6", "Exponential"],
    ["7", "Circular"],
    ["8", "Back"],
    ["9", "Elastic"],
    ["10", "Bounce"]
]);

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

export const easing_inlayHintAddition_modeName = new Map<string, string>([
    ["0", "Ease-In"],
    ["1", "Ease-Out"],
    ["2", "Ease-In-Out"],
    ["3", "Ease-Out-In"]
]);

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