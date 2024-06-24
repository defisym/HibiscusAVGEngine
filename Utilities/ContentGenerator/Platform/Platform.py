import os

from Utilities.File import remove_tree
from Utilities.Ini import set_ini, ConfigParser


def set_platform(content_path, platform):
    set_ini("\"{}\\settings\\settings.ini\"".format(content_path), "PlatformSettings", "Platform", platform)
    set_ini("\"{}\\settings\\settings_Template.ini\"".format(content_path), "PlatformSettings", "Platform", platform)

    PlatformFolder = content_path + r"\Platform"
    remove_tree(PlatformFolder)
    os.mkdir(PlatformFolder)

    config = ConfigParser()
    config.read_file(open("{}\\settings\\settings.ini".format(content_path), 'r', encoding='utf-8'))

    for item in config["PlatformSupport"]:
        if item == platform:
            continue

        disable_filename = "{}\\No{}".format(PlatformFolder, item)
        with open(disable_filename, 'w') as f:
            f.write(platform)


def is_steam(platform):
    return platform == "Steam"


def is_epic(platform):
    return platform == "Epic"
