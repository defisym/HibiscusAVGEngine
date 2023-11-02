# DubSplitter

## Description

an easy tool to split dubs based on given silence

![Screenshot](https://github.com/defisym/HibiscusAVGEngine/blob/main/Utilities/DubSplitter/Screenshot.png?raw=true)

## Params

| Command              | Type   | Info                                                                                                                                                                                                                                                                                |
|----------------------|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| -f, --fileName       | option | file to process                                                                                                                                                                                                                                                                     |
| -o, --outFilePath    | option | output folder, if not set, will use `scriptPath + \\Out\\` (as script), or `userPath + \\DubSplitter\\Out\\` (as package)                                                                                                                                                           |
| --outFileFormat      | option | output format, default is `ogg`                                                                                                                                                                                                                                                     |
| --fileNameFormat     | option | output file name format                                                                                                                                                                                                                                                             |
| --fileNameVRFormat   | option | output file name format with voice recognition                                                                                                                                                                                                                                      |
| --fileNameCustomInfo | option | custom info for output file name, default is `''`                                                                                                                                                                                                                                   |
| -s, --silence        | option | silence time, in ms, default is `1000`ms                                                                                                                                                                                                                                            |
| -r, --range          | option | range, default is `100`ms. e.g., silence = `400`, range = `100` will slice in `400`ms and `500`ms                                                                                                                                                                                   |
| --step               | option | loop step, default is `100`ms                                                                                                                                                                                                                                                       |
| --threshold          | option | anything quieter than this will be considered silence, default is `-40`db                                                                                                                                                                                                           |
| --keepSilence        | option | leave some silence at the beginning and end of the chunks. Keeps the sound from sounding like it is abruptly cut off. When the length of the silence is less than the given duration it is split evenly between the preceding and following non-silent segments, default is `100`ms |
| --noVR               | option | don't use voice recognition, default is `false`                                                                                                                                                                                                                                     |
| --model              | option | whisper model, default is `base`                                                                                                                                                                                                                                                    |
| --prompt             | option | init prompt used in whisper, default is `简体中文`                                                                                                                                                                                                                                      |
| --language           | option | language used in whisper, default is `chinese`                                                                                                                                                                                                                                      |
| --omitLen            | option | recognize result will omit middle characters if longer than given, `len <=0` -> do nothing, default is `20`                                                                                                                                                                         |
| --log                | option | output detailed log instead of progress bar, default is false                                                                                                                                                                                                                       |

## Usage

open folder in terminal, then run `python main.py`

or use command `pip install DubSplitter` to install [package](https://pypi.org/project/DubSplitter/), then
run `dubSplitter`

## Custom File Name

### Basic

`fileNameFormat` & `fileNameVRFormat` receives a format string, you can reference
the [formatting syntax doc](https://docs.python.org/3/tutorial/inputoutput.html#the-string-format-method) then write
your own one.

files will firstly be outputted in the format of `fileNameFormat`. If the script needs to do voice recognition, then the
file will be renamed to `fileNameVRFormat`

### File Name Format

default is `{2:0>4d}_{3:0>8d}.{1}`

| String              | Index | 
|---------------------|-------|
| custom info         | 0     | 
| output format       | 1     | 
| silence             | 2     | 
| loop index          | 3     | 
| ms time stamp start | 4     | 
| ms time stamp end   | 5     | 
| time stamp start    | 6     | 
| time stamp end      | 7     | 

`custom info` is the one you passed in `fileNameCustomInfo`

### File Name Format (with voice recognition)

default is `{2:0>4d}_{3:0>8d}_{5}.{1}`

| String              | Index | 
|---------------------|-------|
| custom info         | 0     | 
| output format       | 1     | 
| silence             | 2     | 
| loop index          | 3     | 
| recognize_result    | 4     | 
| text                | 5     | 
| ms time stamp start | 6     | 
| ms time stamp end   | 7     | 
| time stamp start    | 8     | 
| time stamp end      | 9     | 

`custom info` is the one you passed in `fileNameCustomInfo`

`text` is the process result of `recognize_result`, by omitting middle characters, and escaping invalid characters
like `\\`, `/`, `*`, `?`, `<`, `>`, `|`

## Note

### Whisper GPU

if whisper doesn't use GPU, you need to uninstall CPU version first then install GPU version

```shell
pip uninstall torch
pip cache purge
# from https://pytorch.org/get-started/locally/
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu117
```

### Whisper prompt

[document](https://platform.openai.com/docs/guides/speech-to-text/prompting)

example:

use `--prompt 简体中文` -> `真辛苦真辛苦啊 我会跳个好天气出去运动的`

use `--prompt 正體中文` -> `真辛苦真辛苦啊我會跳個好天氣出去運動的`

## Changelog

### 231102 0.7.0

- time stamp usable in custom file format

### 231027 0.6.0

- progress bar
- auto skip output routine if new silence has the same count comparing to previous one

### 231022 0.5.0

- iterate all files if input path is a folder

### 230520 0.4.0

- set silence threshold & keep silence length

### 230412 0.3.0

- add color for outputs
- add custom file format support
- add custom filename format support
- add prompt support
- add omit len option

### 230407 0.2.1

- use `AudioSegment.from_file` to support more file type
- load file before load model as file error happens more often
- remove unnecessary info & fix typo

### 230407 0.2.0

- print version when boot

### 230407 0.1.3

- fix typo

### 230407 0.1.2

- optimize `update_path`

### 230407 0.1.1

- update readme

### 230407 0.1.0

- init release