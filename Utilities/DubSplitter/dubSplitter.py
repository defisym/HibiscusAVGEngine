import argparse

from pydub import AudioSegment
from sympy import false

from Func.slicer import do_slice
from Func.voiceRecognition import update_whisper_model, update_model_language
from constants import defaultOutPath

# -f "F:/DEV/Mobius/资产/语音/干音/丽丽娅干音.wav" -s 400
# -f "F:\DEV\Mobius\资产\语音\基利尔\01_初\干音\初.wav" -o "F:\DEV\Mobius\资产\语音\基利尔\01_初\Out" -s 800 -r 400

# https://docs.python.org/zh-cn/3.6/library/argparse.html
parser = argparse.ArgumentParser(description='Slice dubs.')

parser.add_argument('-f', '--fileName',
                    help='file to process')
parser.add_argument('-o', '--outFilePath',
                    help='output folder, if not set, will use script path + \\Out\\')
parser.add_argument('-s', '--silence',
                    help='silence time, in ms, default is 1000ms. ',
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

inName = args.fileName
outPath = defaultOutPath if args.outFilePath is None else args.outFilePath

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
