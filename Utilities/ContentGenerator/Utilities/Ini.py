import os
import configparser
import subprocess

curPath = os.path.split(__file__)[0]
Settings_CLI = curPath + r'\..\External\Settings_CLI.exe'


def set_ini(filename: str, section: str, item: str, value: str):
    return subprocess.call(
        "{} -f {} --unicode --section {} --item {} --value {}".format(Settings_CLI, filename, section, item, value))


# disable auto conversion
class ConfigParser(configparser.ConfigParser):
    def __init__(self, defaults=None):
        configparser.ConfigParser.__init__(self, defaults=None)

    def optionxform(self, option):
        return option


def __python_set_ini(filename: str, section: str, item: str, value: str):
    config = ConfigParser()
    config.read_file(open(filename, 'r', encoding='utf-8'))
    config[section][item] = value
    with open(filename, 'w') as f:
        config.write(f)


def __python_read_ini(filename: str, section: str, item: str):
    config = ConfigParser()
    config.read_file(open(filename, 'r', encoding='utf-8'))
    return config[section][item]
