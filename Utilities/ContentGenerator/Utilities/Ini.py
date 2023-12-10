import configparser


# def set_ini(filename: str, section: str, item: str, value: str):
#     return subprocess.call(
#         "{} -f {} --unicode --section {} --item {} --value {}".format(Settings_CLI, filename, section, item, value))


def set_ini(filename: str, section: str, item: str, value: str):
    config = configparser.ConfigParser()
    config.read(filename)
    config[section][item] = value
    with open(filename, 'w') as f:
        config.write(f)


def read_ini(filename: str, section: str, item: str):
    config = configparser.ConfigParser()
    config.read(filename)
    return config[section][item]
