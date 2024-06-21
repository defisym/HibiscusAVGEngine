from abc import ABC, abstractmethod

from Platform.Impl.Epic import Epic
from Platform.Platform import is_steam, is_epic
from Platform.Impl.Steam import Steam


class PlatformHandler(ABC):
    config_path: str
    path_prefix: str
    user_info: any
    task_content: any

    def __init__(self, path_prefix, config_path):
        self.path_prefix = path_prefix
        self.config_path = config_path

    def update_user(self, user_info):
        self.user_info = user_info

    def update_task(self, task_content):
        self.task_content = task_content

    @abstractmethod
    def drm(self, exe_path):
        pass

    @abstractmethod
    def upload(self):
        pass

    @staticmethod
    @abstractmethod
    def set_up_ci(path_prefix, config_path, user_name):
        pass


def get_platform(platform, path_prefix, config_path) -> PlatformHandler:
    if is_steam(platform):
        return Steam(path_prefix, config_path)

    if is_epic(platform):
        return Epic(path_prefix, config_path)

    raise Exception("Invalid platform!")
