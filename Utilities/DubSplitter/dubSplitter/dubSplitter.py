import argparse

from pydub import AudioSegment
from sympy import false, true

import dubSplitter.constants as consts

from .constants import update_path
from .functions.slicer import do_slice
from .functions.voiceRecognition import update_whisper_model, update_model_language

bFromPackage = true


def update_runtime(runtime):
    global bFromPackage
    bFromPackage = runtime


# -f "F:\DEV\Mobius\资产\语音\基利尔\01_初\干音\初.wav" -o "F:\DEV\Mobius\资产\语音\基利尔\01_初\Out" -s 800 -r 400
def main():
    # https://docs.python.org/zh-cn/3.6/library/argparse.html
    parser = argparse.ArgumentParser(description='Slice dubs.')

    parser.add_argument('-f', '--fileName',
                        help='file to process')
    parser.add_argument('-o', '--outFilePath',
                        help='output folder, if not set, will use scriptPath + \\Out\\ (as script), '
                             'or userPath + \\DubSplitter\\Out\\ (as package)')
    parser.add_argument('-s', '--silence',
                        help='silence time, in ms, default is 1000ms',
                        type=int, default=1000)
    parser.add_argument('-r', '--range',
                        help='range, default is 100ms. e.g., silence = 400, range = 100 will slice in 400ms and 500ms',
                        type=int, default=100)
    parser.add_argument('--step',
                        help='loop step, default is 100ms',
                        type=int, default=100)
    parser.add_argument('--noVR',
                        help='don\'t use voice recognition, default is false',
                        type=bool, default=false)
    parser.add_argument('--model',
                        help='whisper model, default is base',
                        default='base')
    parser.add_argument('--language',
                        help='language used in whisper, default is chinese',
                        default='chinese')

    args = parser.parse_args()

    if bFromPackage:
        update_path(true)

    inName = args.fileName
    outPath = consts.defaultOutPath if args.outFilePath is None else args.outFilePath

    print('processing file {}'.format(inName))
    print('output to {}'.format(outPath))

    noVR = args.noVR

    if not noVR:
        update_whisper_model(args.model)
        update_model_language(args.language)

    silenceStart = args.silence
    silenceEnd = silenceStart + args.range
    silenceStep = args.step

    print('reading file...')
    sound = AudioSegment.from_wav(inName)
    print('read complete...')

    for silence in range(silenceStart, silenceEnd + 1, silenceStep):
        do_slice(sound, silence, outPath, not noVR)

    print('process complete')
