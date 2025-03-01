import subprocess

from colorama import init, Fore

from Constants.Constants import projectPath, pathPrefix, SteamCMDPath, ContentPath, AppName, Encrypter_Key, args
from Hibiscus.FileCopyer import copy_assets, copy_config, copy_executable, copy_modules
from Hibiscus.FileLister import get_file_operation
from Platform.EpicUpload import epic_upload
from Platform.Platform import is_steam, set_platform, is_epic
from Utilities.DictHelper import load_from_file
from Utilities.Encrypter import encrypt_file, hash_file
from Utilities.File import remove_tree, iterate_path, remove_file, copy_to_file
from Utilities.Ini import set_ini

init(autoreset=True)

VERSION = '0.0.0'

print(Fore.LIGHTGREEN_EX + '====================================')
print(Fore.LIGHTGREEN_EX + 'ContentGenerator {}'.format(VERSION))
print(Fore.LIGHTGREEN_EX + '====================================')

# Tasks
build_tasks: dict[str, [int, str]] = load_from_file(projectPath + r'\tasks.json')

# user_name = input('Enter user name:')
user_name = args.userName

# https://partner.steamgames.com/doc/sdk/uploading#automating_steampipe
if args.setUpCI:
    password = input('Enter user password:')
    guard = input('Enter user guard:')

    subprocess.call("{} +login {} {} {} +info +quit".format(SteamCMDPath,
                                                            user_name, password, guard))

if not args.uploadOnly:
    if args.fullBuild:
        print(Fore.CYAN + 'Remove old content...')
        remove_tree(ContentPath)

        print(Fore.CYAN + 'generate new content...')

        print(Fore.BLUE + 'copy assets...')
        copy_assets(projectPath, ContentPath)

        print(Fore.BLUE + 'copy configs...')
        copy_config(AppName, projectPath, ContentPath)

        print(Fore.BLUE + 'encrypt assets...')
        iterate_path(ContentPath, lambda fullname, filename, ext: encrypt_file(fullname, Encrypter_Key))

        print(Fore.BLUE + 'copy modules...')
        copy_modules(AppName, projectPath, ContentPath)
    else:
        print(Fore.CYAN + 'Remove old content...')
        remove_tree(ContentPath + r"\Modules")
        remove_tree(ContentPath + r"\savings\_Global")

        print(Fore.CYAN + 'generate new content...')

        print(Fore.BLUE + 'calc diff...')
        fileToCopy, fileToRemove = get_file_operation(projectPath, ContentPath)

        print(Fore.BLUE + 'copy assets...')
        for file in fileToRemove:
            print("Removing {}...".format(file))
            remove_file(ContentPath + file)

        for file in fileToCopy:
            print("Copying {}...".format(file))
            copy_to_file(projectPath + file, ContentPath + file)

        print(Fore.BLUE + 'copy configs...')
        copy_config(AppName, projectPath, ContentPath)
        iterate_path(ContentPath + r"\savings\_Global",
                     lambda fullname, filename, ext: encrypt_file(fullname, Encrypter_Key))
        encrypt_file(ContentPath + r"\settings\settings_Dynamic.ini", Encrypter_Key)

        print(Fore.BLUE + 'encrypt assets...')
        for file in fileToCopy:
            encrypt_file(ContentPath + file, Encrypter_Key)

        print(Fore.BLUE + 'copy modules...')
        copy_modules(AppName, projectPath, ContentPath)

for task_name, task_content in build_tasks.items():
    platform, enable, app_id, script_path = task_content
    if not enable:
        continue

    print(Fore.CYAN + 'building {}...'.format(task_name))

    script_path = pathPrefix + script_path
    exe_path = "{}\\{}.exe".format(ContentPath, AppName)

    # copy
    print(Fore.BLUE + 'copy executable...')
    copy_executable(AppName, projectPath, ContentPath)
    print(Fore.BLUE + 'set platform...')
    set_platform(ContentPath, platform)

    # drm
    print(Fore.BLUE + 'drm...')
    if is_steam(platform):
        subprocess.call("{} +login {} +drm_wrap {} \"{}\" \"{}\" drmtoolp 0 +quit".format(SteamCMDPath,
                                                                                          user_name, app_id, exe_path,
                                                                                          exe_path))

    # update configs
    print(Fore.BLUE + 'update configs...')
    exeHash = hash_file("{}\\{}.exe".format(ContentPath, AppName))
    set_ini("\"{}\\settings\\settings.ini\"".format(ContentPath), "System", "ExeHash", exeHash)
    set_ini("\"{}\\settings\\settings_Template.ini\"".format(ContentPath), "System", "ExeHash", exeHash)

    datHash = hash_file("{}\\{}.dat".format(ContentPath, AppName))
    set_ini("\"{}\\settings\\settings.ini\"".format(ContentPath), "System", "DatHash", datHash)
    set_ini("\"{}\\settings\\settings_Template.ini\"".format(ContentPath), "System", "DatHash", datHash)

    encrypt_file(ContentPath + r"\settings\settings.ini", Encrypter_Key)
    encrypt_file(ContentPath + r"\settings\settings_Template.ini", Encrypter_Key)

    # drm
    print(Fore.BLUE + 'upload...')
    if is_steam(platform):
        subprocess.call("{} +login {} +run_app_build \"{}\" +quit".format(SteamCMDPath,
                                                                          user_name, script_path))
    if is_epic(platform):
        epic_upload()

    print(Fore.CYAN + 'building {} complete'.format(task_name))
