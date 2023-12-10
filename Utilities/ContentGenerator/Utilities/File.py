import os
import shutil
from typing import Callable


def split_path(path: str) -> tuple:
    split = os.path.split(path)
    filepath = split[0]
    filename = split[1]
    ext = os.path.splitext(path)[1]

    return filepath, filename, ext


def iterate_path(path: str, callback: Callable[[str, str, str], None]):
    for root, ds, fs in os.walk(path):
        for f in fs:
            fullname = os.path.join(root, f)
            filepath, filename, ext = split_path(fullname)

            callback(fullname, filename, ext)


def remove_tree(path: str):
    if os.path.exists(path):
        shutil.rmtree(path)


def remove_file(path: str):
    if os.path.exists(path):
        os.remove(path)


def copy_tree(src: str, dst: str):
    if os.path.exists(src):
        shutil.copytree(src, dst, dirs_exist_ok=True)


def __copy_to_general(src: str, dst: str, callback: Callable[[str, str], None]):
    if os.path.exists(src):
        dstPath = os.path.split(dst)[0]
        # if len(os.path.splitext(dstPath)[1]) == 0:
        #     dstPath = dst[:dstPath.rfind("\\")]

        if not os.path.exists(dstPath):
            os.makedirs(dstPath)

        callback(src, dst)


# dst is a file name
def copy_to_file(src: str, dst: str):
    __copy_to_general(src, dst, shutil.copyfile)


# dst is a file name or path
def copy_to_path(src: str, dst: str):
    __copy_to_general(src, dst, shutil.copy)
