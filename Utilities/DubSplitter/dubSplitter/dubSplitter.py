import argparse
import os

from colorama import init, Fore, Style
from pydub import AudioSegment
from pydub.exceptions import CouldntDecodeError
from sympy import false, true
from rich.progress import Progress, TaskID

import dubSplitter.constants as consts
from .constants import update_path
from .functions.output import output, setlog
from .functions.path import iterate_path, process_path, get_filecount
from .functions.slicer import do_slice, update_output_format, update_filename_format, update_filename_vr_format, \
    update_filename_custom, update_result_omit_length
from .functions.voiceRecognition import update_whisper_model, update_model_language, update_model_prompt

# -f "F:\DEV\Mobius\资产\语音\基利尔\01_初\干音\初.wav" -o "F:\DEV\Mobius\资产\语音\基利尔\01_初\Out" -s 800 -r 1200 --keepSilence 500
# -f "正文14.wav" -o "D:\Dev\Mobius\资产\语音\基利尔\正文\Out\正文14" --model medium --silence 1500 --range 0
# -f "FTest.wav" -o "D:\Dev\Mobius\资产\语音\Temp\_Test\FTest\Out" --NoVR --silence 1500 --range 0 --threshold -45


init(autoreset=True)

VERSION = '0.7.0'

print(Fore.LIGHTGREEN_EX + '====================================')
print(Fore.LIGHTGREEN_EX + 'DubSplitter {}'.format(VERSION))
print(Fore.LIGHTGREEN_EX + '====================================')

bFromPackage = true


def update_runtime(runtime):
    global bFromPackage
    bFromPackage = runtime


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
    parser.add_argument('--threshold',
                        help='anything quieter than this will be considered silence, default is -40db',
                        type=int, default=-40)
    parser.add_argument('--keepSilence',
                        help='leave some silence at the beginning and end of the chunks. Keeps the sound from '
                             'sounding like it is abruptly cut off. When the length of the silence is less than the '
                             'given duration it is split evenly between the preceding and following non-silent '
                             'segments, default is 300ms',
                        type=int, default=300)

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
    parser.add_argument('--log',
                        help='output detailed log instead of progress bar, default is false',
                        type=bool, default=false)

    args = parser.parse_args()

    if bFromPackage:
        update_path(true)

    # process file name
    inName = args.fileName
    outPath = consts.defaultOutPath if args.outFilePath is None else args.outFilePath

    if not os.path.exists(inName):
        print(Fore.RED + 'file or path {} not exist!'.format(inName))
        return

    bFolder = os.path.isdir(inName)

    update_output_format(args.outFileFormat)
    update_filename_format(args.fileNameFormat)
    update_filename_vr_format(args.fileNameVRFormat)
    update_filename_custom(args.fileNameCustomInfo)

    # slice param init
    silenceStart = args.silence
    silenceEnd = silenceStart + args.range
    silenceStep = args.step

    threshold = args.threshold
    keepSilence = args.keepSilence

    # whisper init
    noVR = args.noVR

    if not noVR:
        update_model_prompt(args.prompt)
        update_model_language(args.language)
        update_result_omit_length(args.omitLen)

        update_whisper_model(args.model)

    # log inti
    setlog(args.log)

    output(Fore.LIGHTGREEN_EX + '============================')
    output(Fore.LIGHTGREEN_EX + 'processing...')
    output(Fore.LIGHTGREEN_EX + '============================')

    def process_file(input_file, output_folder):
        output('prepare to process file {}'.format(input_file))
        output('output to folder {}'.format(output_folder))

        output(Fore.WHITE + Style.DIM + '  reading file...')
        try:
            sound = AudioSegment.from_file(input_file)
        except CouldntDecodeError:
            output(Fore.WHITE + Style.DIM + '  invalid file...')

            return

        output(Fore.WHITE + Style.DIM + '  read complete...')

        def get_progress():
            if not args.log:
                return progress
            else:
                return -1

        filename = os.path.split(input_file)[1]
        filename = os.path.splitext(filename)[0]

        if bFolder and not args.log:
            progress.update(fileProgress, description="[red]file: {}".format(filename))

        loopCount = 0
        for silence in range(silenceStart, silenceEnd + 1, silenceStep):
            loopCount = loopCount + 1

        if loopCount == 1:
            do_slice(sound, silenceStart, threshold, keepSilence, output_folder, not noVR, -1, get_progress())
        else:
            if not args.log:
                silenceProgress = progress.add_task("[green]silence...", total=loopCount)
            else:
                silenceProgress = -1

            previous = -1
            for silence in range(silenceStart, silenceEnd + 1, silenceStep):
                if not args.log:
                    progress.update(silenceProgress, description="[green]silence: {}".format(silence), total=loopCount)

                previous = do_slice(sound, silence, threshold, keepSilence, output_folder, not noVR, previous,
                                    get_progress())

                if not args.log:
                    progress.advance(silenceProgress, advance=1)

            if not args.log:
                progress.remove_task(silenceProgress)

        if bFolder and not args.log:
            progress.advance(fileProgress, advance=1)

    # call processor
    # https://github.com/textualize/rich/blob/master/README.cn.md
    # https://rich.readthedocs.io/en/latest/progress.html#basic-usage
    with Progress() as progress:
        if bFolder:
            filecount = get_filecount(inName)
            if not args.log:
                fileProgress = progress.add_task("[red]{} files".format(filecount), total=filecount)

            iterate_path(inName,
                         lambda fullname, filename, ext:
                         process_file(fullname, process_path(outPath) + '\\' + os.path.splitext(filename)[0]))
        else:
            process_file(inName, outPath)

    output(Fore.LIGHTGREEN_EX + '============================')
    output(Fore.LIGHTGREEN_EX + 'process complete')
    output(Fore.LIGHTGREEN_EX + '============================')
