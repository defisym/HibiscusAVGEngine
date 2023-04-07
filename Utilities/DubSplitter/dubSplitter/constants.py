from enum import Enum

from .functions.path import script_path, user_path

scriptPath = script_path(__file__)
userPath = user_path()

defaultOutPath = scriptPath + '\\Out\\'

tempPath = scriptPath + '\\Temp\\'
tempFile = tempPath + 'temp.wav'


def update_path(is_package):
    global defaultOutPath, tempPath, tempFile

    if is_package:
        print('use user path {}'.format(userPath))

        defaultOutPath = userPath + '\\DubSplitter\\Out\\'
        tempPath = userPath + '\\DubSplitter\\Temp\\'
    else:
        print('use script path {}'.format(scriptPath))

        defaultOutPath = scriptPath + '\\Out\\'
        tempPath = scriptPath + '\\Temp\\'

    tempFile = tempPath + 'temp.wav'

    print(defaultOutPath)
    print(tempPath)
    print(tempFile)


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
