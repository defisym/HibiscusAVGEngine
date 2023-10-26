import os

from colorama import Fore, Style
from pydub.exceptions import CouldntEncodeError
from pydub.silence import split_on_silence

from .output import output
from .path import mkdir, process_path, invalid_file_character_escape
from .stringEx import string_omit
from .voiceRecognition import recognition_with_whisper
from ..constants import tempPath, defaultFileNameFormat, defaultOutputFormat, defaultFileNameVRFormat

outputFormat = defaultOutputFormat


def update_output_format(new_format):
    global outputFormat
    outputFormat = new_format


fileNameFormat = defaultFileNameFormat
fileNameVRFormat = defaultFileNameVRFormat
fileNameCustomInfo = ''


def update_filename_format(new_format):
    global fileNameFormat
    fileNameFormat = new_format


def update_filename_vr_format(new_format):
    global fileNameVRFormat
    fileNameVRFormat = new_format


def update_filename_custom(new_custom):
    global fileNameCustomInfo
    fileNameCustomInfo = new_custom


resultOmitLength = 20


def update_result_omit_length(new_length):
    global resultOmitLength
    resultOmitLength = new_length


def do_slice(sound, silence, threshold, keep_silence, out_path, b_vr, progress):
    output('slice audio by silence length {}'.format(silence))

    dubs = split_on_silence(sound, silence, threshold, keep_silence, 1)
    length = len(dubs)
    output('slice complete, got {} lines'.format(length))

    mkdir(tempPath)

    localPath = process_path(out_path) + '\\' + 'Silence_' + str(silence)
    mkdir(localPath)

    output(Fore.LIGHTCYAN_EX + '====================')
    output(Fore.LIGHTCYAN_EX + 'output to folder {}'.format(localPath))
    output(Fore.LIGHTCYAN_EX + '====================')

    outputProgress = progress.add_task("[cyan]output...", total=length)

    for index in range(length):
        # https://python3-cookbook.readthedocs.io/zh_CN/latest/c07/p07_capturing_variables_in_anonymous_functions.html
        updateOutName = lambda: fileNameFormat.format(fileNameCustomInfo, outputFormat, silence, index)
        updateFullOut = lambda: localPath + '\\' + outName

        # outName = fileNameFormat.format(fileNameCustomInfo,
        #                                 outputFormat,
        #                                 silence, index)
        # fullOut = localPath + '/' + outName

        outName = updateOutName()
        fullOut = updateFullOut()

        output('exporting file {}'.format(outName))

        audioSeg = dubs[index]

        try:
            audioSeg.export(fullOut, format=outputFormat)
        except CouldntEncodeError:
            output(Fore.RED + 'do not support given format \'{}\', fallback to \'{}\''.format(outputFormat,
                                                                                              defaultOutputFormat))
            update_output_format(defaultOutputFormat)

            outName = updateOutName()
            fullOut = updateFullOut()

            output('re exporting file {}'.format(outName))
            audioSeg.export(fullOut, format=outputFormat)

        if b_vr:
            output(Fore.WHITE + Style.DIM + '  voice recognizing...')
            recognize_result = recognition_with_whisper(fullOut)

            output(Fore.WHITE + Style.DIM + '  recognize result: {}'.format(recognize_result))

            text = string_omit(recognize_result, resultOmitLength)
            text = invalid_file_character_escape(text)

            outName = fileNameVRFormat.format(fileNameCustomInfo,
                                              outputFormat,
                                              silence, index,
                                              recognize_result, text)

            os.replace(fullOut, localPath + '\\' + outName)
            output(Fore.WHITE + Style.DIM + '  update file name to: {}'.format(outName))

        progress.advance(outputProgress, advance=1)

    progress.remove_task(outputProgress)

    output(Fore.LIGHTCYAN_EX + '====================')
    output(Fore.LIGHTCYAN_EX + 'output to folder {}'.format(localPath))
    output(Fore.LIGHTCYAN_EX + '====================')
