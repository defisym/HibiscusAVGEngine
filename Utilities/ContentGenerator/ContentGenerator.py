import os
import subprocess
import argparse

from colorama import init, Fore

from Hibiscus.FileCopyer import copy_assets, copy_config, copy_executable, copy_modules
from Hibiscus.FileLister import get_file_operation
from Utilities.Encrypter import encrypt_file, hash_file
from Utilities.File import remove_tree, iterate_path, remove_file, copy_to_file, copy_to_path
from Utilities.Ini import set_ini

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

build_tasks: dict[str, [int, str]] = {
    # "Demo": [2335270, curPath + r"\..\SteamWorks\_Script\app_build_2335270.vdf"],
    "Release": [2123380, curPath + r"\..\SteamWorks\_Script\app_build_2123380.vdf"]
}

parser = argparse.ArgumentParser(description='Upload to steam.')

parser.add_argument('--userName', required=True)
parser.add_argument('--setUpCI',
                    action='store_true')
parser.add_argument('--fullBuild',
                    action='store_true')

args = parser.parse_args()

# user_name = input('Enter user name:')
user_name = args.userName

# https://partner.steamgames.com/doc/sdk/uploading#automating_steampipe
if args.setUpCI:
    password = input('Enter user password:')
    guard = input('Enter user guard:')

    subprocess.call("{} +login {} {} {} +info +quit".format(SteamCMDPath,
                                                            user_name, password, guard))

if args.fullBuild:
    print('Remove old content...')
    remove_tree(ContentPath)

    print('generate new content...')

    print('copy assets...')
    copy_assets(curPath, ContentPath)

    print('copy configs...')
    copy_config(AppName, curPath, ContentPath)

    print('encrypt assets...')
    iterate_path(ContentPath, lambda fullname, filename, ext: encrypt_file(fullname, Encrypter_Key))

    print('copy modules...')
    copy_modules(AppName, curPath, ContentPath)
else:
    print('Remove old content...')
    remove_tree(ContentPath + r"\Modules")
    remove_tree(ContentPath + r"\savings\_Global")

    print('generate new content...')

    print('calc diff...')
    fileToCopy, fileToRemove = get_file_operation(curPath, ContentPath)

    print('copy assets...')
    for file in fileToRemove:
        remove_file(ContentPath + file)

    for file in fileToCopy:
        copy_to_path(curPath + file, ContentPath + file)

    print('copy configs...')
    copy_config(AppName, curPath, ContentPath)

    print('encrypt assets...')
    # content
    iterate_path(ContentPath + r"\savings\_Global",
                 lambda fullname, filename, ext: encrypt_file(fullname, Encrypter_Key))
    encrypt_file(ContentPath + r"\settings\settings_Dynamic.ini", Encrypter_Key)

    # assets
    for file in fileToCopy:
        encrypt_file(ContentPath + file, Encrypter_Key)

    print('copy modules...')
    copy_modules(AppName, curPath, ContentPath)

for task_name, task_content in build_tasks.items():
    print('building {}...'.format(task_name))

    app_id, script_path = task_content
    exe_path = "{}\\{}.exe".format(ContentPath, AppName)

    # copy
    copy_executable(AppName, curPath, ContentPath)

    # drm
    print('drm...')
    subprocess.call("{} +login {} +drm_wrap {} {} {} drmtoolp 0 +quit".format(SteamCMDPath,
                                                                              user_name, app_id, exe_path, exe_path))

    # update configs
    print('update configs...')
    exeHash = hash_file("{}\\{}.exe".format(ContentPath, AppName))
    set_ini("\"{}\\settings\\settings.ini\"".format(ContentPath), "System", "ExeHash", exeHash)
    set_ini("\"{}\\settings\\settings_Template.ini\"".format(ContentPath), "System", "ExeHash", exeHash)

    datHash = hash_file("{}\\{}.dat".format(ContentPath, AppName))
    set_ini("\"{}\\settings\\settings.ini\"".format(ContentPath), "System", "DatHash", datHash)
    set_ini("\"{}\\settings\\settings_Template.ini\"".format(ContentPath), "System", "DatHash", datHash)

    encrypt_file(ContentPath + r"\settings\settings.ini", Encrypter_Key)
    encrypt_file(ContentPath + r"\settings\settings_Template.ini", Encrypter_Key)

    # drm
    print('upload...')
    subprocess.call("{} +login {} +run_app_build {} +quit".format(SteamCMDPath,
                                                                  user_name, script_path))

    print('building {} complete'.format(task_name))
