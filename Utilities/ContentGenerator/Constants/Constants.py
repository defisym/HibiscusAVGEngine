import os

import argparse

from Utilities.Ini import __python_read_ini

parser = argparse.ArgumentParser(description='Upload to steam.')

parser.add_argument('--userName', required=True)
parser.add_argument('--projectPath', required=True)
parser.add_argument('--setUpCI',
                    action='store_true')
parser.add_argument('--fullBuild',
                    action='store_true')
parser.add_argument('--uploadOnly',
                    action='store_true')

args = parser.parse_args()

# Init
projectPath = args.projectPath
scriptPath = os.path.split(__file__)[0]

# Config
configPath = projectPath + r'\config.ini'

# path
pathPrefix = ''
if __python_read_ini(configPath, 'Path', 'Relative') == '1':
    pathPrefix = projectPath
SteamCMDPath = pathPrefix + __python_read_ini(configPath, 'Path', 'SteamCMDPath')
EpicBPTPath = pathPrefix + __python_read_ini(configPath, 'Path', 'EpicBPTPath')
EpicCloudDir = pathPrefix + __python_read_ini(configPath, 'Path', 'EpicCloudDir')

ContentPath = pathPrefix + __python_read_ini(configPath, 'Path', 'ContentPath')

# Settings
AppName = __python_read_ini(configPath, 'Project', 'AppName')
Encrypter_Key = __python_read_ini(configPath, 'Project', 'Encrypter_Key')
