import os
import subprocess
import hashlib

from sympy import false

curPath = os.path.split(__file__)[0]
Encrypter_CLI = curPath + r'\..\External\Encrypter_CLI.exe'


def encrypt_file(file: str, key: str):
    if os.path.exists(file):
        status = subprocess.call("{} -f \"{}\" --encrypt --key {}".format(Encrypter_CLI, file, key))

        # success
        return status == 0
    else:
        return false


def __cli_hash(filename: str):
    ret = subprocess.run([Encrypter_CLI, "-f", filename, "--hash"],
                         capture_output=True, text=True)

    if ret.returncode == 0:
        return ret.stdout
    else:
        return "Error !"


def __python_hash(filename: str):
    if os.path.exists(filename):
        hash_method = hashlib.md5()

        with open(filename, 'rb') as f:
            while binary := f.read(8192):
                hash_method.update(binary)
        return hash_method.hexdigest()
    else:
        return "Error !"


def hash_file(filename: str):
    return __python_hash(filename)
