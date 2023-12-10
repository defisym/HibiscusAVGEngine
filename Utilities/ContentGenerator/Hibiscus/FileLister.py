from Utilities.DictHelper import load_from_file, save_to_file
from Utilities.Encrypter import hash_file
from Utilities.File import iterate_path, split_path


# return relative path
def file_lister(project_base_path: str, relative_path: str):
    fileList: list[str] = []
    base_path_len = len(project_base_path)
    iterate_path(project_base_path + relative_path,
                 lambda fullname, filename, ext: fileList.append(fullname[base_path_len:]))

    return fileList


def file_filter(file_list: list[str]):
    def filter_function(file_path):
        filepath, filename, ext = split_path(file_path)

        if filename.lower() == "ReadMe.md".lower():
            return False

        if ext.lower() == ".file".lower():
            return False
        if ext.lower() == ".mfa".lower():
            return False
        if ext.lower() == ".001".lower():
            return False

        if filepath.lower() == r"\data\_MFAs".lower():
            return False
        if filepath.lower() == r"\data\Assets\__Movies".lower():
            return False
        if filepath.lower() == r"\data\dialogue\_External".lower():
            return False
        if filepath.lower() == r"\data\dialogue\_Test".lower():
            return False
        if filepath.lower() == r"\data\dialogue\_Template".lower():
            return False
        if filepath.lower() == r"\data\dialogue\__Merged".lower():
            return False
        if filepath.lower() == r"\data\dialogue\__Old".lower():
            return False
        if filepath.lower() == r"\data\dialogue\.vscode".lower():
            return False

        return True

    return list(filter(filter_function, file_list))


def get_assets_list(project_base_path: str):
    fileList: list[str] = []
    fileList.extend(file_lister(project_base_path, r'\data'))
    fileList.extend(file_lister(project_base_path, r'\savings\_Sys'))

    fileList = file_filter(fileList)

    return fileList


def get_file_operation(project_base_path: str, content_base_path: str):
    fileList = get_assets_list(project_base_path)
    fileToCopy = fileList.copy()
    fileToRemove: list[str] = []

    # calculate hash
    fileHash: dict[str, str] = {}

    for file in fileList:
        fileHash[file] = hash_file(project_base_path + file)

    # load hash
    hash_path = project_base_path + r'\FileHash.hash'
    oldHash = load_from_file(hash_path)

    # update file list
    for old_file in oldHash.keys():
        new_hash = fileHash.get(old_file)

        # file that doesn't exist in new version
        if fileHash.get(old_file) is None:
            fileToRemove.append(old_file)
        # file that not changed
        elif oldHash.get(old_file) == new_hash:
            fileToCopy.remove(old_file)

    # save hash
    save_to_file(fileHash, hash_path)

    return fileToCopy, fileToRemove
