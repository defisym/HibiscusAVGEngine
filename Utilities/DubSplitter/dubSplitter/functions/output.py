from colorama import Style

log = False


def setlog(output_log):
    global log
    log = output_log


def output(content):
    if log:
        print(content + Style.RESET_ALL)
