import os

from rich import json


def save_to_file(dictionary: dict, filename: str):
    with open(filename, 'w') as f:
        json_info = json.dumps(dictionary)
        f.write(json_info)


def load_from_file(filename: str) -> dict:
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            info_data = json.loads(f.read())
            return info_data

    return {}
