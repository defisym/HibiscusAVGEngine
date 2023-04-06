from enum import Enum

from Func.path import script_path

scriptPath = script_path(__file__)
defaultOutPath = scriptPath + '\\Out\\'

tempPath = scriptPath + '\\Temp\\'
tempFile = tempPath + 'temp.wav'

defaultWhisperLanguage = 'Chinese'

defaultWhisperModel = 'base'
whisperModel = Enum('WhisperModel',
                    (
                        'tiny',
                        'base',
                        'small',
                        'medium',
                        'large',
                    ))
