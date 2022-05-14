/* eslint-disable @typescript-eslint/naming-convention */

export const sharpKeywordList: string[] = [
    'Settings',
    'Begin',
    'End',
    'Error',
    'NULL',
    'CacheClean',
    'UnSkipAble',
    'SkipAble',
    'SGO',
    'SetGlobalOffset',
    'TransitionSpeed',
    'ForceTransition',
    'Save',
    'Debug',
    'DebugOff',
    'DefineRGB',
    'MSG',
    'MSGClear',
    'StopFF',
    'StopFastForward',
    'DisableUI',
    'EnableUI',
    'FNT',
    'ForceNoTransition',
    'FNTO',
    'ForceNoTransitionOff',
    'EOF',
    'W',
    'Wait',
    'FW',
    'ForceWait',
    'Jmp',
    'NJMP',
    'Call',
    'Ret',
    'FJMP',
    'JmpFra',
    'CJMP',
    'JmpCha',
    'SJMP',
    'SkipJmp',
    'SkipAnchor',
    'CreateSwitch',
    'Switch',
    'UnlockAch',
    'AddtoStat',
    'UnlockAppreciation',
    'UnlockAppreciation_Chapter',
    'UnlockAppreciation_Graphic',
    'UnlockAppreciation_Audio',
    'VNMode_Newline',
    'VNMode_ChangePage',
    'SetCapture',
    'CaptureSys',
    'SV',
    'SetValue',
    'SVV',
    'SetValueValue',
    'SVAB',
    'SetValueAB',
    'SSS',
    'SetStringString',
    'SSAB',
    'SetStringAB',
    'VA',
    'ValueAdd',
    'VAV',
    'ValueAddValue',
    'VS',
    'ValueSub',
    'VSV',
    'ValueSubValue',
    'VM',
    'ValueMul',
    'VMV',
    'ValueMulValue',
    'VD',
    'ValueDiv',
    'VAV',
    'ValueDivValue',
    'CMP',
    'CMPV',
    'CMPValue',
    'CMPVV',
    'CMPValueValue',
    'CMPAB',
    'CMPVAB',
    'CMPValueAB',
    'CMPSAB',
    'CMPStringAB',
    'CMPSS',
    'CMPStringString',
    'JE',
    'JA',
    'JB',
    'JNE',
    'DiaColor',
    'DiaSize',
    'DiaFont',
    'DiaShaderOn',
    'DiaShaderOff',
    'DiaOutColor',
    'DiaOutPixel',
    'NameColor',
    'NameSize',
    'NameFont',
    'NameShaderOn',
    'NameShaderOff',
    'NameOutColor',
    'NameOutPixel'];

export const atKeywordList: string[] = [
    'Dia',
    'DiaChange',
    'DiaTrans',
    'Name',
    'NameChange',
    'NameTrans',
    'TextFadeOut',
    'P',
    'Play',
    'Stop',
    'Se',
    'Bgm',
    'BgmLoop',
    'BgmPre',
    'BgmPreludeLoop',
    'BgmPause',
    'BgmResume',
    'BgmFadeOut',
    'Bgs',
    'BgsLoop',
    'BgsPause',
    'BgsResume',
    'BgsFadeOut',
    'Dub',
    'DubPlay',
    'DubSeque',
    'Ntk',
    'NtkChange',
    'PV',
    'PlayVideo',
    'OV',
    'OpenVideo',
    'CV',
    'CloseVideo',
    'VR',
    'VideoResume',
    'VP',
    'VideoPause',
    'VW',
    'VideoWait',
    'VL',
    'VideoLoop',
    'SVP',
    'SetVideoPos',
    'CreateBlur',
    'AddBlur',
    'RemoveBlur',
    'DestroyBlur',
    'BackZoomParam',
    'BackZoomReset',
    'BackZoom',
    'Shake',
    'ShakeDir',
    'KeepShake',
    'KeepShakeOff',
    'Fade',
    'DestroyFade',
    'PF',
    'PatternFade',
    'PFO',
    'PatternFadeOut',
    'Rain',
    'Snow',
    'Normal',
    'ToRain',
    'ToSnow',
    'ToNormal',
    'CrossFade',
    'KeepRes',
    'KeepResolution',
    'KeepResOff',
    'KeepResolutionOff',
    'Sepia',
    'SepiaToning',
    'ChangeSepiaStrength',
    'SetSepiaNoiseMotion',
    'ChangeSepiaNoiseMotionPeriod',
    'StrCenter',
    'StrBottom',
    'Str',
    'String',
    'CreateStr',
    'CreateString',
    'StrS',
    'StrSize',
    'StrF',
    'StrFont',
    'StrA',
    'StrAlpha',
    'StrC',
    'StrColor',
    'MS',
    'MoveStr',
    'DestroyStr',
    'DestroyString',
    'DestroyAllStr',
    'DestroyAllString',
    'Spe',
    'MO',
    'MoveObj',
    'CG',
    'CGChange',
    'CPF',
    'CPatternFade',
    'CPFI',
    'CPatternFadeIn',
    'CPFO',
    'CPatternFadeOut',
    'CGPFI',
    'CGPatternFadeIn',
    'CGPFO',
    'CGPatternFadeOut',
    'CharPF',
    'CharPatternFade',
    'Char',
    'Character',
    'CC',
    'CharChange',
    'CA',
    'CharAlpha',
    'CharRotate',
    'SetAutoArrange',
    'CD',
    'CharDispose',
    'CAD',
    'CharAllDispose',
    'MC',
    'MoveChar',
    'HideUI',
    'ShowUI',
    'Order',
    'Front',
    'Back',
    'Forward',
    'Backward'];

export const keywordList: string[] = sharpKeywordList.concat(atKeywordList);

export const settingsParamList: string[] = [
    "LangSwitchAble",
    "VNMode",
    "VN",
    "LiteMode",
    "Lite",
    "UnSkipAble",
    "NoHistory",
    "ResetHistory",
    "LoadOnCall",
    "LoadAtStart",
    "LoadAll",
    "EraseAtEnd",
    "EraseAtEOF",
];

export type docList = Map<string, string[]>;

export const settingsParamDocList = new Map<string, string[]>([
    ["Settings", ["在脚本的第一行可以使用`#Settings`指令对脚本进行设置，格式如下:"
        , "	#Settings=Param1|Param2|..."
        , "其中不同参数使用`|`进行分割"]],

    ["LangSwitchAble", ["该脚本支持切换语言后读取"]],
    ["VN", ["启用Visual Novel模式"]],
    ["VNMode", ["启用Visual Novel模式"]],
    ["Lite", ["启用Lite模式，该模式下部分功能会被禁用"]],
    ["LiteMode", ["启用Lite模式，该模式下部分功能会被禁用"]],
    ["UnSkipAble", ["该脚本无法使用跳过按钮/快捷键跳过"
        , "若需要中途启用，可使用`#SkipAble`指令"]],
    ["NoHistory", ["禁用历史记录功能"]],
    ["ResetHistory", ["开始对话时重置历史记录"]],
    ["LoadOnCall", ["在第一次使用时读取并缓存"]],
    ["LoadAtStart", ["在读取脚本时即读取该场景中使用的所有图像素材并缓存"]],
    ["LoadAll", ["加载图像文件夹中的所有图像素材并缓存"]],
    ["EraseAtEnd", ["在退出后结束后清除缓存"]],
    ["EraseAtEOF", ["在脚本执行结束后清除缓存"]],
]);

export const langDocList = new Map<string, string[]>([
    // keywords_language
    ["Lang", ["语言前缀"]],
    ["ZH", ["中文"]],
    ["EN", ["English"]],
    ["JP", ["日本語"]],
    ["FR", ["français"]],
    ["RU", ["русский язык"]],
]);

export const commandDocList = new Map<string, string[]>([
    // keywords_region
    ["Begin", ["代码块开始/结束标志，允许你在编辑器中将代码段折叠，在引擎内部无任何效果"]],
    ["End", ["代码块开始/结束标志，允许你在编辑器中将代码段折叠，在引擎内部无任何效果"]],


    // keywords_system
    ["Error", ["	#Error=ErrorPic.png"
        , "内部指令，当引擎报错时会显示`Data\Graphic\_Sys`下对应的错误提示`ErrorPic.png`"]],
    ["NULL", ["空指令，用于指令转译"]],
    ["CacheClean", ["	#CacheClean=MemLimit"
        , "尝试清理未引用的缓存，直到当前内存占用低于`MemLimit`或无可清理缓存。`MemLimit = -1`将按照默认设置清理，`MemLimit = 0`将清理全部未引用缓存"
        , "注意:内存的分配与释放非常耗时，清理100MB内存大约需要10ms，可在黑屏淡出时进行清理，以避免可感知的卡顿，同时请尽量避免频繁清理"]],
    ["UnSkipAble", ["读取到该指令后，当前章节无法使用跳过按钮/快捷键跳过"]],
    ["SkipAble", ["允许当前使用跳过按钮/快捷键跳过，用于取消`#UnSkipAble`"]],
    ["SGO", ["	#SGO:XOffset:YOffset"
        , "	#SetGlobalOffset:XOffset:YOffset"
        , "设定演出对象的全局偏移量，特效、UI与字符串对象不受影响"]],
    ["SetGlobalOffset", ["	#SGO:XOffset:YOffset"
        , "	#SetGlobalOffset:XOffset:YOffset"
        , "设定演出对象的全局偏移量，特效、UI与字符串对象不受影响"]],
    ["TransitionSpeed", ["	#TransitionSpeed:Value"
        , "更改不透明度叠化速度，默认为`10`"
        , "参数设定为`default`可重置默认值"]],
    ["ForceTransition", ["该指令会截取当前窗口，并按照`TransitionSpeed`指定的速度进行淡出，用于为无法创建叠化的指令(如`@Order`、`#DefineRGB`等)强制添加叠化"]],
    ["Save", ["保存中断存档"]],

    ["Debug", ["调试模式下无叠化显示调试参数"]],
    ["DebugOff", ["调试模式下无叠化关闭调试参数"]],
    ["DefineRGB", ["	#DefineRGB:R:G:B"
        , "	#DefineRGB:#FFFFFF"
        , "定义立绘的色调RGB值为`R:G:B/#FFFFFF`，无叠化更新所有立绘对象(非特殊非特效对象)的RGB参数。该指令通常用于根据背景光照情况调整立绘色调，可使用附带的`RGBDefiner`工具来直观的调整该参数"]],

    ["MSG", ["	#MSG=Message"
        , "仅调试模式下可用，于调试输出中输出Message"]],
    ["MSGClear", ["仅调试模式下可用，清空调试输出，在翻页时会自动调用"]],
    ["StopFF", ["仅调试模式下可用，解析至该语句后，快进将会在下一句文本处停止"]],
    ["StopFastForward", ["仅调试模式下可用，解析至该语句后，快进将会在下一句文本处停止"]],
    ["DisableUI", ["禁用UI"]],
    ["EnableUI", ["启用UI"]],
    ["FNT", ["强制无叠化，强制无叠化状态在解析到文本后重置为关闭"]],
    ["ForceNoTransition", ["强制无叠化，强制无叠化状态在解析到文本后重置为关闭"]],

    ["FNTO", ["关闭强制无叠化"]],
    ["ForceNoTransitionOff", ["关闭强制无叠化"]],

    ["EOF", ["文件尾标志，普通模式下解析到该指令即返回报错信息`脚本文件结尾必须为有效跳转`，`Lite`模式下则为执行完成标记"]],
    ["W", ["	#W=2000"
        , "	#Wait=2000"
        , "等待指令:等待时间"
        , "等待指令只对**交叠淡化**有效"]],
    ["Wait", ["	#W=2000"
        , "	#Wait=2000"
        , "等待指令:等待时间"
        , "等待指令只对**交叠淡化**有效"]],

    ["FW", ["	#FW=2000"
        , "	#ForceWait=2000"
        , "强制等待指令:等待时间"
        , "强制等待指令对**移动旋转、BGM淡出淡出**等有效"]],
    ["ForceWait", ["	#FW=2000"
        , "	#ForceWait=2000"
        , "强制等待指令:等待时间"
        , "强制等待指令对**移动旋转、BGM淡出淡出**等有效"]],

    ["Jmp", ["	#JMP=Label"
        , "脚本内跳转，跳转到指定的标签位"
        , "置跳转标志位为1，跳转标志位在解析到文本后重置为0"]],
    ["NJMP", ["	#NJMP=Label"
        , "检测并重置跳转标志位"
        , "若非跳转至此(跳转标志位等于0)，则跳转到指定的标签位，用于跳转后的再初始化"]],
    ["Call", ["	#Call=Label"
        , "使用`#Call=Label`指令调用位于`Label`处的代码段。该代码段必须位于`#EOF`之前，且必须以`#Ret`结尾"]],
    ["Ret", ["返回当前`Label`代码段的调用位点"]],
    ["FJMP", ["	#FJMP=TargetFrame"
        , "	#JmpFra=TargetFrame"
        , "跨场景跳转，跳转到场景`TargetFrame`，仅接受数字参数"]],
    ["JmpFra", ["	#FJMP=TargetFrame"
        , "	#JmpFra=TargetFrame"
        , "跨场景跳转，跳转到场景`TargetFrame`，仅接受数字参数"]],

    ["CJMP", ["	#CJMP=Chapter"
        , "	#JmpCha=Chapter"
        , "跨章节跳转，更新`CurrentChapter`，跳转到章节`Chapter`"]],
    ["JmpCha", ["	#CJMP=Chapter"
        , "	#JmpCha=Chapter"
        , "跨章节跳转，更新`CurrentChapter`，跳转到章节`Chapter`"]],
    ["SJMP", ["跳转到下一个跳转指令并重启扫描，内部指令，用于跳过文本功能"
        , "置跳转标志位为1，跳转标志位在解析到文本后重置为0"]],
    ["SkipJmp", ["跳转到下一个跳转指令并重启扫描，内部指令，用于跳过文本功能"
        , "置跳转标志位为1，跳转标志位在解析到文本后重置为0"]],
    ["SkipAnchor", ["该指令会被当作跳过终止指令处理。范例再初始化代码如下："
        , "	#SkipAnchor"
        , "	#NJMP=Init"
        , "	#FNT"
        , "	@CAD"
        , "	@CG=BG_Indoor_HYBR_Cloudy_Noon.png"
        , "	#TransitionSpeed=10"
        , "	#FNTO"
        , "	;Init"]],

    ["CreateSwitch", ["	#CreateSwitch:SwitchNum"
        , "选项分支创建的入口指令，用于创建`SwitchNum`个分支"
        , "该指令会记录当前扫描指针位置，用于保存/读取"]],
    ["Switch", ["	#Switch:X:Y:Text:Label"
        , "控制创建的分支选项，指定其X/Y坐标，选项文本与跳转标签"
        , "如果跳转标签定义为`Negative`，则该选项设定为灰色，无效"]],
    ["UnlockAch", ["	#UnlockAch=Steam_AchName"
        , "解锁成就`Steam_AchName`"]],
    ["AddtoStat", ["	#AddtoStat=Steam_StatName:Steam_StatAdd"
        , "更新统计`Steam_StatName`，增加`Steam_StatAdd`"
        , "若`Steam_StatAdd`留空，默认为统计量+1"]],
    ["UnlockAppreciation", ["	#UnlockAppreciation=ContentName:Page:Pos"
        , "解锁位于`Page`页第`Pos`个指向`ContentName`的鉴赏，`Page`与`Pos`参数从零开始。留空`Page`与`Pos`参数时，若启用了映射且映射定义合法，则依照定义解锁；若未启用映射，则依照记录数值依此解锁"
        , "该指令需要内部参数`AppreciationType`，因此不能直接调用，而是由下列指令转译后执行："]],
    ["UnlockAppreciation_Chapter", ["	#UnlockAppreciation_Chapter=ChapterName:Page:Pos"
        , "于场景回想中解锁位于`Page`页第`Pos`个指向`ChapterName`的鉴赏"
        , "含转译指令在内，解析到`#JMPFra`或`#JMPCha`指令后，会自动执行留空`Page`与`Pos`参数的指令"]],
    ["UnlockAppreciation_Graphic", ["	#UnlockAppreciation_Graphic=GraphicName:Page:Pos"
        , "于场景回想中解锁位于`Page`页第`Pos`个指向`GraphicName`的鉴赏。`ChapterName`应为`Characters`的相对路径，CG文件夹下的文件的完整`ChapterName`为`..CG\Graphic.png`"
        , "该指令会自动忽略非CG文件夹下的文件"
        , "含转译指令在内，解析到`@Char`或`@CharChange`指令后，会自动执行留空`Page`与`Pos`参数的指令"]],
    ["UnlockAppreciation_Audio", ["	#UnlockAppreciation_Audio=AudioName:Page:Pos"
        , "于场景回想中解锁位于`Page`页第`Pos`个指向`AudioName`的鉴赏"
        , "含转译指令在内，解析到`@BGM`或`@BGMPre`指令后，会自动执行留空`Page`与`Pos`参数的指令"]],
    ["VNMode_Newline", ["在文本间插入一个空行。建议在对白文本前后使用，以示区分"]],
    ["VNMode_ChangePage", ["切换页面"
        , "由于VN模式允许一个页面内显示多句文本，因此程序无法自动处理，需要手动指定翻页点。不进行翻页会导致文本显示出界"]],

    ["SetCapture", ["	#SetCapture=ID"
        , "强制更新捕获ID为`ID`"
        , "在执行到下一个指定了ID的指令时，ID会被覆盖"]],
    ["CaptureSys", ["	#CaptureSys=On"
        , "是否捕获系统对象的ID，默认关闭"]],


    // keywords_values
    ["SV", ["	#SV:ValueID:Value"
        , "	#SetValue:ValueID:Value"
        , "令`ValueID`=`Value`，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则为数值赋值，否则为字符串赋值"]],
    ["SetValue", ["	#SV:ValueID:Value"
        , "	#SetValue:ValueID:Value"
        , "令`ValueID`=`Value`，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则为数值赋值，否则为字符串赋值"]],
    ["SVV", ["	#SVV:ValueIDA:ValueIDB"
        , "	#SetValueValue:ValueIDA:ValueIDB"
        , "	#SVAB:ValueIDA:ValueIDB"
        , "	#SetValueAB:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDB`"]],
    ["SetValueValue", ["	#SVV:ValueIDA:ValueIDB"
        , "	#SetValueValue:ValueIDA:ValueIDB"
        , "	#SVAB:ValueIDA:ValueIDB"
        , "	#SetValueAB:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDB`"]],
    ["SVAB", ["	#SVV:ValueIDA:ValueIDB"
        , "	#SetValueValue:ValueIDA:ValueIDB"
        , "	#SVAB:ValueIDA:ValueIDB"
        , "	#SetValueAB:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDB`"]],
    ["SetValueAB", ["	#SVV:ValueIDA:ValueIDB"
        , "	#SetValueValue:ValueIDA:ValueIDB"
        , "	#SVAB:ValueIDA:ValueIDB"
        , "	#SetValueAB:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDB`"]],
    ["SSS", ["	#SSS:ValueIDA:ValueIDB"
        , "	#SetStringString:ValueIDA:ValueIDB"
        , "	#SSAB:ValueIDA:ValueIDB"
        , "	#SetStringAB:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDB`"]],
    ["SetStringString", ["	#SSS:ValueIDA:ValueIDB"
        , "	#SetStringString:ValueIDA:ValueIDB"
        , "	#SSAB:ValueIDA:ValueIDB"
        , "	#SetStringAB:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDB`"]],
    ["SSAB", ["	#SSS:ValueIDA:ValueIDB"
        , "	#SetStringString:ValueIDA:ValueIDB"
        , "	#SSAB:ValueIDA:ValueIDB"
        , "	#SetStringAB:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDB`"]],
    ["SetStringAB", ["	#SSS:ValueIDA:ValueIDB"
        , "	#SetStringString:ValueIDA:ValueIDB"
        , "	#SSAB:ValueIDA:ValueIDB"
        , "	#SetStringAB:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDB`"]],
    ["VA", ["	#VA:ValueID"
        , "	#ValueAdd:ValueID:Value"
        , "`ValueID`=`ValueID`+`Value`"]],
    ["ValueAdd", ["	#VA:ValueID"
        , "	#ValueAdd:ValueID:Value"
        , "`ValueID`=`ValueID`+`Value`"]],
    ["VAV", ["	#VAV:ValueIDA:ValueIDB"
        , "	#ValueAddValue:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDA`+`ValueIDB`"]],
    ["ValueAddValue", ["	#VAV:ValueIDA:ValueIDB"
        , "	#ValueAddValue:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDA`+`ValueIDB`"]],
    ["VS",
        ["	#VS:ValueID"
            , "	#ValueSub:ValueID:Value"
            , "`ValueID`=`ValueID`-`Value`"]],
    ["ValueSub", ["	#VS:ValueID"
        , "	#ValueSub:ValueID:Value"
        , "`ValueID`=`ValueID`-`Value`"]],
    ["VSV", ["	#VSV:ValueIDA:ValueIDB"
        , "	#ValueSubValue:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDA`-`ValueIDB`"]],
    ["ValueSubValue", ["	#VSV:ValueIDA:ValueIDB"
        , "	#ValueSubValue:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDA`-`ValueIDB`"]],
    ["VM", ["	#VM:ValueID"
        , "	#ValueMul:ValueID:Value"
        , "`ValueID`=`ValueID`*`Value`"]],
    ["ValueMul", ["	#VM:ValueID"
        , "	#ValueMul:ValueID:Value"
        , "`ValueID`=`ValueID`*`Value`"]],
    ["VMV",
        ["	#VMV:ValueIDA:ValueIDB"
            , "	#ValueMulValue:ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDA`*`ValueIDB`"]],
    ["ValueMulValue", ["	#VMV:ValueIDA:ValueIDB"
        , "	#ValueMulValue:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDA`*`ValueIDB`"]],
    ["VD", ["	#VD:ValueID"
        , "	#ValueDiv:ValueID:Value"
        , "`ValueID`=`ValueID`/`Value`"]],
    ["ValueDiv", ["	#VD:ValueID"
        , "	#ValueDiv:ValueID:Value"
        , "`ValueID`=`ValueID`/`Value`"]],
    ["VAV", ["	#VAV:ValueIDA:ValueIDB"
        , "	#ValueDivValue:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDA`/`ValueIDB`"]],
    ["ValueDivValue", ["	#VAV:ValueIDA:ValueIDB"
        , "	#ValueDivValue:ValueIDA:ValueIDB"
        , "`ValueIDA`=`ValueIDA`/`ValueIDB`"]],

    ["CMP", ["	#CMP:ValueID:Value"
        , "	#CMPV:ValueID:Value"
        , "	#CMPValue:ValueID:Value"
        , "比较`ValueID`与`Value`的大小，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则与数值比较，否则与字符串比较"]],
    ["CMPV", ["	#CMP:ValueID:Value"
        , "	#CMPV:ValueID:Value"
        , "	#CMPValue:ValueID:Value"
        , "比较`ValueID`与`Value`的大小，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则与数值比较，否则与字符串比较"]],
    ["CMPValue", ["	#CMP:ValueID:Value"
        , "	#CMPV:ValueID:Value"
        , "	#CMPValue:ValueID:Value"
        , "比较`ValueID`与`Value`的大小，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则与数值比较，否则与字符串比较"]],
    ["CMPAB", ["	#CMPAB:ValueIDA:ValueIDB"
        , "	#CMPVAB:ValueIDA:ValueIDB"
        , "	#CMPValueAB:ValueIDA:ValueIDB"
        , "	#CMPVV:ValueIDA:ValueIDB"
        , "	#CMPValueValue:ValueIDA:ValueIDB"
        , "比较`ValueIDA`与`ValueIDB`的大小"]],
    ["CMPVAB", ["	#CMPAB:ValueIDA:ValueIDB"
        , "	#CMPVAB:ValueIDA:ValueIDB"
        , "	#CMPValueAB:ValueIDA:ValueIDB"
        , "	#CMPVV:ValueIDA:ValueIDB"
        , "	#CMPValueValue:ValueIDA:ValueIDB"
        , "比较`ValueIDA`与`ValueIDB`的大小"]],
    ["CMPValueAB", ["	#CMPAB:ValueIDA:ValueIDB"
        , "	#CMPVAB:ValueIDA:ValueIDB"
        , "	#CMPValueAB:ValueIDA:ValueIDB"
        , "	#CMPVV:ValueIDA:ValueIDB"
        , "	#CMPValueValue:ValueIDA:ValueIDB"
        , "比较`ValueIDA`与`ValueIDB`的大小"]],
    ["CMPVV", ["	#CMPAB:ValueIDA:ValueIDB"
        , "	#CMPVAB:ValueIDA:ValueIDB"
        , "	#CMPValueAB:ValueIDA:ValueIDB"
        , "	#CMPVV:ValueIDA:ValueIDB"
        , "	#CMPValueValue:ValueIDA:ValueIDB"
        , "比较`ValueIDA`与`ValueIDB`的大小"]],
    ["CMPValueValue", ["	#CMPAB:ValueIDA:ValueIDB"
        , "	#CMPVAB:ValueIDA:ValueIDB"
        , "	#CMPValueAB:ValueIDA:ValueIDB"
        , "	#CMPVV:ValueIDA:ValueIDB"
        , "	#CMPValueValue:ValueIDA:ValueIDB"
        , "比较`ValueIDA`与`ValueIDB`的大小"]],
    ["CMPSAB", ["	#CMPSAB:ValueIDA:ValueIDB"
        , "	#CMPStringAB:ValueIDA:ValueIDB"
        , "	#CMPSS:ValueIDA:ValueIDB"
        , "	#CMPStringString:ValueIDA:ValueIDB"
        , "比较`ValueIDA`与`ValueIDB`的大小"]],
    ["CMPStringAB", ["	#CMPSAB:ValueIDA:ValueIDB"
        , "	#CMPStringAB:ValueIDA:ValueIDB"
        , "	#CMPSS:ValueIDA:ValueIDB"
        , "	#CMPStringString:ValueIDA:ValueIDB"
        , "比较`ValueIDA`与`ValueIDB`的大小"]],
    ["CMPSS", ["	#CMPSAB:ValueIDA:ValueIDB"
        , "	#CMPStringAB:ValueIDA:ValueIDB"
        , "	#CMPSS:ValueIDA:ValueIDB"
        , "	#CMPStringString:ValueIDA:ValueIDB"
        , "比较`ValueIDA`与`ValueIDB`的大小"]],
    ["CMPStringString", ["	#CMPSAB:ValueIDA:ValueIDB"
        , "	#CMPStringAB:ValueIDA:ValueIDB"
        , "	#CMPSS:ValueIDA:ValueIDB"
        , "	#CMPStringString:ValueIDA:ValueIDB"
        , "比较`ValueIDA`与`ValueIDB`的大小"]],

    ["JE", ["比较结果等于时，跳转至`Lable`"]],
    ["JA", ["比较结果大于时，跳转至`Lable`"]],
    ["JB", ["比较结果小于时，跳转至`Lable`"]],
    ["JNE", ["比较结果不等于时，跳转至`Lable`"]],

    // keywords_dialogue
    ["DiaColor", ["	#DiaColor:R:G:B"
        , "	#DiaColor:#FFFFFF"
        , "定义对白文字的RGB值，`R:G:B/#FFFFFF`"
        , "字体颜色无法设置为`(255,255,255)/#FFFFFF`，否则会导致勾边错误"]],
    ["DiaSize", ["	#DiaSize:size"
        , "定义对白文字的大小，AVG模式下默认大小为17，VN模式下默认大小为18"]],
    ["DiaFont", ["	#DiaFont:font"
        , "定义对白文字的字体"]],

    ["DiaShaderOn", ["	#DiaShaderOn:outlinepixel:R:G:B"
        , "	#DiaShaderOn:outlinepixel:#FFFFFF"
        , "启用对白勾边，勾边颜色为`RGB/#FFFFFF`，勾边像素数为`outlinepixel`	"]],
    ["DiaShaderOff", ["关闭对白勾边效果"]],

    ["DiaOutColor", ["	#DiaOutColor:R:G:B"
        , "	#DiaOutColor:#FFFFFF"
        , "启用勾边时，更改对白勾边颜色为`RGB/#FFFFFF`"]],
    ["DiaOutPixel", ["	#DiaOutPixel:outlinepixel"
        , "启用勾边时，更改对白勾边像素数为`outlinepixel`"]],

    ["NameColor", ["	#NameColor:R:G:B"
        , "	#NameColor:#FFFFFF"
        , "定义姓名文字的RGB值，`R:G:B/#FFFFFF`"
        , "字体颜色无法设置为`(255,255,255)/#FFFFFF`，否则会导致勾边错误"]],
    ["NameSize", ["	#NameSize:size"
        , "定义姓名文字的大小，默认大小为18"]],
    ["NameFont", ["	#NameFont:font"
        , "定义姓名文字的字体"]],

    ["NameShaderOn", ["	#NameShaderOn:outlinepixel:R:G:B"
        , "	#NameShaderOn:outlinepixel:#FFFFFF"
        , "启用姓名勾边，勾边颜色为`RGB/#FFFFFF`，勾边像素数为`outlinepixel`"]],
    ["NameShaderOff", ["关闭姓名勾边效果"]],

    ["NameOutColor", ["	#NameOutColor:R:G:B"
        , "	#NameOutColor:#FFFFFF"
        , "启用勾边时，更改姓名勾边颜色为`RGB/#FFFFFF`"]],
    ["NameOutPixel", ["	#NameOutPixel:outlinepixel"
        , "启用勾边时，更改对白勾边像素数为`outlinepixel`"]],

    ["Dia", ["	@Dia=filename.png"
        , "	@DiaChange=filename.png"
        , "切换对话框，解析到文本后进行，调用指令`@DiaTrans`"]],
    ["DiaChange", ["	@Dia=filename.png"
        , "	@DiaChange=filename.png"
        , "切换对话框，解析到文本后进行，调用指令`@DiaTrans`"]],
    ["DiaTrans", ["内部转译指令，判定并更新对话框"]],
    ["Name", ["	@Name=filename.png"
        , "	@NameChange=filename.png"
        , "切换姓名栏，解析到文本后进行，调用指令`@NameTrans`"]],
    ["NameChange", ["	@Name=filename.png"
        , "	@NameChange=filename.png"
        , "切换姓名栏，解析到文本后进行，调用指令`@NameTrans`"]],
    ["NameTrans", ["内部转译指令，判定并更新姓名栏"]],
    ["TextFadeOut", ["该指令会自动转译为"
        , "	@Name=NameNull.png"
        , "	@NameTrans"
        , "	@Dia=DiaNull.png"
        , "	@DiaTrans"]],


    // keywords_media

    ["P", ["	@P=filename.mp3:volume:channel"
        , "	@Play=filename.mp3:volume:channel"
        , "在指定的频道内以指定的音量播放一次`Audio`文件夹下指定的音频文件"
        , "其中`volume`可以直接接受`BGM`、`BGS`、`SE`、`DUB`作为参数来返回对应通道的音量"
        , "系统默认占用`1~5`号通道，用户可以安全使用的为`6~48`号通道"]],
    ["Play", ["	@P=filename.mp3:volume:channel"
        , "	@Play=filename.mp3:volume:channel"
        , "在指定的频道内以指定的音量播放一次`Audio`文件夹下指定的音频文件"
        , "其中`volume`可以直接接受`BGM`、`BGS`、`SE`、`DUB`作为参数来返回对应通道的音量"
        , "系统默认占用`1~5`号通道，用户可以安全使用的为`6~48`号通道"]],

    ["Stop", ["	@Stop=channel"
        , "停止特定通道的音频播放"]],

    ["Se", ["	@SE=filename.MP3"
        , "播放SE"]],

    ["Bgm", ["	@Bgm=filename.MP3:fadeSpeed:startpoint:endpoint"
        , "	@BgmLoop=filename.MP3:fadeSpeed:startpoint:endpoint"
        , "定义BGM的A-B循环，从起点开始循环播放到终点，淡入速度为淡入持续秒数，等待淡入淡出属于强制等待"
        , "循环起始点/循环终止点参数设定为零，引擎会进行整曲循环"]],
    ["BgmLoop", ["	@Bgm=filename.MP3:fadeSpeed:startpoint:endpoint"
        , "	@BgmLoop=filename.MP3:fadeSpeed:startpoint:endpoint"
        , "定义BGM的A-B循环，从起点开始循环播放到终点，淡入速度为淡入持续秒数，等待淡入淡出属于强制等待"
        , "循环起始点/循环终止点参数设定为零，引擎会进行整曲循环"]],

    ["BgmPre", ["	@BgmPre=filename.MP3:fadeSpeed:startpoint:endpoint:preludepoint"
        , "	@BgmPreludeLoop=filename.MP3:fadeSpeed:startpoint:endpoint:preludepoint"
        , "定义BGM有前奏的A-B循环，从前奏点开始播放，播放至循环终点后，在循环起点和循环终点间循环播放"
        , "循环起始点/循环终止点/前奏点参数设定为零，效果与上条指令一致"]],
    ["BgmPreludeLoop", ["	@BgmPre=filename.MP3:fadeSpeed:startpoint:endpoint:preludepoint"
        , "	@BgmPreludeLoop=filename.MP3:fadeSpeed:startpoint:endpoint:preludepoint"
        , "定义BGM有前奏的A-B循环，从前奏点开始播放，播放至循环终点后，在循环起点和循环终点间循环播放"
        , "循环起始点/循环终止点/前奏点参数设定为零，效果与上条指令一致"]],

    ["BgmPause", ["暂停BGM"]],
    ["BgmResume", ["恢复BGM"]],

    ["BgmFadeOut", ["	@BgmFadeOut=fadeSpeed"
        , "淡出BGM"]],

    ["Bgs", ["	@Bgs=filename.MP3:fadeSpeed"
        , "	@BgsLoop=filename.MP3:fadeSpeed"
        , "定义BGS，BGS默认循环播放，请确认BGS素材可无缝循环"]],
    ["BgsLoop", ["	@Bgs=filename.MP3:fadeSpeed"
        , "	@BgsLoop=filename.MP3:fadeSpeed"
        , "定义BGS，BGS默认循环播放，请确认BGS素材可无缝循环"]],

    ["BgsPause", ["暂停BGS"]],
    ["BgsResume", ["恢复BGS"]],

    ["BgsFadeOut", ["	@BgsFadeOut:fadeSpeed"
        , "淡出BGS"]],

    ["Dub", ["	@Dub=filename.mp3"
        , "	@DubPlay=filename.mp3"
        , "更新语音内容，该语音会在显示下一句文本时播放，使用该指令会自动禁用语音序列"
        , "该指令所播放的音频文件类型由用户指定"]],
    ["DubPlay", ["	@Dub=filename.mp3"
        , "	@DubPlay=filename.mp3"
        , "更新语音内容，该语音会在显示下一句文本时播放，使用该指令会自动禁用语音序列"
        , "该指令所播放的音频文件类型由用户指定"]],

    ["DubSeque", ["启用/禁用语音序列，默认启用"
        , "变更`NowTalking`后会自动启用语音序列"
        , "使用`DubPlay`指令后会自动禁用语音序列"]],
    ["Ntk", ["	@NTK=NowTalking"
        , "	@NTKChange=NowTalking"
        , "变更`NowTalking`的值，并且在下一句语音开始播放对应的语音文件`NowTalking.OGG`"
        , "`NowTalking`默认从0开始"
        , "变更后会自动启用语音序列"]],
    ["NtkChange", ["	@NTK=NowTalking"
        , "	@NTKChange=NowTalking"
        , "变更`NowTalking`的值，并且在下一句语音开始播放对应的语音文件`NowTalking.OGG`"
        , "`NowTalking`默认从0开始"
        , "变更后会自动启用语音序列"]],

    ["PV", ["	@PV=FileName.AVI:StartPos"
        , "	@PlayVideo=FileName.AVI:StartPos"
        , "最基本的也是最简单的指令，从`StartPos`开始播放`FileName.AVI`，单位毫秒<等价于以下指令组合"
        , "	@OpenVideo=FileName.AVI"
        , "	@SetVideoPos=StartPos"
        , "	@VideoResume"]],
    ["PlayVideo", ["	@PV=FileName.AVI:StartPos"
        , "	@PlayVideo=FileName.AVI:StartPos"
        , "最基本的也是最简单的指令，从`StartPos`开始播放`FileName.AVI`，单位毫秒<等价于以下指令组合"
        , "	@OpenVideo=FileName.AVI"
        , "	@SetVideoPos=StartPos"
        , "	@VideoResume"]],
    ["OV", ["	@OV=FileName.AVI"
        , "	@OpenVideo=FileName.AVI"
        , "打开视频但并不播放，需要播放时请使用`@VideoResume`"]],
    ["OpenVideo", ["	@OV=FileName.AVI"
        , "	@OpenVideo=FileName.AVI"
        , "打开视频但并不播放，需要播放时请使用`@VideoResume`"]],
    ["CV", ["关闭视频"]],
    ["CloseVideo", ["关闭视频"]],
    ["VR", ["继续播放视频"]],
    ["VideoResume", ["继续播放视频"]],
    ["VP", ["暂停视频"]],
    ["VideoPause", ["暂停视频"]],
    ["VW", ["当前视频播放结束后才会进入下一阶段"]],
    ["VideoWait", ["当前视频播放结束后才会进入下一阶段"]],
    ["VL", ["设定当前视频循环播放"]],
    ["VideoLoop", ["设定当前视频循环播放"]],
    ["SVP", ["	@SVP=StartPos"
        , "	@SetVideoPos=StartPos"
        , "设置视频位置"]],
    ["SetVideoPos", ["	@SVP=StartPos"
        , "	@SetVideoPos=StartPos"
        , "设置视频位置"]],


    // keywords_effect

    ["CreateBlur", ["创建带有背景模糊的景深对象，对象保存至景深堆栈，默认ID从`-100`开始递减"
        , "该指令创建的景深对象位于演出对象最下方"]],
    ["AddBlur", ["	@AddBlur=Num"
        , "`@AddBlur`会转译为`Num`个`@CreateBlur`指令，创建结束的景深对象默认位于演出对象最下方。`Num`数值越大，模糊效果越强，留空默认为1"
        , "可使用`@Order`指令控制景深对象次序，使用`@CharAllDisopse`指令不会销毁景深对象。请勿使用`@CharDispose`指令销毁，该方法会破坏景深堆栈指针"]],
    ["RemoveBlur", ["	@RemoveBlur=Num"
        , "`@RemoveBlur`会转译为`Num`个`@DestroyBlur`指令，欲销毁全部景深对象，请将`Num`设定为一个较大的数，如`255`，实际指令转译最大只会进行当前景深对象数(即景深堆栈深度)次"]],
    ["DestroyBlur", ["移除景深堆栈最上方的景深对象"]],
    ["BackZoomParam", ["	@BackZoomParam:Easing_FuncA:Easing_FuncB"
        , "指定进行缩放时的Easing参数"]],
    ["BackZoomReset", ["按当前参数重置缩放，转译为指令`@BackZoom=0:0:ResolutionX:ResolutionY:10:0:0`在真实坐标模式下执行"]],
    ["BackZoom", ["	@BackZoom=X:Y:width:height:Speed:Instant:Forcewait"
        , "缩放到大小为`(width,height)`，区域中心坐标`(x,y)`指定缩放速度以及是否立即缩放"
        , "`Forcewait`参数为`0/1`，`0`表示默认在阶段二进行变化，`1`表示跨阶段变化"]],
    ["Shake", ["	@Shake=5000"
        , "震动一定时长后停止震动，单位为帧，通常情况下设定为60代表震动一秒"]],
    ["ShakeDir", ["	@ShakeDir=Dir"
        , "设置震动方向，`X=0`，`Y=1`"]],
    ["KeepShake", ["持续震动"]],
    ["KeepShakeOff", ["停止震动"]],
    ["Fade", ["创建淡入淡出叠化效果，会被转译为`@PatternFade`"
        , "默认情况下淡入速度较快，建议使用`#TransitionSpeed`指令修改叠化速度为5左右"]],
    ["DestroyFade", ["消除之前创建的所有叠化效果，会被转译为`@PatternFadeOut`"]],

    ["PF", ["	@PF:picname"
        , "	@PatternFade:picname"
        , "创建`Pattern`过渡元件，使用`pattern fade`读取`picname`图像叠化进入"]],
    ["PatternFade", ["	@PF:picname"
        , "	@PatternFade:picname"
        , "创建`Pattern`过渡元件，使用`pattern fade`读取`picname`图像叠化进入"]],
    ["PFO", ["	@PFO:picname"
        , "	@PatternFadeOut:picname:Orderable"
        , "使用`PatternFade`读取`picname`图像叠化退出使用`PatternFade`创建的对象，具有`Orderable`属性的对象可参与排序"
        , "该指令运行结束后会自动销毁该Pattern过渡元件"]],
    ["PatternFadeOut", ["	@PFO:picname"
        , "	@PatternFadeOut:picname:Orderable"
        , "使用`PatternFade`读取`picname`图像叠化退出使用`PatternFade`创建的对象，具有`Orderable`属性的对象可参与排序"
        , "该指令运行结束后会自动销毁该Pattern过渡元件"]],

    ["Rain", ["立即创建下雨效果，允许连续使用"]],
    ["Snow", ["立即创建下雪效果，允许连续使用"]],
    ["Normal", ["立即取消天气效果，允许连续使用"]],
    ["ToRain", ["逐渐创建下雨效果，不会在过渡状态2等待，不受到强制等待指令控制"]],
    ["ToSnow", ["逐渐创建下雪效果，不会在过渡状态2等待，不受到强制等待指令控制"]],
    ["ToNormal", ["逐渐取消天气效果，不会在过渡状态2等待，不受到强制等待指令控制"]],
    ["CrossFade", ["	@CrossFade:ID"
        , "为该对象下次叠化启用交错模式"
        , "ID留空，程序会尝试捕获最新调用叠化指令的对象，在叠化完成后，CrossFade会自动禁用"
        , "在叠化阶段开始指令前(等待/强制等待/文本)使用指令均有效，但从可读性角度建议写于相应叠化指令后"]],
    ["KeepRes",
        ["	@KeepRes:ID"
            , "	@KeepResolution:ID"
            , "该ID对应的对象会在叠化时保持当前设定的分辨率"]],
    ["KeepResolution", ["	@KeepRes:ID"
        , "	@KeepResolution:ID"
        , "该ID对应的对象会在叠化时保持当前设定的分辨率"]],

    ["KeepResOff", ["	@KeepResOff:ID"
        , "	@KeepResolutionOff:ID"
        , "该ID对应的对象会在叠化时重设分辨率为新图像的分辨率"]],
    ["KeepResolutionOff", ["	@KeepResOff:ID"
        , "	@KeepResolutionOff:ID"
        , "该ID对应的对象会在叠化时重设分辨率为新图像的分辨率"]],
    ["Sepia", ["	@Sepia:Strength:NoiseMotion:Period"
        , "	@SepiaToning:Strength:NoiseMotion:Period"
        , "创建强度为`Strength`的`Sepia Toning`对象，对象默认ID为`-5`。其中`Strength`应为一个`[0,1]`的浮点数，默认值为`0.5`，`NoiseMotion`参数控制噪声运动的开启与关闭，当设定为`1`或`On`的时候会启用噪声运动，运动周期为`Period`，单位毫秒，默认值为`-1`，即每帧更新。已经创建了`Sepia Toning`对象后调用该指令，该指令无效"]],
    ["SepiaToning", ["	@Sepia:Strength:NoiseMotion:Period"
        , "	@SepiaToning:Strength:NoiseMotion:Period"
        , "创建强度为`Strength`的`Sepia Toning`对象，对象默认ID为`-5`。其中`Strength`应为一个`[0,1]`的浮点数，默认值为`0.5`，`NoiseMotion`参数控制噪声运动的开启与关闭，当设定为`1`或`On`的时候会启用噪声运动，运动周期为`Period`，单位毫秒，默认值为`-1`，即每帧更新。已经创建了`Sepia Toning`对象后调用该指令，该指令无效"]],
    ["ChangeSepiaStrength", ["	@ChangeSepiaStrength:Strength"
        , "在演出执行阶段改变`Sepia Toning`对象的`Strength`，参数留空会将`Strength`设定为默认值`0.5`"]],
    ["SetSepiaNoiseMotion", ["	@SetSepiaNoiseMotion:On/Off"
        , "控制噪声运动的开启与关闭，设定为`1`或`On`时启用噪声运动，设定为`0`或`Off`时禁用噪声运动，参数为空会Toggle当前启用状态"]],
    ["ChangeSepiaNoiseMotionPeriod", ["	@ChangeSepiaNoiseMotionPeriod:Period"
        , "将噪声运动的运动周期设定为`Period`，单位毫秒，参数为空会将`Period`设定为默认值`-1`，一个典型的参考值为`300`毫秒"]],


    // keywords_preobj

    ["StrCenter", ["定义坐标参数留空时字符串的默认位置，该指令后创建的字符串默认居中"]],
    ["StrBottom", ["定义坐标参数留空时字符串的默认位置，该指令后创建的字符串默认底部居中"]],
    ["Str",
        ["	@Str=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@Str=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "	@String=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@String=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "	@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "	@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "创建字符串，字符串ID与图像ID相互独立"
            , "除输入完整参数外，字符串参数还允许通过单独指令修改。在字符串创建的解析循环中进行的修改会作用于创建叠化，其余场合使用指令修改参数是否进行叠化请参考具体指令说明"
            , "默认参数：字符串对象宽600，字符串对象高60；默认不透明度`0`；默认底部居中；默认字号`22`；默认字体`黑体`；默认颜色：黑色文字`RGB=(0,0,0)`，白色勾边`RGB=(255,255,255)`"]],
    ["String",
        ["	@Str=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@Str=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "	@String=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@String=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "	@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "	@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "创建字符串，字符串ID与图像ID相互独立"
            , "除输入完整参数外，字符串参数还允许通过单独指令修改。在字符串创建的解析循环中进行的修改会作用于创建叠化，其余场合使用指令修改参数是否进行叠化请参考具体指令说明"
            , "默认参数：字符串对象宽600，字符串对象高60；默认不透明度`0`；默认底部居中；默认字号`22`；默认字体`黑体`；默认颜色：黑色文字`RGB=(0,0,0)`，白色勾边`RGB=(255,255,255)`"]],
    ["CreateStr",
        ["	@Str=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@Str=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "	@String=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@String=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "	@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "	@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "	@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "创建字符串，字符串ID与图像ID相互独立"
            , "除输入完整参数外，字符串参数还允许通过单独指令修改。在字符串创建的解析循环中进行的修改会作用于创建叠化，其余场合使用指令修改参数是否进行叠化请参考具体指令说明"
            , "默认参数：字符串对象宽600，字符串对象高60；默认不透明度`0`；默认底部居中；默认字号`22`；默认字体`黑体`；默认颜色：黑色文字`RGB=(0,0,0)`，白色勾边`RGB=(255,255,255)`"]],
    ["CreateString", ["	@Str=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
        , "	@Str=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
        , "	@String=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
        , "	@String=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
        , "	@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
        , "	@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
        , "	@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
        , "	@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
        , "创建字符串，字符串ID与图像ID相互独立"
        , "除输入完整参数外，字符串参数还允许通过单独指令修改。在字符串创建的解析循环中进行的修改会作用于创建叠化，其余场合使用指令修改参数是否进行叠化请参考具体指令说明"
        , "默认参数：字符串对象宽600，字符串对象高60；默认不透明度`0`；默认底部居中；默认字号`22`；默认字体`黑体`；默认颜色：黑色文字`RGB=(0,0,0)`，白色勾边`RGB=(255,255,255)`"]],

    ["StrS", ["	@StrS=ID:Size"
        , "	@StrSize=ID:Size"
        , "无叠化，更改字符串字号"]],
    ["StrSize", ["	@StrS=ID:Size"
        , "	@StrSize=ID:Size"
        , "无叠化，更改字符串字号"]],
    ["StrF", ["	@StrF=ID:Font"
        , "	@StrFont=ID:Font"
        , "无叠化，更改字符串字体"]],
    ["StrFont", ["	@StrF=ID:Font"
        , "	@StrFont=ID:Font"
        , "无叠化，更改字符串字体"]],
    ["StrA", ["	@StrA=ID:120"
        , "	@StrAlpha=ID:120"
        , "切换对象到指定的不透明度"]],
    ["StrAlpha", ["	@StrA=ID:120"
        , "	@StrAlpha=ID:120"
        , "切换对象到指定的不透明度"]],

    ["StrC", ["	@StrC=ID:R:G:B"
        , "	@StrC=ID:#FFFFFF"
        , "	@StrColor=ID:R:G:B"
        , "	@StrColor=ID:#FFFFFF"
        , "无叠化，更改字符串颜色"]],
    ["StrColor", ["	@StrC=ID:R:G:B"
        , "	@StrC=ID:#FFFFFF"
        , "	@StrColor=ID:R:G:B"
        , "	@StrColor=ID:#FFFFFF"
        , "无叠化，更改字符串颜色"]],
    ["MS", ["	@MS=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "	@MoveStr=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "移动字符串对象，具体参数说明请参见`@MoveObj`一节，坐标受`@StrCenter`参数影响"]],
    ["MoveStr", ["	@MS=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "	@MoveStr=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "移动字符串对象，具体参数说明请参见`@MoveObj`一节，坐标受`@StrCenter`参数影响"]],
    ["DestroyStr", ["	@DestroyStr=ID"
        , "	@DestroyString=ID"
        , "销毁字符串"]],
    ["DestroyString", ["	@DestroyStr=ID"
        , "	@DestroyString=ID"
        , "销毁字符串"]],

    ["DestroyAllStr", ["销毁全部字符串对象"]],
    ["DestroyAllString", ["销毁全部字符串对象"]],



    ["Spe", ["该指令在调用前会在引擎内部更新`CoefStr`、`FolderStr`参数，定义转译后指令的文件路径、参数。**该指令为内部指令，请避免在脚本中使用。**"
        , "以使用内部指令`@Spe=dialog2.png`创建对话框为例"
        , "指令会被转译为`@Char=FolderStr+dialog2.png+CoefStr`，执行后更新相应参数"]],

    ["MO", ["	@MO=FixedValue:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "	@MoveObj=FixedValue:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "内部指令，`@MoveChar`与@`MoveStr`会被引擎转译为该指令执行"]],
    ["MoveObj", ["	@MO=FixedValue:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "	@MoveObj=FixedValue:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "内部指令，`@MoveChar`与@`MoveStr`会被引擎转译为该指令执行"]],

    ["CG", ["	@CG=filename.png"
        , "	@CGChange=filename.png"
        , "切换CG，叠化阶段进行"]],
    ["CGChange", ["	@CG=filename.png"
        , "	@CGChange=filename.png"
        , "切换CG，叠化阶段进行"]],

    ["CPF", ["	@CPF:picname:patternname:ID"
        , "	@CPatternFade:picname:patternname:ID"
        , "读取贴图，前景背景同时叠化"]],
    ["CPatternFade", ["	@CPF:picname:patternname:ID"
        , "	@CPatternFade:picname:patternname:ID"
        , "读取贴图，前景背景同时叠化"]],
    ["CPFI", ["	@CPFI:picname:patternname:ID"
        , "	@CPatternFadeIn:picname:patternname:ID"
        , "读取贴图，叠化至前景图像"]],
    ["CPatternFadeIn", ["	@CPFI:picname:patternname:ID"
        , "	@CPatternFadeIn:picname:patternname:ID"
        , "读取贴图，叠化至前景图像"]],
    ["CPFO",
        ["	@CPFO:picname:patternname:ID"
            , "	@CPatternFadeOut:picname:patternname:ID"
            , "读取贴图，叠化至背景图像"]],
    ["CPatternFadeOut", ["	@CPFO:picname:patternname:ID"
        , "	@CPatternFadeOut:picname:patternname:ID"
        , "读取贴图，叠化至背景图像"]],
    ["CGPFI", ["	@CGPFI:picname:patternname"
        , "	@CGPatternFadeIn:picname:patternname"
        , "转译指令，读取贴图，CG叠化至前景图像"]],
    ["CGPatternFadeIn", ["	@CGPFI:picname:patternname"
        , "	@CGPatternFadeIn:picname:patternname"
        , "转译指令，读取贴图，CG叠化至前景图像"]],

    ["CGPFO", ["	@CGPFO:picname:patternname"
        , "	@CGPatternFadeOut:picname:patternname"
        , "转译指令，读取贴图，CG叠化至背景图像"]],
    ["CGPatternFadeOut", ["	@CGPFO:picname:patternname"
        , "	@CGPatternFadeOut:picname:patternname"
        , "转译指令，读取贴图，CG叠化至背景图像"]],

    ["CharPF",
        ["	@CharPF:picname:patternname:ID"
            , "	@CharPatternFade:picname:patternname:ID"
            , "转译指令，读取贴图，叠化至前景图像。**不建议进行差分和不同对象的切换，而是将当前图像切换至透明图像来实现进场和退场效果**"]],
    ["CharPatternFade", ["	@CharPF:picname:patternname:ID"
        , "	@CharPatternFade:picname:patternname:ID"
        , "转译指令，读取贴图，叠化至前景图像。**不建议进行差分和不同对象的切换，而是将当前图像切换至透明图像来实现进场和退场效果**"]],

    ["Char", ["	@Char=filename.png:ID:Alpha:X:Y:Width:Height"
        , "	@Character=filename.png:ID:Alpha:X:Y:Width:Height"
        , "该指令用于创建图像：留空文件后缀名时，会默认图片格式为PNG；不透明度范围为0~255；文件名支持使用../返回上级路径；坐标系以画面中央底部为原点；坐标以图像中央底部为热点；长宽默认为图片原始尺寸，使用+/-指定增量时，会以原始尺寸为基础进行计算"]],
    ["Character", ["	@Char=filename.png:ID:Alpha:X:Y:Width:Height"
        , "	@Character=filename.png:ID:Alpha:X:Y:Width:Height"
        , "该指令用于创建图像：留空文件后缀名时，会默认图片格式为PNG；不透明度范围为0~255；文件名支持使用../返回上级路径；坐标系以画面中央底部为原点；坐标以图像中央底部为热点；长宽默认为图片原始尺寸，使用+/-指定增量时，会以原始尺寸为基础进行计算"]],

    ["CC", ["	@CC=filename:ID:alpha:width:height"
        , "	@CharChange=filename:ID:alpha:width:height"
        , "该指令用于切换为其他角色或动作：留空文件后缀名时，会默认图片格式为PNG；不透明度范围为0~255，该指令会重置`@CharAlpha`设定的不透明度；文件名支持使用../返回上级路径"
        , "交错模式：通常来说，切换角色时应启用交错模式，更改长宽比时，会自动切换为交错模式"
        , "长宽：默认为新图片原始尺寸，使用+/-指定增量时，会以原始尺寸为基础进行计算"]],
    ["CharChange", ["	@CC=filename:ID:alpha:width:height"
        , "	@CharChange=filename:ID:alpha:width:height"
        , "该指令用于切换为其他角色或动作：留空文件后缀名时，会默认图片格式为PNG；不透明度范围为0~255，该指令会重置`@CharAlpha`设定的不透明度；文件名支持使用../返回上级路径"
        , "交错模式：通常来说，切换角色时应启用交错模式，更改长宽比时，会自动切换为交错模式"
        , "长宽：默认为新图片原始尺寸，使用+/-指定增量时，会以原始尺寸为基础进行计算"]],

    ["CA", ["	@CA:ID:Alpha"
        , "	@CharAlpha:ID:Alpha"
        , "切换对象到指定的不透明度"]],
    ["CharAlpha", ["	@CA:ID:Alpha"
        , "	@CharAlpha:ID:Alpha"
        , "切换对象到指定的不透明度"]],

    ["CharRotate", ["	@CharRotate:ID:angle:clockwise:circlecount"
        , "旋转对象至目标角度与预定圈数，`clockwise = 1`为顺时针，`clockwise = -1`为逆时针"
        , "若目标角度设定为360度，旋转0圈，将持续旋转"
        , "该指令不可与立绘叠化同时使用"]],
    ["SetAutoArrange", ["	@SetAutoArrange=On/Off"
        , "控制自动间距功能的开启与关闭，设定为1或On时启用自动间距，设定为0或Off时禁用自动间距，参数为空会Toggle当前启用状态"
        , "启用自动间距后，新建/销毁立绘时会自动调整间距，最大支持处理六张立绘的间距"]],
    ["CD", ["	@CD:ID"
        , "	@CharDispose:ID"
        , "销毁并释放该ID对应的图像对象的本体和遮罩，会转译为`@CharAlpha:ID:255`并启用`Destroy`Flag"]],
    ["CharDispose", ["	@CD:ID"
        , "	@CharDispose:ID"
        , "销毁并释放该ID对应的图像对象的本体和遮罩，会转译为`@CharAlpha:ID:255`并启用`Destroy`Flag"]],

    ["CAD", ["销毁全部的图像对象，并释放其对应的本体和遮罩"
        , "CG/UI不会被销毁"]],
    ["CharAllDispose", ["销毁全部的图像对象，并释放其对应的本体和遮罩"
        , "CG/UI不会被销毁"]],
    ["MC", ["	@MC=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "	@MoveChar=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "移动图片对象，具体参数说明请参见`@MoveObj`一节"]],
    ["MoveChar", ["	@MC=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "	@MoveChar=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
        , "移动图片对象，具体参数说明请参见`@MoveObj`一节"]],

    ["HideUI", ["无叠化，隐藏菜单与快捷栏，会自动转译`#DisableUI`"]],
    ["ShowUI", ["无叠化，重新显示菜单与快捷栏，会自动转译`#EnableUI`"]],

    ["Order", ["	@Order=ID:Order:Type"
        , "无叠化，调整ID指定对象的层级，通过`Type`指定不同的对象类型"
        , "`Type`为`Pic`则移动`ID`对应的图像对象，`Type`为`Str`则移动`ID`对应的字符串对象"]],
    ["Front", ["	@Front=ID:Type"
        , "无叠化，将`ID`指定的`Type`对象移至顶层"]],
    ["Back", ["	@Back=ID:Type"
        , "无叠化，将`ID`指定的`Type`对象移至底层"]],
    ["Forward", ["	@Forward=ID:Num:Type"
        , "无叠化，将`ID`指定的`Type`对象上移`Num`层，参数留空默认上移一层"]],
    ["Backward", ["	@Backward=ID:Num:Type"
        , "无叠化，将`ID`指定的`Type`对象下移`Num`层，参数留空默认下移一层"]],
]);