from Hibiscus.FileLister import get_assets_list, update_assets_hash
from Utilities.File import copy_tree, copy_to_path, copy_to_file


def copy_modules(app_name: str, project_base_path: str, content_base_path: str):
    copy_tree(project_base_path + r"\Modules", content_base_path + r"\Modules")


def copy_executable(app_name: str, project_base_path: str, content_base_path: str):
    copy_to_path("{}\\{}.dat".format(project_base_path, app_name), content_base_path)
    copy_to_path("{}\\{}.exe".format(project_base_path, app_name), content_base_path)

    copy_to_file(project_base_path + r"\settings\settings_Template.ini", content_base_path + r"\settings\settings.ini")
    copy_to_file(project_base_path + r"\settings\settings_Template.ini",
                 content_base_path + r"\settings\settings_Template.ini")


def copy_config(app_name: str, project_base_path: str, content_base_path: str):
    copy_to_file(project_base_path + r"\savings\_Global\_Cache_Template",
                 content_base_path + r"\savings\_Global\_Cache")
    copy_to_file(project_base_path + r"\savings\_Global\_GlobalProgress_Template",
                 content_base_path + r"\savings\_Global\_GlobalProgress")
    copy_to_file(project_base_path + r"\savings\_Global\Appreciation_Definition_Template",
                 content_base_path + r"\savings\_Global\Appreciation_Definition")
    copy_to_file(project_base_path + r"\savings\_Global\Appreciation_Progress_Template",
                 content_base_path + r"\savings\_Global\Appreciation_Progress")
    copy_to_file(project_base_path + r"\savings\_Global\Data_Template.sav",
                 content_base_path + r"\savings\_Global\Data_Template.sav")

    copy_to_file(project_base_path + r"\settings\settings_Dynamic.ini",
                 content_base_path + r"\settings\settings_Dynamic.ini")
    copy_tree(project_base_path + r"\localization", content_base_path + r"\localization")


def copy_assets(project_base_path: str, content_base_path: str):
    fileList = get_assets_list(project_base_path)

    for file in fileList:
        print("Copying {}...".format(file))
        copy_to_file(project_base_path + file, content_base_path + file)

    update_assets_hash(project_base_path, fileList)
