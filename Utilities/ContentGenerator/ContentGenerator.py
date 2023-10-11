import os
import shlex
import shutil
import subprocess

import argparse

from colorama import init, Fore, Style
from sympy import false, true

init(autoreset=True)

VERSION = '0.0.0'

print(Fore.LIGHTGREEN_EX + '====================================')
print(Fore.LIGHTGREEN_EX + 'ContentGenerator {}'.format(VERSION))
print(Fore.LIGHTGREEN_EX + '====================================')

# Init
# curPath = os.path.split(__file__)[0]
curPath = os.path.split(r"D:\Dev\Mobius\程序\ContentGenerator.bat")[0]
SteamCMDPath = curPath + r"\..\..\_Steamworks_SDK\tools\ContentBuilder\builder\steamcmd.exe"
Encrypter_CLI = curPath + r"\..\..\HibiscusAVGEngine\Utilities\Encrypter_CLI\Encrypter_CLI.exe"
Settings_CLI = curPath + r"\..\..\HibiscusAVGEngine\Utilities\Settings_CLI\Settings_CLI.exe"

# Settings
AppName = "Mobius"
Encrypter_Key = "MobiusBand*Steam"
ContentPath = curPath + r"\..\SteamWorks\_Content\MOBIUS BAND"

# # Release
# APPID = 2123380
# ScriptPath = curPath + r"\..\SteamWorks\_Script\app_build_2123380.vdf"

# Demo
APPID = 2335270
ScriptPath = curPath + r"\..\SteamWorks\_Script\app_build_2335270.vdf"

parser = argparse.ArgumentParser(description='Upload to steam.')


def iterate(path, callback):
    for root, ds, fs in os.walk(path):
        for f in fs:
            fullname = os.path.join(root, f)
            filename = os.path.split(fullname)[1]
            ext = os.path.splitext(filename)[1]

            callback(fullname, filename, ext)


def remove_tree(path):
    if os.path.exists(path):
        shutil.rmtree(path)


def remove_file(path):
    if os.path.exists(path):
        os.remove(path)


def copy_tree(src, dst):
    if os.path.exists(src):
        shutil.copytree(src, dst)


def copy_file(src, dst):
    if os.path.exists(src):
        dstPath = os.path.split(dst)[0]
        # if len(os.path.splitext(dstPath)[1]) == 0:
        #     dstPath = dst[:dstPath.rfind("\\")]

        if not os.path.exists(dstPath):
            os.mkdir(dstPath)

        shutil.copyfile(src, dst)


def copy(src, dst):
    if os.path.exists(src):
        dstPath = os.path.split(dst)[0]
        # if len(os.path.splitext(dstPath)[1]) == 0:
        #     dstPath = dst[:dstPath.rfind("\\")]

        if not os.path.exists(dstPath):
            os.mkdir(dstPath)

        shutil.copy(src, dst)


#
#
# print(Fore.LIGHTCYAN_EX + '====================')
# print(Fore.LIGHTCYAN_EX + 'Remove old content...')
# print(Fore.LIGHTCYAN_EX + '====================')
#
# remove_tree(ContentPath)
#
# print(Fore.LIGHTCYAN_EX + '====================')
# print(Fore.LIGHTCYAN_EX + 'Generate new content')
# print(Fore.LIGHTCYAN_EX + '====================')
#
# copy_tree(curPath + r"\data", ContentPath + r"\data")
# copy_tree(curPath + r"\savings\_Sys", ContentPath + r"\savings\_Sys")
#
# copy_file(curPath + r"\savings\_Global\_Cache_Template", ContentPath + r"\savings\_Global\_Cache")
# copy_file(curPath + r"\savings\_Global\_GlobalProgress_Template",
#           ContentPath + r"\savings\_Global\_GlobalProgress")
# copy_file(curPath + r"\savings\_Global\Appreciation_Definition_Template",
#           ContentPath + r"\savings\_Global\Appreciation_Definition")
# copy_file(curPath + r"\savings\_Global\Appreciation_Progress_Template",
#           ContentPath + r"\savings\_Global\Appreciation_Progress")
# copy_file(curPath + r"\savings\_Global\Data_Template.sav",
#           ContentPath + r"\savings\_Global\Data_Template.sav")
#
# copy_file(curPath + r"\settings\settings_Template.ini", ContentPath + r"\settings\settings.ini")
# copy_file(curPath + r"\settings\settings_Template.ini", ContentPath + r"\settings\settings_Template.ini")
# copy_file(curPath + r"\settings\settings_Dynamic.ini", ContentPath + r"\settings\settings_Dynamic.ini")
#
# copy_tree(curPath + r"\Modules", ContentPath + r"\Modules")
# copy_tree(curPath + r"\localization", ContentPath + r"\localization")
#
# copy("{}\\{}.dat".format(curPath, AppName), ContentPath)
# copy("{}\\{}.exe".format(curPath, AppName), ContentPath)
#
# print(Fore.LIGHTCYAN_EX + '====================')
# print(Fore.LIGHTCYAN_EX + 'Remove temp files')
# print(Fore.LIGHTCYAN_EX + '====================')
#
# remove_file(ContentPath + r"\.gitignore")
#
# remove_file(ContentPath + r"\NOENCRYPT")
# remove_file(ContentPath + r"\_HWDECODE")
#
# remove_file(ContentPath + r"\Application resizing errors.txt")
#
# remove_file(ContentPath + r"\steam_appid.txt")
#
# remove_file(ContentPath + r"\ContentGenerator.bat")
# remove_file(ContentPath + r"\ContentGenerator.py")
#
# remove_file(ContentPath + r"\Publish.bat")
# remove_file(ContentPath + r"\Publish.py")
#
#
# def remover(fullname, filename, ext):
#     if filename.lower() == "ReadMe.md".lower():
#         remove_file(fullname)
#
#     if ext.lower() == ".file".lower():
#         remove_file(fullname)
#     if ext.lower() == ".mfa".lower():
#         remove_file(fullname)
#     if ext.lower() == ".001".lower():
#         remove_file(fullname)
#
#
# iterate(ContentPath, remover)
#
# remove_tree(ContentPath + r"\data\_MFAs")
# remove_tree(ContentPath + r"\data\Assets\__Movies")
# remove_tree(ContentPath + r"\data\dialogue\_External")
# remove_tree(ContentPath + r"\data\dialogue\_Test")
# remove_tree(ContentPath + r"\data\dialogue\_Template")
# remove_tree(ContentPath + r"\data\dialogue\__Merged")
# remove_tree(ContentPath + r"\data\dialogue\__Old")
# remove_tree(ContentPath + r"\data\dialogue\.vscode")
#
# remove_tree("{}\\{}_Text".format(ContentPath, AppName))
#
# print(Fore.LIGHTCYAN_EX + '====================')
# print(Fore.LIGHTCYAN_EX + 'Encrypt files')
# print(Fore.LIGHTCYAN_EX + '====================')
#
#
def encrypt_file(file):
    if os.path.exists(file):
        status = subprocess.call("{} -f \"{}\" --encrypt --key {}".format(Encrypter_CLI, file, Encrypter_Key))

        # success
        return status == 0
    else:
        return false
#
#
# encrypt_file(ContentPath + r"\settings\settings_Dynamic.ini")
#
# iterate(ContentPath + r"\data\Assets", lambda fullname, filename, ext: encrypt_file(fullname))
# iterate(ContentPath + r"\data\audio", lambda fullname, filename, ext: encrypt_file(fullname))
# iterate(ContentPath + r"\data\dialogue", lambda fullname, filename, ext: encrypt_file(fullname))
# iterate(ContentPath + r"\data\Graphics", lambda fullname, filename, ext: encrypt_file(fullname))
#
# iterate(ContentPath + r"\savings\_Global", lambda fullname, filename, ext: encrypt_file(fullname))
# iterate(ContentPath + r"\savings\_Sys", lambda fullname, filename, ext: encrypt_file(fullname))
# iterate(ContentPath + r"\localization", lambda fullname, filename, ext: encrypt_file(fullname))

print(Fore.LIGHTCYAN_EX + '====================')
print(Fore.LIGHTCYAN_EX + 'Steam DRM')
print(Fore.LIGHTCYAN_EX + '====================')

# subprocess.call(SteamCMDPath)
# steam = subprocess.Popen(SteamCMDPath)
# steam.stdin.write("login defisym".encode('utf8'))

print(Fore.LIGHTCYAN_EX + '====================')
print(Fore.LIGHTCYAN_EX + 'Hash')
print(Fore.LIGHTCYAN_EX + '====================')


def hash_file(filename):
    ret = subprocess.run([Encrypter_CLI, "-f", filename, "--hash"],
                         capture_output=True, text=True)

    if ret.returncode == 0:
        return ret.stdout
    else:
        return "Error !"


def set_ini(filename, section, item, value):
    return subprocess.call(
        "{} -f {} --unicode --section {} --item {} --value {}".format(Settings_CLI, filename, section, item, value))


# exeHash = hash_file("{}\\{}.exe".format(ContentPath, AppName))
# set_ini("\"{}\\settings\\settings.ini\"".format(ContentPath), "System", "ExeHash", exeHash)
# set_ini("\"{}\\settings\\settings_Template.ini\"".format(ContentPath), "System", "ExeHash", exeHash)
#
# datHash = hash_file("{}\\{}.dat".format(ContentPath, AppName))
# set_ini("\"{}\\settings\\settings.ini\"".format(ContentPath), "System", "DatHash", datHash)
# set_ini("\"{}\\settings\\settings_Template.ini\"".format(ContentPath), "System", "DatHash", datHash)
#
# encrypt_file(ContentPath + r"\settings\settings.ini")
# encrypt_file(ContentPath + r"\settings\settings_Template.ini")

print(Fore.LIGHTCYAN_EX + '====================')
print(Fore.LIGHTCYAN_EX + 'Steam Upload')
print(Fore.LIGHTCYAN_EX + '====================')
