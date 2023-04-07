"""
omit characters if text is longer than given length, default 20
e.g., 123456789012345678901234567890 -> 1234567890……1234567890
"""


def string_omit(text, text_len=20):
    text_len = int(text_len)
    sliceLen = int(text_len / 2)
    originLen = len(text)

    text = text[:sliceLen] + '……' + text[originLen - sliceLen:] if originLen > text_len else text

    return text
