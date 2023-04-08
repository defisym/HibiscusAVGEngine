from sympy.core import numbers


def exit_with_info(info: str, error_code: numbers=1):
    print(info)
    exit(error_code)
