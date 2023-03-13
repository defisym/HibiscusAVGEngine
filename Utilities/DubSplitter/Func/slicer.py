from pydub.silence import split_on_silence

from Func.path import mkdir, process_path


def do_slice(sound, silence, out_path):
    print('slice audio by silence length {}'.format(silence))

    dubs = split_on_silence(sound, silence, -40, 100, 1)
    length = len(dubs)
    print('got {} lines'.format(length))

    localPath = process_path(out_path) + '/' + 'Silence_' + str(silence)
    mkdir(localPath)
    print('export to {}'.format(localPath))

    for index in range(length):
        outName = '{:0>4d}_{:0>8d}.ogg'.format(silence, index)
        print('exporting file {}'.format(outName))

        dubs[index].export(localPath + '/' + outName, format='ogg')
