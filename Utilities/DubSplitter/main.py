from pydub import AudioSegment
from pydub.silence import split_on_silence

from path import process_path, mkdir

inName = "F:/DEV/Mobius/资产/语音/干音/丽丽娅干音.wav"
outPath = "F:/DEV/Mobius/资产/语音/Out/"

sound = AudioSegment.from_wav(inName)

# for i in range(4, 12):
for i in range(12, 18):
    silence = i * 100
    dubs = split_on_silence(sound, silence, -40, 100, 1)
    length = len(dubs)

    localPath = process_path(outPath) + '/' + 'Silence_' + str(silence)
    mkdir(localPath)

    for index in range(length):
        outName = localPath + '/' + str(silence) + '_' + str(index) + '.ogg'
        print(outName)

        dubs[index].export(outName, format='ogg')
