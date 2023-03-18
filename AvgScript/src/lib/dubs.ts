/* eslint-disable @typescript-eslint/naming-convention */

import { audio, currentLocalCode, getFullFilePath, projectConfig } from "../functions/file";
import { ScriptSettings } from "./settings";
import { parseBoolean, parseCommand } from "./utilities";

export class DubParser {
    bHoldNowTalking = false;

    bDubSequence = true;
    bSeparateDubID = false;

    dubChapter = '';
    dubSequePrefix = '';

    NowTalking = -1;
    SeparateDubID: Map<string, number> = new Map();

    fileName = 'NULL';

    constructor(currentChapter: string) {
        this.bDubSequence = true;
        this.fileName = 'NULL';
        this.dubChapter = currentChapter;
        this.dubSequePrefix = '';
    }

    updateState(name: string) {
        if (this.bDubSequence) {
            if (!this.bHoldNowTalking) {
                if (!this.bSeparateDubID) {
                    this.NowTalking++;
                }
                else {
                    let separateDubID = this.SeparateDubID.get(name);

                    if (separateDubID === undefined) {
                        this.SeparateDubID.set(name, -1);
                        separateDubID = this.SeparateDubID.get(name);
                    }

                    this.SeparateDubID.set(name, separateDubID! + 1);
                }
            }

            this.bHoldNowTalking = false;

            if (this.fileName === 'NULL') {
                let newName = this.dubSequePrefix;
                newName += this.dubSequePrefix === '' ? '' : '_';

                if (this.bSeparateDubID) {
                    let separateDubID = this.SeparateDubID.get(name);

                    newName += name + '_' + separateDubID!.toString();
                } else {
                    newName += this.NowTalking.toString();
                }

                this.fileName = newName;
            }
        }
    }
    getPlayFileName() {
        const fileName = this.dubChapter + '\\' + this.fileName;

        let fullFileName: string | undefined = audio + "dubs\\" + currentLocalCode + "\\" + fileName;

        let ret = getFullFilePath(fullFileName);

        if (ret === undefined && currentLocalCode !== projectConfig.Display.LanguageFallback) {
            ret = getFullFilePath(fullFileName);
        }

        return ret;
    }
    afterPlay() {
        this.fileName = 'NULL';
    }

    parseSettings(settings: ScriptSettings | undefined) {
        if (!settings) {
            return;
        }

        this.bSeparateDubID = settings.SeparateDubID;
    }

    parseCommand(line: string) {
        const { params, commandWithPrefix, command, paramInfo } = parseCommand(line);

        if (paramInfo === undefined) {
            return;
        }

        do {
            if (command.iCmp('DubSeque')) {
                this.bDubSequence = true;

                break;
            }
            if (command.iCmp('DubSequeOff')) {
                this.bDubSequence = false;

                break;
            }
            if (command.iCmp('DubSequePrefix')) {
                this.dubSequePrefix = params[1];

                break;
            }

            if (command.iCmp('NTK') || command.iCmp('NTKChange')) {
                this.NowTalking = parseInt(params[1]);
                this.bHoldNowTalking = true;

                const bKeepSeq = parseBoolean(params[2]);
                this.bDubSequence = bKeepSeq ? this.bDubSequence : bKeepSeq;

                break;
            }


            if (command.iCmp('SeparateNTKChange')) {
                const name = params[1];

                let separateDubID = this.SeparateDubID.get(name);

                if (separateDubID === undefined) {
                    this.SeparateDubID.set(name, -1);
                    separateDubID = this.SeparateDubID.get(name);
                }

                this.SeparateDubID.set(name, parseInt(params[2]));
                this.bHoldNowTalking = true;

                const bKeepSeq = parseBoolean(params[2]);
                this.bDubSequence = bKeepSeq ? this.bDubSequence : bKeepSeq;

                break;
            }

            if (command.iCmp('DubChapter')) {
                this.dubChapter = params[1];

                break;
            }

        } while (0);
    }
}