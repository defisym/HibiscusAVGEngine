import argparse

from colorama import init, Fore, Style
from pydub import AudioSegment
from sympy import false, true

import dubSplitter.constants as consts
from .constants import update_path
from .functions.slicer import do_slice, update_output_format, update_filename_format, update_filename_vr_format, \
    update_filename_custom, update_result_omit_length
from .functions.voiceRecognition import update_whisper_model, update_model_language, update_model_prompt

init(autoreset=True)

VERSION = '0.3.0'

print(Fore.LIGHTGREEN_EX + '====================================')
print(Fore.LIGHTGREEN_EX + 'DubSplitter {}'.format(VERSION))
print(Fore.LIGHTGREEN_EX + '====================================')

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

    parser.add_argument('--outFileFormat',
                        help='output format, default is \'ogg\'',
                        default=consts.defaultOutputFormat)
    parser.add_argument('--fileNameFormat',
                        help='output file name format',
                        default=consts.defaultFileNameFormat)
    parser.add_argument('--fileNameVRFormat',
                        help='output file name format with voice recognition',
                        default=consts.defaultFileNameVRFormat)
    parser.add_argument('--fileNameCustomInfo',
                        help='custom info for output file name, default is \'\'',
                        default='')

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
    parser.add_argument('--prompt',
                        help='init prompt used in whisper, default is 简体中文',
                        default=consts.defaultWhisperPrompt)
    parser.add_argument('--language',
                        help='language used in whisper, default is chinese',
                        default=consts.defaultWhisperLanguage)
    parser.add_argument('--omitLen',
                        help='recognize result will omit middle characters if longer than given,'
                             'len <=0 -> do nothing, default is 20',
                        type=int, default=20)

    args = parser.parse_args()

    if bFromPackage:
        update_path(true)

    inName = args.fileName
    outPath = consts.defaultOutPath if args.outFilePath is None else args.outFilePath

    update_output_format(args.outFileFormat)
    update_filename_format(args.fileNameFormat)
    update_filename_vr_format(args.fileNameVRFormat)
    update_filename_custom(args.fileNameCustomInfo)

    print('prepare to process file {}'.format(inName))
    print('output to folder {}'.format(outPath))

    silenceStart = args.silence
    silenceEnd = silenceStart + args.range
    silenceStep = args.step

    print(Fore.WHITE + Style.DIM + '  reading file...')
    sound = AudioSegment.from_file(inName)
    print(Fore.WHITE + Style.DIM + '  read complete...')

    noVR = args.noVR

    if not noVR:
        update_model_prompt(args.prompt)
        update_model_language(args.language)
        update_result_omit_length(args.omitLen)

        update_whisper_model(args.model)

    print(Fore.LIGHTGREEN_EX + '============================')
    print(Fore.LIGHTGREEN_EX + 'processing...')
    print(Fore.LIGHTGREEN_EX + '============================')

    for silence in range(silenceStart, silenceEnd + 1, silenceStep):
        do_slice(sound, silence, outPath, not noVR)

    print(Fore.LIGHTGREEN_EX + '============================')
    print(Fore.LIGHTGREEN_EX + 'process complete')
    print(Fore.LIGHTGREEN_EX + '============================')
