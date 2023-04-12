"""
voice recognition
"""
from colorama import Fore, Style

'''
whisper import
'''

import whisper
from whisper import Whisper

from ..constants import whisperModel, defaultWhisperModel, defaultWhisperLanguage, defaultWhisperPrompt

'''
speech_recognition import
'''

'''
import speech_recognition as sr
from pydub import AudioSegment

from functions.path import mkdir
from constants import tempPath, tempFile
'''

model: Whisper | None = None
modelPrompt: str = defaultWhisperPrompt
modelLanguage: str = defaultWhisperLanguage

'''
use whisper

https://github.com/openai/whisper
'''


# prompt
# https://platform.openai.com/docs/guides/speech-to-text/prompting
# https://github.com/openai/whisper/discussions/355
# https://github.com/openai/whisper/discussions/277
def update_model_prompt(prompt):
    global modelPrompt
    modelPrompt = prompt

    print(Fore.WHITE + Style.DIM + '  recognize prompt {}'.format(prompt))


def update_model_language(lang):
    global modelLanguage
    modelLanguage = lang

    print(Fore.WHITE + Style.DIM + '  recognize in language {}'.format(lang))


def get_whisper_model(model_name):
    for name, member in whisperModel.__members__.items():
        if model_name.lower() == name:
            return model_name.lower()

    print(Fore.RED + '  given model name not found, use \'base\' instead')

    return defaultWhisperModel


def update_whisper_model(model_name):
    global model

    # Model path (Windows)
    # C:\Users\[UserName]\.cache\whisper
    # Download links:
    # https://github.com/openai/whisper/discussions/63#discussioncomment-3798552
    actual_model_name = get_whisper_model(model_name)

    print(Fore.WHITE + Style.DIM + '  loading voice recognition model {}'.format(actual_model_name))
    model = whisper.load_model(actual_model_name)
    print(Fore.WHITE + Style.DIM + '  load complete')


def recognition_with_whisper(file):
    # model = whisper.load_model("base")
    # result = model.transcribe(file)

    if model is None:
        return 'InvalidModel'

    # Update options here
    result = model.transcribe(file,
                              fp16=False,
                              language=modelLanguage,
                              initial_prompt=modelPrompt)
    # print(result["text"])

    return result["text"]


'''
use speech_recognition (google)
'''

'''
def recognition_with_conversion(file):
    mkdir(tempPath)

    sound = AudioSegment.from_ogg(file)
    sound.export(tempFile, format='wav')

    return recognition()


def recognition():
    r = sr.Recognizer()
    with sr.AudioFile(tempFile) as src:
        audio = r.record(src)

    # recognize speech using Google Speech Recognition
    try:
        # for testing purposes, we're just using the default API key
        # to use another API key, use `r.recognize_google(audio, key="GOOGLE_SPEECH_RECOGNITION_API_KEY")`
        # instead of `r.recognize_google(audio)`
        result = r.recognize_google(audio, language="zh-CN")
        return result
        # print("Google Speech Recognition thinks you said " + result)
    except sr.UnknownValueError:
        # print("Google Speech Recognition could not understand audio")
        return ''
    except sr.RequestError as e:
        # print("Could not request results from Google Speech Recognition service; {0}".format(e))
        return ''
'''
