import subprocess

from Platform.PlatformHandler import PlatformHandler
from Utilities.Ini import __python_read_ini


class Steam(PlatformHandler):
    steam_cli_path: str

    def __init__(self, path_prefix, config_path):
        PlatformHandler.__init__(self, path_prefix, config_path)
        self.steam_cli_path = path_prefix + __python_read_ini(config_path, 'Path', 'SteamCMDPath')

    def drm(self, exe_path):
        platform, enable, app_id, script_path = PlatformHandler.task_content
        user_name = PlatformHandler.user_info

        subprocess.call("{} +login {} +drm_wrap {} \"{}\" \"{}\" drmtoolp 0 +quit".format(PlatformHandler.path_prefix,
                                                                                          user_name, app_id, exe_path,
                                                                                          exe_path))

    def upload(self):
        platform, enable, app_id, script_path = PlatformHandler.task_content
        user_name = PlatformHandler.user_info

        subprocess.call("{} +login {} +run_app_build \"{}\" +quit".format(PlatformHandler.path_prefix,
                                                                          user_name, script_path))

    @staticmethod
    def update_ci(path_prefix, config_path, user_name):
        # https://partner.steamgames.com/doc/sdk/uploading#automating_steampipe
        password = input('Enter user password:')
        guard = input('Enter user guard:')

        steam_cli_path = path_prefix + __python_read_ini(config_path, 'Path', 'SteamCMDPath')
        subprocess.call("{} +login {} {} {} +info +quit".format(steam_cli_path,
                                                                user_name, password, guard))
