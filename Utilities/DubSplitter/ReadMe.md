# DubSplitter

## Description

an easy tool to split dubs based on given silence

![Screenshot](https://github.com/defisym/HibiscusAVGEngine/blob/main/Utilities/DubSplitter/Screenshot.png?raw=true)

## Params

| Command           | type   | Info                                                                                                                      |
|-------------------|--------|---------------------------------------------------------------------------------------------------------------------------|
| -f, --fileName    | option | file to process                                                                                                           |
| -o, --outFilePath | option | output folder, if not set, will use `scriptPath + \\Out\\` (as script), or `userPath + \\DubSplitter\\Out\\` (as package) |
| -s, --silence     | option | silence time, in ms, default is `1000`ms                                                                                  |
| -r, --range       | option | range, default is `100`ms. e.g., silence = `400`, range = `100` will slice in `400`ms and `500`ms                         |
| --step            | option | loop step, default is `100`ms                                                                                             |
| --noVR            | option | don't use voice recognition, default is `false`                                                                           |
| --model           | option | whisper model, default is `base`                                                                                          |
| --language        | option | language used in whisper, default is `chinese`                                                                            |

## Usage

open folder in terminal, then run `python main.py`

or use command `pip install DubSplitter` to install [package](https://pypi.org/project/DubSplitter/), then
run `dubSplitter`

## Note

if whisper doesn't use GPU, you need to uninstall CPU version first then install GPU version

```shell
pip uninstall torch
pip cache purge
# from https://pytorch.org/get-started/locally/
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu117
```

## Changelog

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