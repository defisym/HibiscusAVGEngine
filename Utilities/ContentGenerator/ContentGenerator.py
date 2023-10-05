import os
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


def remove_tree(path):
    if os.path.exists(path):
        shutil.rmtree(path)


def remove_file(path):
    if os.path.exists(path):
        os.remove(path)


def copy_tree(src, dst):
    if os.path.exists(src):
        shutil.copytree(src, dst)


def copy_file(path, dst):
    if os.path.exists(path):
        shutil.copyfile(path, dst)


def copy(path, dst):
    if os.path.exists(path):
        shutil.copy(path, dst)


print(Fore.LIGHTCYAN_EX + '====================')
print(Fore.LIGHTCYAN_EX + 'Remove old content...')
print(Fore.LIGHTCYAN_EX + '====================')

remove_tree(ContentPath)

print(Fore.LIGHTCYAN_EX + '====================')
print(Fore.LIGHTCYAN_EX + 'Generate new content')
print(Fore.LIGHTCYAN_EX + '====================')

copy_tree(curPath + r"\data", ContentPath + r"\data")
copy_tree(curPath + r"\savings\_Sys", ContentPath + r"\savings\_Sys")

copy_file(curPath + r"\savings\_Global\_Cache_Template", ContentPath + r"\savings\_Global\_Cache")
copy_file(curPath + r"\savings\_Global\_GlobalProgress_Template",
          ContentPath + r"\savings\_Global\_GlobalProgress")
copy_file(curPath + r"\savings\_Global\Appreciation_Definition_Template",
          ContentPath + r"\savings\_Global\Appreciation_Definition")
copy_file(curPath + r"\savings\savings\_Global\Appreciation_Progress_Template",
          ContentPath + r"\_Global\Appreciation_Progress")
copy_file(curPath + r"\savings\savings\_Global\Data_Template.sav",
          ContentPath + r"\savings\_Global\Data_Template.sav")

copy_file(curPath + r"\settings\settings_Template.ini", ContentPath + r"\settings\settings.ini")
copy_file(curPath + r"\settings\settings_Template.ini", ContentPath + r"\settings\settings_Template.ini")
copy_file(curPath + r"\settings\settings_Dynamic.ini", ContentPath + r"\settings\settings_Dynamic.ini")

copy_tree(curPath + r"\Modules", ContentPath + r"\Modules")
copy_tree(curPath + r"\localization", ContentPath + r"\localization")

copy("{}\\{}.dat".format(curPath, AppName), ContentPath)
copy("{}\\{}.exe".format(curPath, AppName), ContentPath)

print(Fore.LIGHTCYAN_EX + '====================')
print(Fore.LIGHTCYAN_EX + 'Remove temp files')
print(Fore.LIGHTCYAN_EX + '====================')

remove_file(ContentPath + r"\.gitignore")

remove_file(ContentPath + r"\NOENCRYPT")
remove_file(ContentPath + r"\_HWDECODE")

remove_file(ContentPath + r"\Application resizing errors.txt")

remove_file(ContentPath + r"\steam_appid.txt")

remove_file(ContentPath + r"\ContentGenerator.bat")
remove_file(ContentPath + r"\ContentGenerator.py")

remove_file(ContentPath + r"\Publish.bat")
remove_file(ContentPath + r"\Publish.py")

for root, ds, fs in os.walk(ContentPath):
    for f in fs:
        fullname = os.path.join(root, f)
        filename = os.path.split(fullname)[1]
        ext = os.path.splitext(filename)[1]

        if filename.lower() == "ReadMe.md".lower():
            remove_file(fullname)

        if ext.lower() == "file".lower():
            remove_file(fullname)
        if ext.lower() == "mfa".lower():
            remove_file(fullname)
        if ext.lower() == "001".lower():
            remove_file(fullname)

remove_tree(ContentPath + r"\data\_MFAs")
remove_tree(ContentPath + r"\data\Assets\__Movies")
remove_tree(ContentPath + r"\data\dialogue\_External")
remove_tree(ContentPath + r"\data\dialogue\_Test")
remove_tree(ContentPath + r"\data\dialogue\_Template")
remove_tree(ContentPath + r"\data\dialogue\__Merged")
remove_tree(ContentPath + r"\data\dialogue\__Old")
remove_tree(ContentPath + r"\data\dialogue\.vscode")

remove_tree("{}\\{}_Text".format(curPath, AppName))

print(Fore.LIGHTCYAN_EX + '====================')
print(Fore.LIGHTCYAN_EX + 'Encrypt files')
print(Fore.LIGHTCYAN_EX + '====================')
