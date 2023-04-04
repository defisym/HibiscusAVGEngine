import json

import speech_recognition as sr
from pydub import AudioSegment

from Func.path import mkdir
from constants import tempPath, tempFile

import whisper

print('Loading voice recognition model')

model = whisper.load_model("base")


def recognition_with_whisper(file):
    # model = whisper.load_model("base")
    # result = model.transcribe(file)
    # Update options here
    result = model.transcribe(file, fp16=False, language='Chinese')
    # print(result["text"])

    return result["text"]


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
