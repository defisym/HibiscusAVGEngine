import os


def process_path(path):
    return path.strip().rstrip('\\').rstrip('/')


def mkdir(path):
    path = process_path(path)
    bExist = os.path.exists(path)

    if not bExist:
        os.makedirs(path)