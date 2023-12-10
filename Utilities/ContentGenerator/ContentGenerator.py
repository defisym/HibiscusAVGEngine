import os

import argparse

from colorama import init, Fore

from Hibiscus.FileCopyer import copy_assets, copy_config
from Utilities.File import remove_tree

init(autoreset=True)

VERSION = '0.0.0'

print(Fore.LIGHTGREEN_EX + '====================================')
print(Fore.LIGHTGREEN_EX + 'ContentGenerator {}'.format(VERSION))
print(Fore.LIGHTGREEN_EX + '====================================')

# Init
# curPath = os.path.split(__file__)[0]
curPath = os.path.split(r"D:\Dev\Mobius\程序\ContentGenerator.bat")[0]
SteamCMDPath = curPath + r"\..\..\_Steamworks_SDK\tools\ContentBuilder\builder\steamcmd.exe"

# Settings
AppName = "Mobius"
Encrypter_Key = "MobiusBand*Steam"
ContentPath = curPath + r"\..\SteamWorks\_Content\MOBIUS BAND"

task: dict[str, [int, str]] = {
    "Demo": [2335270, curPath + r"\..\SteamWorks\_Script\app_build_2335270.vdf"],
    "Release": [2123380, curPath + r"\..\SteamWorks\_Script\app_build_2123380.vdf"]
}

parser = argparse.ArgumentParser(description='Upload to steam.')

parser.add_argument('')

remove_tree(ContentPath)
copy_assets(curPath, ContentPath)
copy_config(AppName, curPath, ContentPath)

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

# https://www.runoob.com/w3cnote/python3-subprocess.html
# https://docs.python.org/zh-cn/3.11/library/subprocess.html


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
