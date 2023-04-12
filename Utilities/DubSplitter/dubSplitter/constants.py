from enum import Enum

from .functions.path import script_path, user_path

scriptPath = script_path(__file__)
userPath = user_path()

defaultOutPath = scriptPath + '\\Out\\'

tempPath = scriptPath + '\\Temp\\'
tempFile = tempPath + 'temp.wav'


def update_path_core(base_path, description):
    global defaultOutPath, tempPath, tempFile

    # print('use {} path {} as base path '.format(description, base_path))

    defaultOutPath = base_path + '\\Out\\'
    tempPath = base_path + '\\Temp\\'


def update_path(is_package):
    global defaultOutPath, tempPath, tempFile

    if is_package:
        update_path_core(userPath + '\\DubSplitter', 'user')
        # print('use user path {} as base path '.format(userPath))
        #
        # defaultOutPath = userPath + '\\DubSplitter\\Out\\'
        # tempPath = userPath + '\\DubSplitter\\Temp\\'
    else:
        update_path_core(scriptPath, 'script')
        # print('use script path {} as base path '.format(scriptPath))
        #
        # defaultOutPath = scriptPath + '\\Out\\'
        # tempPath = scriptPath + '\\Temp\\'

    tempFile = tempPath + 'temp.wav'

    # print("default output path {}".format(defaultOutPath))
    # print("temp path {}".format(tempPath))


defaultWhisperPrompt = '简体中文'
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

defaultOutputFormat = 'ogg'
defaultFileNameFormat = '{2:0>4d}_{3:0>8d}.{1}'
defaultFileNameVRFormat = '{2:0>4d}_{3:0>8d}_{5}.{1}'
