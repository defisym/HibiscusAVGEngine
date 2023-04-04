import os

from pydub.silence import split_on_silence

from Func.path import mkdir, process_path, invalid_file_character_escape
from Func.voiceRecognition import recognition_with_whisper
from constants import tempPath


def do_slice(sound, silence, out_path):
    print('slice audio by silence length {}'.format(silence))

    dubs = split_on_silence(sound, silence, -40, 100, 1)
    length = len(dubs)
    print('got {} lines'.format(length))

    mkdir(tempPath)

    localPath = process_path(out_path) + '/' + 'Silence_' + str(silence)
    mkdir(localPath)
    print('export to {}'.format(localPath))

    for index in range(length):
        outName = '{:0>4d}_{:0>8d}'.format(silence, index)
        print('exporting file {}'.format(outName))

        audioSeg = dubs[index]

        fullOutNoSuffix = localPath + '/' + outName
        fullOut = fullOutNoSuffix + '.ogg'

        audioSeg.export(fullOut, format='ogg')

        print('  voice recognizing...')
        text = recognition_with_whisper(fullOut)

        print('  recognize result: {}'.format(text))

        textLen = 10

        text = text[:textLen] + '……' if len(text) > textLen else text
        text = invalid_file_character_escape(text)
        outName = outName + '_' + text + '.ogg'

        print('  Update file name to: {}'.format(outName))
        os.rename(fullOut, localPath + '/' + outName)
