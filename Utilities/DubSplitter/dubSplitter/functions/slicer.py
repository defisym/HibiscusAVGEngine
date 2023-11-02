import itertools
import os

from colorama import Fore, Style
from pydub.exceptions import CouldntEncodeError
from pydub.silence import split_on_silence, detect_nonsilent

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


def update_nonsilent_ranges(audio_segment, nonsilent_ranges, keep_silence=100):
    # from the itertools documentation
    def pairwise(iterable):
        """s -> (s0,s1), (s1,s2), (s2, s3), ..."""
        a, b = itertools.tee(iterable)
        next(b, None)
        return zip(a, b)

    if isinstance(keep_silence, bool):
        keep_silence = len(audio_segment) if keep_silence else 0

    output_ranges = [
        [start - keep_silence, end + keep_silence]
        for (start, end) in nonsilent_ranges
    ]

    for range_i, range_ii in pairwise(output_ranges):
        last_end = range_i[1]
        next_start = range_ii[0]
        if next_start < last_end:
            range_i[1] = (last_end + next_start) // 2
            range_ii[0] = range_i[1]

    output_ranges = [
        [max(start, 0), min(end, len(audio_segment))]
        for (start, end) in output_ranges
    ]

    return output_ranges


def split_on_given_nonsilent_ranges(audio_segment, output_ranges):
    """
    the same as split_on_silence but allows you to use given nonsilent_ranges output by detect_nonsilent
    """

    return [
        audio_segment[max(start, 0): min(end, len(audio_segment))]
        for start, end in output_ranges
    ]


def do_slice(sound, silence, threshold, keep_silence, out_path, b_vr, previous, progress):
    output('slice audio by silence length {}'.format(silence))

    # dubs = split_on_silence(sound, silence, threshold, keep_silence, 1)
    nonsilent_ranges = detect_nonsilent(sound, silence, threshold, 1)
    output_ranges = update_nonsilent_ranges(sound, nonsilent_ranges, keep_silence)
    dubs = split_on_given_nonsilent_ranges(sound, output_ranges)

    length = len(dubs)
    output('slice complete, got {} lines'.format(length))

    if previous == length:
        output('new silence has no change'.format(length))
        return previous

    mkdir(tempPath)

    localPath = process_path(out_path) + '\\' + 'Silence_' + str(silence)
    mkdir(localPath)

    output(Fore.LIGHTCYAN_EX + '====================')
    output(Fore.LIGHTCYAN_EX + 'output to folder {}'.format(localPath))
    output(Fore.LIGHTCYAN_EX + '====================')

    if progress != -1:
        outputProgress = progress.add_task("[cyan]output...", total=length)
    else:
        outputProgress = -1

    for index in range(length):
        def ms_to_output(millis, delimiter=":"):
            seconds, milliseconds = divmod(millis, 1000)
            minutes, seconds = divmod(seconds, 60)
            hours, minutes = divmod(minutes, 60)

            return "{}{}{}{}{}".format(hours, delimiter, minutes, delimiter, seconds)

            # if hours != 0:
            #     return "{}{}{}{}{}".format(hours, delimiter, minutes, delimiter, seconds)
            #
            # if minutes != 0:
            #     return "{}{}{}".format(minutes, delimiter, seconds)
            #
            # if seconds != 0:
            #     return "{}{}{}".format(seconds, delimiter, milliseconds)
            #
            # return "{}".format(milliseconds)

        timeStamp = output_ranges[index]
        timeStampStr = [ms_to_output(timeStamp[0], "'"), ms_to_output(timeStamp[1], "'")]
        audioSeg = dubs[index]

        # https://python3-cookbook.readthedocs.io/zh_CN/latest/c07/p07_capturing_variables_in_anonymous_functions.html
        updateOutName = lambda: fileNameFormat.format(fileNameCustomInfo, outputFormat,
                                                      silence, index,
                                                      timeStamp[0], timeStamp[1],
                                                      timeStampStr[0], timeStampStr[1])
        updateFullOut = lambda: localPath + '\\' + outName

        # outName = fileNameFormat.format(fileNameCustomInfo,
        #                                 outputFormat,
        #                                 silence, index)
        # fullOut = localPath + '/' + outName

        outName = updateOutName()
        fullOut = updateFullOut()

        output('exporting file {}'.format(outName))

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
                                              recognize_result, text,
                                              timeStamp[0], timeStamp[1],
                                              timeStampStr[0], timeStampStr[1])

            os.replace(fullOut, localPath + '\\' + outName)
            output(Fore.WHITE + Style.DIM + '  update file name to: {}'.format(outName))

        if progress != -1:
            progress.advance(outputProgress, advance=1)

    if progress != -1:
        progress.remove_task(outputProgress)

    output(Fore.LIGHTCYAN_EX + '====================')
    output(Fore.LIGHTCYAN_EX + 'output to folder {}'.format(localPath))
    output(Fore.LIGHTCYAN_EX + '====================')

    return length
