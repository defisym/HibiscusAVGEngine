import os


# https://cloud.tencent.com/developer/article/1566632
def script_path(file):
    return os.path.split(file)[0]


def process_path(path):
    return path.strip().rstrip('\\').rstrip('/')


def mkdir(path):
    path = process_path(path)
    bExist = os.path.exists(path)

    if not bExist:
        os.makedirs(path)


def invalid_file_character_escape(file):
    invalidChars = ['\\', '/', '*', '?', '<', '>', '|']
    fileStr: str = file

    for char in invalidChars:
        fileStr = fileStr.replace(char, '_')

    return fileStr


def user_path():
    return os.path.expanduser('~')