# Change Log

## 20230328

- if dub list's char & chapter list end with change line, last link is clipped and corrupted
- hint for name change

## 20230323

- fix file definition doesn't work
- fix codeLens trigger file diagnostic before finish
- check text length

## 20230322

- only trigger preview in debug session
- list assets dub check
- list unused files
- check if dub is too long
- file list refresh wait if file list is refreshing

## 20230321

- preview

## 20230320

- `currentLineNotComment` now use exception to terminate
- `@DubPlay` now compatible with new dub system, with completion & diagnostic support
- fix completion order issue
- add new extend functions for string

## 20230319

- delete dubs
- dub code lens tooltips

## 20230318

- code lens
- code lens dub operations
- fix chapter jump in dub list
- fix watcher update duplicate
- project file list not reset when refreshing
- optimize dub operations

## 20230316

- chapter jump for dub lists

## 20230314

- iterate scripts now take invalid script into account
- goto error line if error occurs when iterating scripts
- list dub lines now show the index
- tweak list dub for separate dub ID
- fix chapter title didn't display in some cases in dub lists due to incorrect variable life cycle
- hide internal name if no internal name change

## 20230311

- don't watch content change

## 20230301

- watcher for base path

## 20230223

- opening video snippet
- trigger asset update when create/delete/rename files

## 20230221

- update dict

## 20230220

- inlay hint addition
- undefined to copy previous command info
- check if param is required value

## 20230218

- extra info for inlayHint

## 20230217

- keep webview panel context & enable find widget

## 20230216

- quick jump for list character lines & asset list

## 20230215

- list character lines

## 20230213

- show unused files

## 20230212

- check stretch ratio
- check `BackZoom` area out of screen
- fix `colorProvider` doesn't work for RGB style

## 20230211

- config webpack for development
- fix unnecessary prefix if appending a narration

## 20230207

- format: add empty line before & after according to command prop / for labels
- format: remove two or more consecutive empty lines
- format: delete blank characters in empty lines

## 20230206

- fix `commandUpdateCommandExtension_impl` doesn't work due to interface key undefined
- use dict defined keyword for outline

## 20230205

- empty line formatting

## 20230204

- fix diagnostics don't keep when switch docs
- indent formatting

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
