# Change Log

## 20230131

- remove document files first before copying
- fix append dialogue indent & new line issue

## 20230127

- bundle full document in extension

## 20230124

- snippets for `if-else`
- append dialogue line
- fix diagnostic won't clear when file is closed
- show format hint
- add default short key

## 20230123

- add grammar injector for markdown
- fix incorrect lang prefix decorations for non-AvgScript
- add missing highlight & fix incorrect highlight / doc

## 20230119

- refactor to prototype extension instead of C style function call
- check if label valid

## 20230118

- update context menu
- debug without config
- clear diagnostic info when file is closed
- base path check
- fix incorrect command completion trigger

## 20230117

- fix incorrect file diagnostic & hover result if file name has calculated path (including `\\`)

## 20230116

- windows 7 compatibility
- fix incorrect file diagnostic & hover result if actual file has the same prefix

## 20230115

- fix undefine command extension causes error in hover
- add empty & undefine protections
- replace text to generate script by a set of regex

## 20230101

- add parser for dialogue text

## 20221231

- filter setting params that already exists
- check VNMode command usability
- hover for normal text

## 20221229

- preview for asset list

## 20221228

- diagnostic & hover support `\..` path

## 20221227

- now update command will not add extension commands twice
- show asset list

## 20221226

- refactor

## 20220815

- Video functions

## 20220811

- New ParamType `ZeroOne`
- New ParamType `Order`

## 20220630

- find label reference & definition by inlay hints, instead of manually wrote regex
- handle color decorations by inlay hints, instead of manually wrote regex

## 20220629

- new commands
  - `#SetSwitchColor`
  - `#SetSwitchHoverColor`
  - `#SetSwitchNegativeColor`
  - `#SetSwitchShader`

## 20220605

- fix diagnostic doesn't work with `#CJMP`& `#JmpCha`

## 20220604

- protections for invalid extension properties
- protections for invalid extension min & max param num

## 20220603

- fix number regex typo
- command extension

## 20220602

- support sub folder

## 20220601

- inlay hint dict
- fix file diagnostic false positive due to wrong file type verdict
- fix typo
- fix boolean type diagnostic issue when using `on`/`off`
- fix parsing issue and position issue of internal ID diagnostic
- fix file diagnostic do not update when switching active editors

## 20220531

- fixed an issue that stops the file diagnostic from working
- progress for `updateFileList`
- inlay hints

## 20220530

- diagnostic for deprecated & internal commands
- deprecated & internal commands now have delete line in completion

## 20220522

- iterate lines
- take comments into account
- fix command delimiter is not `=`

## 20220520

- fix info grammar error
- `Too Many Params` now will underline from the first param that exceed the limit
- do not under line the blank part of the line
- fix color decorator issue when param not match
- hint `Too Few Params` for RGB style color

## 20220519

- jump to file definition
- diagnostic

## 20220517

- fix base path cannot be initialized by command
- display more details for audio/script, etc
- fix rename issue when has blank characters in front of the line
- new snippet `Block`

## 20220516

- outline
- workspace separated base path

## 20220515

- decorate non-active language line
- get label definition
- get label reference
- get chapter definition
- update label when file change
- rename

## 20220514

- get real file name when suffix is ignored
- hint non-exist files when hover
- japanese romanize support when search in completions
- hover/completion content optimize
- fix folding issue
- new snippet `VNMode`
- completion for scripts
- completion for labels

## 20220512

- document for keywords
- preview image
- hover to preview image
- support to search with pinyin
- refactor
- command now will display current settings
- fix command blank issue
- use webpack to fix bundle issue
- fix duplicate issue after update basePath
- now won't update fileList if the value didn't change

## 20220510

- Completion suggestion base on base path

## 20220509

- fix error `#` & `@` completion
- fix color issue
- `Lang` prefix completion

## 20220508

- Complete Hover
- Color

## 20220507

- Add Commands
- Completion
- Hover

## 20220309

- Package
