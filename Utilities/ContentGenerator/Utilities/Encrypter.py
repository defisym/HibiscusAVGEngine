import os
import subprocess

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


def hash_file(filename: str):
    ret = subprocess.run([Encrypter_CLI, "-f", filename, "--hash"],
                         capture_output=True, text=True)

    if ret.returncode == 0:
        return ret.stdout
    else:
        return "Error !"
