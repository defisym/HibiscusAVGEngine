# -OrganizationId="<YourOrg>"-ProductId="<YourProduct>"-ArtifactId="<YourArtifact>"-ClientId="<YourClientId>"-ClientSecretEnvVar="<YourSecretEnvVar>"-mode=UploadBinary-BuildRoot="<LocationOfLocalBuild>"-CloudDir="<YourCloudDir>"-BuildVersion="<YourBuildVersion>"-AppLaunch="<AppToRun>"-AppArgs="<LaunchArguments>


import subprocess

from Constants.Constants import configPath, EpicBPTPath, EpicCloudDir, ContentPath, AppName
from Utilities.Ini import __python_read_ini, __python_set_ini, set_ini


def epic_upload():
    def add_param(param, content):
        return ' -{}={}'.format(param, content)

    # ---------
    # General Param
    # ---------
    BPTParamGeneral = ''

    # basic
    BPTParamGeneral += add_param('ClientId', __python_read_ini(configPath, 'Epic', 'ClientId'))
    BPTParamGeneral += add_param('ClientSecret', __python_read_ini(configPath, 'Epic', 'ClientSecret'))

    # organization
    BPTParamGeneral += add_param('OrganizationID', __python_read_ini(configPath, 'Epic', 'OrganizationID'))
    BPTParamGeneral += add_param('ProductID', __python_read_ini(configPath, 'Epic', 'ProductID'))
    BPTParamGeneral += add_param('ArtifactID', __python_read_ini(configPath, 'Epic', 'ArtifactID'))

    # build version
    version_name = __python_read_ini(configPath, 'Epic', 'VersionName')
    version_count = int(__python_read_ini(configPath, 'Epic', 'VersionCount')) + 1
    version_count = "{:0>3d}".format(version_count)
    set_ini(configPath, 'Epic', 'VersionCount', version_count)

    BPTParamGeneral += add_param('BuildVersion', '{}_{}'.format(version_name, version_count))

    # ---------
    # Upload Param
    # ---------
    BPTParamUpload = BPTParamGeneral + ' -mode=UploadBinary'

    BPTParamUpload += add_param('BuildRoot', r'"{}"'.format(ContentPath))
    BPTParamUpload += add_param('CloudDir', EpicCloudDir)
    BPTParamUpload += add_param('AppLaunch', '{}.exe'.format(AppName))
    BPTParamUpload += add_param('AppArgs', '')

    # def remove_tree(path: str):
    #     if os.path.exists(path):
    #         shutil.rmtree(path)

    subprocess.call('{} {}'.format(EpicBPTPath, BPTParamUpload))

    # ---------
    # Label Param
    # ---------
    BPTParamLabelBase = BPTParamGeneral + ' -mode=LabelBinary'

    BPTParamLabelBase += add_param('Label', __python_read_ini(configPath, 'Epic', 'Label'))
    BPTParamLabelBase += add_param('SandboxId', __python_read_ini(configPath, 'Epic', 'SandboxId'))

    BPTParamLabel = BPTParamLabelBase + add_param('Platform', 'Win32')
    subprocess.call('{} {}'.format(EpicBPTPath, BPTParamLabel))

    BPTParamLabel = BPTParamLabelBase + add_param('Platform', 'Windows')
    subprocess.call('{} {}'.format(EpicBPTPath, BPTParamLabel))
