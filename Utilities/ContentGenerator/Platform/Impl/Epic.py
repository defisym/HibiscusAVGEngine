import subprocess

from Platform.PlatformHandler import PlatformHandler


class Epic(PlatformHandler):
    def __init__(self, path_prefix, config_path):
        PlatformHandler.__init__(self, path_prefix, config_path)

    def drm(self, exe_path):
        platform, enable, app_id, script_path = PlatformHandler.task_content

    def upload(self):
        pass

    @staticmethod
    def update_ci(path_prefix, config_path, user_name):
        pass
