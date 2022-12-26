/* eslint-disable @typescript-eslint/naming-convention */

import { ParamType, ParamFormat, inlayHintType } from "./dict";

export interface ParamInfo {
    prefix: string;
    minParam: number;
    maxParam: number;
    comment: string[];
    type: ParamType[];
    inlayHintType?: number[];
    internal?: boolean;
    deprecated?: boolean;
}

export let commandInfoList = new Map<string, ParamInfo>([
    //----------
    // Sharp
    //----------

    // keywords_region

    ["Begin", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["代码块开始/结束标志，允许你在编辑器中将代码段折叠，在引擎内部无任何效果"]
        , type: []
    }],
    ["End", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["代码块开始/结束标志，允许你在编辑器中将代码段折叠，在引擎内部无任何效果"]
        , type: []
    }],

    // keywords_system
    ["Error", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#Error=ErrorPic.png"
            , "内部指令，当引擎报错时会显示`Data\Graphic\_Sys`下对应的错误提示`ErrorPic.png`"]
        , type: [ParamType.File]
        , internal: true
    }],
    ["NULL", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["空指令，用于指令转译"]
        , type: []
    }],
    ["CacheClean", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#CacheClean=MemLimit"
            , "尝试清理未引用的缓存，直到当前内存占用低于`MemLimit`或无可清理缓存。`MemLimit = -1`将按照默认设置清理，`MemLimit = 0`将清理全部未引用缓存"
            , "注意:内存的分配与释放非常耗时，清理100MB内存大约需要10ms，可在黑屏淡出时进行清理，以避免可感知的卡顿，同时请尽量避免频繁清理"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.MemLimit]
    }],
    ["UnSkipAble", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["读取到该指令后，当前章节无法使用跳过按钮/快捷键跳过"]
        , type: []
    }],
    ["SkipAble", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["允许当前使用跳过按钮/快捷键跳过，用于取消`#UnSkipAble`"]
        , type: []
    }],
    ["SGO", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SGO=XOffset:YOffset"
            , "\t#SetGlobalOffset=XOffset:YOffset"
            , "设定演出对象的全局偏移量，特效、UI与字符串对象不受影响"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.XOffset, inlayHintType.YOffset]
    }],
    ["SetGlobalOffset", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SGO=XOffset:YOffset"
            , "\t#SetGlobalOffset=XOffset:YOffset"
            , "设定演出对象的全局偏移量，特效、UI与字符串对象不受影响"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.XOffset, inlayHintType.YOffset]
    }],
    ["TransitionSpeed", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#TransitionSpeed=Value"
            , "更改不透明度叠化速度，默认为`10`"
            , "参数设定为`default`可重置默认值"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.TransitionSpeed]
    }],
    ["SeparateTransitionSpeed", {
        prefix: "#"
        , minParam: 3, maxParam: 3
        , comment: ["\t#SeparateTransitionSpeed=ID:Type:Value"
            , "更改对象叠化速度，默认为`10`，参数设定为`default`可重置默认值"
            , "该值不为零时，会在叠化阶段覆盖全局叠化速度，并在叠化阶段结束后重置为零"]
        , type: [ParamType.Number, ParamType.ObjType, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Type, inlayHintType.TransitionSpeed]
    }],
    ["ForceTransition", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["该指令会截取当前窗口，并按照`TransitionSpeed`指定的速度进行淡出，用于为无法创建叠化的指令(如`@Order`、`#DefineRGB`等)强制添加叠化"]
        , type: []
    }],
    ["Save", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["保存中断存档"]
        , type: []
    }],
    ["Debug", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["调试模式下无叠化显示调试参数"]
        , type: []
    }],
    ["DebugOff", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["调试模式下无叠化关闭调试参数"]
        , type: []
    }],
    ["DefineRGB", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#DefineRGB=R:G:B"
            , "\t#DefineRGB=#FFFFFF"
            , "定义立绘的色调RGB值为`R:G:B/#FFFFFF`，无叠化更新所有立绘对象(非特殊非特效对象)的RGB参数。该指令通常用于根据背景光照情况调整立绘色调，可使用附带的`RGBDefiner`工具来直观的调整该参数"]
        , type: [ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],

    ["MSG", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#MSG=Message"
            , "仅调试模式下可用，于调试输出中输出Message"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.DebugMSG]
    }],
    ["MSGClear", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["仅调试模式下可用，清空调试输出，在翻页时会自动调用"]
        , type: []
    }],
    ["StopFF", {
        prefix: "#"
        , minParam: 0, maxParam: 1
        , comment: ["\t#StopFF=IgnoreDebug"
            , "解析至该语句后，快进将会在下一句文本处停止"
            , "默认仅调试模式下可用，`IgnoreDebug`为`1`时在通常模式下也可用"]
        , type: [ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.IgnoreDebug]
    }],
    ["StopFastForward", {
        prefix: "#"
        , minParam: 0, maxParam: 1
        , comment: ["\t#StopFF=IgnoreDebug"
            , "解析至该语句后，快进将会在下一句文本处停止"
            , "默认仅调试模式下可用，`IgnoreDebug`为`1`时在通常模式下也可用"]
        , type: [ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.IgnoreDebug]
    }],
    ["DisableUI", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["禁用UI"]
        , type: []
    }],
    ["EnableUI", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["启用UI"]
        , type: []
    }],
    ["UpdateUICoord", {
        prefix: "#"
        , minParam: 0, maxParam: 1
        , comment: ["\t#UpdateUICoord=Forced:CoordOnly"
            , "相对对话框更新UI坐标，`Forced = 1`时强制更新，`CoordOnly = 1`时不更新不透明度"]
        , type: [ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.Force]
        , internal: true
    }],
    ["FNT", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["强制无叠化，强制无叠化状态在解析到文本后重置为关闭"]
        , type: []
    }],
    ["ForceNoTransition", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["强制无叠化，强制无叠化状态在解析到文本后重置为关闭"]
        , type: []
    }],

    ["FNTO", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["关闭强制无叠化"]
        , type: []
    }],
    ["ForceNoTransitionOff", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["关闭强制无叠化"]
        , type: []
    }],

    ["EOF", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["文件尾标志，普通模式下解析到该指令即返回报错信息`脚本文件结尾必须为有效跳转`，`Lite`模式下则为执行完成标记"]
        , type: []
    }],
    ["WaitGeneral", {
        prefix: "#"
        , minParam: 0, maxParam: 1
        , comment: ["\t#WaitGeneral=Time"
            , "等待指令的公共调用，处理初始化、等待时间与状态机"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.WaitTime]
        , internal: true
    }],
    ["W", {
        prefix: "#"
        , minParam: 0, maxParam: 1
        , comment: ["\t#W=2000"
            , "\t#Wait=2000"
            , "等待指令:等待时间"
            , "等待指令只对**交叠淡化**有效"
            , "等待时间为零时，则会在当前叠化指令完成后立即继续解析操作"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.WaitTime]
    }],
    ["Wait", {
        prefix: "#"
        , minParam: 0, maxParam: 1
        , comment: ["\t#W=2000"
            , "\t#Wait=2000"
            , "等待指令:等待时间"
            , "等待指令只对**交叠淡化**有效"
            , "等待时间为零时，则会在当前叠化指令完成后立即继续解析操作"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.WaitTime]
    }],

    ["FW", {
        prefix: "#"
        , minParam: 0, maxParam: 1
        , comment: ["\t#FW=2000"
            , "\t#ForceWait=2000"
            , "强制等待指令:等待时间"
            , "强制等待指令对**移动旋转、BGM淡出淡出**等有效"
            , "等待时间为零时，则会在当前叠化指令完成后立即继续解析操作"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.WaitTime]
    }],
    ["ForceWait", {
        prefix: "#"
        , minParam: 0, maxParam: 1
        , comment: ["\t#FW=2000"
            , "\t#ForceWait=2000"
            , "强制等待指令:等待时间"
            , "强制等待指令对**移动旋转、BGM淡出淡出**等有效"
            , "等待时间为零时，则会在当前叠化指令完成后立即继续解析操作"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.WaitTime]
    }],
    ["AutoChangePage", {
        prefix: "#"
        , minParam: 0, maxParam: 1
        , comment: ["\t#AutoChangePage=Time"
            , "该指令后的文本会在等待时间后自动换行，覆盖自动与手动翻页操作"
            , "若不指定Time，则会使用当前设置中的默认翻页延时"
            , "\t#AutoChangePage=1500"
            , "\t……1"
            , "\t&……2"
            , "文本会先显示`……1`，等待1500毫秒，然后追加显示`&……2`，随后通常处理"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.DelayTime]
    }],
    ["TextDisplaySpeed", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#TextDisplaySpeed=Time"
            , "`Time`为显示间隔的毫秒数，该指令会覆盖当前行文本的显示速度，无视设置中的`ShowAll`属性"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.DelayTime]
    }],

    ["Jmp", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#JMP=Label"
            , "脚本内跳转，跳转到指定的标签位"
            , "置跳转标志位为1，跳转标志位在解析到文本后重置为0"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.Label]
    }],
    ["NJMP", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#NJMP=Label"
            , "检测并重置跳转标志位"
            , "若非跳转至此(跳转标志位等于0)，则跳转到指定的标签位，用于跳转后的再初始化"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.Label]
    }],
    ["Call", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#Call=Label"
            , "使用`#Call=Label`指令调用位于`Label`处的代码段。该代码段必须位于`#EOF`之前，且必须以`#Ret`结尾"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.Label]
    }],
    ["Ret", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["返回当前`Label`代码段的调用位点"]
        , type: []
    }],
    ["FJMP", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#FJMP=TargetFrame"
            , "\t#JmpFra=TargetFrame"
            , "跨场景跳转，跳转到场景`TargetFrame`，仅接受数字参数"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Frame]
    }],
    ["JmpFra", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#FJMP=TargetFrame"
            , "\t#JmpFra=TargetFrame"
            , "跨场景跳转，跳转到场景`TargetFrame`，仅接受数字参数"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Frame]
    }],

    ["CJMP", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#CJMP=Chapter"
            , "\t#JmpCha=Chapter"
            , "跨章节跳转，更新`CurrentChapter`，跳转到章节`Chapter`"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.Chapter]
    }],
    ["JmpCha", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#CJMP=Chapter"
            , "\t#JmpCha=Chapter"
            , "跨章节跳转，更新`CurrentChapter`，跳转到章节`Chapter`"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.Chapter]
    }],

    ["SJMP", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["跳转到下一个跳转指令并重启扫描，内部指令，用于跳过文本功能"
            , "置跳转标志位为1，跳转标志位在解析到文本后重置为0"]
        , type: []
    }],
    ["SkipJmp", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["跳转到下一个跳转指令并重启扫描，内部指令，用于跳过文本功能"
            , "置跳转标志位为1，跳转标志位在解析到文本后重置为0"]
        , type: []
        , internal: true
    }],
    ["SkipAnchor", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["该指令会被当作跳过终止指令处理。范例再初始化代码如下："
            , "\t#SkipAnchor"
            , "\t#NJMP=Init"
            , "\t#FNT"
            , "\t@CAD"
            , "\t@CG=NewCG.png"
            , "\t#TransitionSpeed=10"
            , "\t#FNTO"
            , "\t;Init"]
        , type: []
    }],

    ["SetSwitchColor", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#SetSwitchColor=R:G:B"
            , "\t#SetSwitchColor=#FFFFFF"
            , "指定通常选项的颜色"
            , "该指令对所有选项生效，请在`#CreateSwitch`前调用"]
        , type: [ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["SetSwitchHoverColor", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#SetSwitchHoverColor=R:G:B"
            , "\t#SetSwitchHoverColor=#FFFFFF"
            , "指定鼠标悬浮选项的颜色"
            , "该指令对所有选项生效，请在`#CreateSwitch`前调用"]
        , type: [ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["SetSwitchNegativeColor", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#SetSwitchNegativeColor=R:G:B"
            , "\t#SetSwitchNegativeColor=#FFFFFF"
            , "指定不可用选项的颜色"
            , "该指令对所有选项生效，请在`#CreateSwitch`前调用"]
        , type: [ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["SetSwitchShader", {
        prefix: "#"
        , minParam: 2, maxParam: 4
        , comment: ["\t#SetSwitchShader=Outline:R:G:B"
            , "\t#SetSwitchShader=Outline:#FFFFFF"
            , "指定通常选项的描边效果"
            , "该指令对所有选项生效，请在`#CreateSwitch`前调用"]
        , type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.OutlinePixel, inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],

    ["CreateSwitch", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#CreateSwitch=SwitchNum"
            , "选项分支创建的入口指令，用于创建`SwitchNum`个分支"
            , "该指令会记录当前扫描指针位置，用于保存/读取"
            , "同时转义为`#Wait`来执行该指令前的其他带叠化指令的演出"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.SwitchNum]
    }],
    ["Switch", {
        prefix: "#"
        , minParam: 4, maxParam: 4
        , comment: ["\t#Switch=X:Y:Text:Label"
            , "控制创建的分支选项，指定其X/Y坐标，选项文本与跳转标签"
            , "如果跳转标签定义为`Negative`，则该选项设定为灰色，无效"]
        , type: [ParamType.Number, ParamType.Number, ParamType.String, ParamType.String]
        , inlayHintType: [inlayHintType.X, inlayHintType.Y, inlayHintType.Text, inlayHintType.Label]
    }],
    ["UnlockAch", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#UnlockAch=Steam_AchName"
            , "解锁成就`Steam_AchName`"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.AchName]
    }],
    ["AddToStat", {
        prefix: "#"
        , minParam: 1, maxParam: 2
        , comment: ["\t#AddToStat=Steam_StatName:Steam_StatAdd"
            , "更新统计`Steam_StatName`，增加`Steam_StatAdd`"
            , "若`Steam_StatAdd`留空，默认为统计量+1"]
        , type: [ParamType.String, ParamType.Number]
        , inlayHintType: [inlayHintType.StatName, inlayHintType.StatAdd]
    }],
    ["UnlockAppreciation", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#UnlockAppreciation=ContentName:Page:Pos"
            , "解锁位于`Page`页第`Pos`个指向`ContentName`的鉴赏，`Page`与`Pos`参数从零开始。留空`Page`与`Pos`参数时，若启用了映射且映射定义合法，则依照定义解锁；若未启用映射，则依照记录数值依此解锁"
            , "该指令需要内部参数`AppreciationType`，因此不能直接调用，而是由下列指令转译后执行："]
        , type: [ParamType.String, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ContentName, inlayHintType.Page, inlayHintType.Pos]
        , internal: true
    }],
    ["UnlockAppreciation_Chapter", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#UnlockAppreciation_Chapter=ChapterName:Page:Pos"
            , "于场景回想中解锁位于`Page`页第`Pos`个指向`ChapterName`的鉴赏"
            , "含转译指令在内，解析到`#JMPFra`或`#JMPCha`指令后，会自动执行留空`Page`与`Pos`参数的指令"]
        , type: [ParamType.String, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ChapterName, inlayHintType.Page, inlayHintType.Pos]
    }],
    ["UnlockAppreciation_Graphic", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#UnlockAppreciation_Graphic=GraphicName:Page:Pos"
            , "于场景回想中解锁位于`Page`页第`Pos`个指向`GraphicName`的鉴赏。`ChapterName`应为`Characters`的相对路径，CG文件夹下的文件的完整`ChapterName`为`..CG\Graphic.png`"
            , "该指令会自动忽略非CG文件夹下的文件"
            , "含转译指令在内，解析到`@Char`或`@CharChange`指令后，会自动执行留空`Page`与`Pos`参数的指令"]
        , type: [ParamType.String, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.GraphicName, inlayHintType.Page, inlayHintType.Pos]
    }],
    ["UnlockAppreciation_Audio", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#UnlockAppreciation_Audio=AudioName:Page:Pos"
            , "于场景回想中解锁位于`Page`页第`Pos`个指向`AudioName`的鉴赏"
            , "含转译指令在内，解析到`@BGM`或`@BGMPre`指令后，会自动执行留空`Page`与`Pos`参数的指令"]
        , type: [ParamType.String, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.AudioName, inlayHintType.Page, inlayHintType.Pos]
    }],
    ["VNMode_Newline", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["在文本间插入一个空行。建议在对白文本前后使用，以示区分"]
        , type: []
    }],
    ["VNMode_ChangePage", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["切换页面"
            , "由于VN模式允许一个页面内显示多句文本，因此程序无法自动处理，需要手动指定翻页点。不进行翻页会导致文本显示出界"]
        , type: []
    }],


    ["SetCapture", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#SetCapture=ID"
            , "强制更新捕获ID为`ID`"
            , "在执行到下一个指定了ID的指令时，ID会被覆盖"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.CaptureID]
    }],
    ["CaptureSys", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#CaptureSys=On"
            , "是否捕获系统对象的ID，默认关闭"]
        , type: [ParamType.Boolean]
        , inlayHintType: [inlayHintType.Boolean]
    }],

    // keywords_values
    ["SV", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SV=ValueID:Value"
            , "\t#SetValue=ValueID:Value"
            , "令`ValueID`=`Value`，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则为数值赋值，否则为字符串赋值"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["SetValue", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SV=ValueID:Value"
            , "\t#SetValue=ValueID:Value"
            , "令`ValueID`=`Value`，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则为数值赋值，否则为字符串赋值"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["SVV", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SVV=ValueIDA:ValueIDB"
            , "\t#SetValueValue=ValueIDA:ValueIDB"
            , "\t#SVAB=ValueIDA:ValueIDB"
            , "\t#SetValueAB=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["SetValueValue", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SVV=ValueIDA:ValueIDB"
            , "\t#SetValueValue=ValueIDA:ValueIDB"
            , "\t#SVAB=ValueIDA:ValueIDB"
            , "\t#SetValueAB=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["SVAB", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SVV=ValueIDA:ValueIDB"
            , "\t#SetValueValue=ValueIDA:ValueIDB"
            , "\t#SVAB=ValueIDA:ValueIDB"
            , "\t#SetValueAB=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["SetValueAB", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SVV=ValueIDA:ValueIDB"
            , "\t#SetValueValue=ValueIDA:ValueIDB"
            , "\t#SVAB=ValueIDA:ValueIDB"
            , "\t#SetValueAB=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["SSS", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SSS=ValueIDA:ValueIDB"
            , "\t#SetStringString=ValueIDA:ValueIDB"
            , "\t#SSAB=ValueIDA:ValueIDB"
            , "\t#SetStringAB=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["SetStringString", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SSS=ValueIDA:ValueIDB"
            , "\t#SetStringString=ValueIDA:ValueIDB"
            , "\t#SSAB=ValueIDA:ValueIDB"
            , "\t#SetStringAB=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["SSAB", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SSS=ValueIDA:ValueIDB"
            , "\t#SetStringString=ValueIDA:ValueIDB"
            , "\t#SSAB=ValueIDA:ValueIDB"
            , "\t#SetStringAB=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["SetStringAB", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#SSS=ValueIDA:ValueIDB"
            , "\t#SetStringString=ValueIDA:ValueIDB"
            , "\t#SSAB=ValueIDA:ValueIDB"
            , "\t#SetStringAB=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["VA", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VA=ValueID:Value"
            , "\t#ValueAdd=ValueID:Value"
            , "`ValueID`=`ValueID`+`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["ValueAdd", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VA=ValueID:Value"
            , "\t#ValueAdd=ValueID:Value"
            , "`ValueID`=`ValueID`+`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["VAV", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VA=ValueID:Value"
            , "\t#ValueAdd=ValueID:Value"
            , "`ValueID`=`ValueID`+`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["ValueAddValue", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VA=ValueID:Value"
            , "\t#ValueAdd=ValueID:Value"
            , "`ValueID`=`ValueID`+`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["VS", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VS=ValueID"
            , "\t#ValueSub=ValueID:Value"
            , "`ValueID`=`ValueID`-`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["ValueSub", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VS=ValueID"
            , "\t#ValueSub=ValueID:Value"
            , "`ValueID`=`ValueID`-`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["VSV", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VS=ValueID"
            , "\t#ValueSub=ValueID:Value"
            , "`ValueID`=`ValueID`-`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["ValueSubValue", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VS=ValueID"
            , "\t#ValueSub=ValueID:Value"
            , "`ValueID`=`ValueID`-`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["VM", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VM=ValueID"
            , "\t#ValueMul=ValueID:Value"
            , "`ValueID`=`ValueID`*`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["ValueMul", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VM=ValueID"
            , "\t#ValueMul=ValueID:Value"
            , "`ValueID`=`ValueID`*`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["VMV", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VMV=ValueIDA:ValueIDB"
            , "\t#ValueMulValue=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDA`*`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["ValueMulValue", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VMV=ValueIDA:ValueIDB"
            , "\t#ValueMulValue=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDA`*`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["VD", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VD=ValueID"
            , "\t#ValueDiv=ValueID:Value"
            , "`ValueID`=`ValueID`/`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["ValueDiv", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VD=ValueID"
            , "\t#ValueDiv=ValueID:Value"
            , "`ValueID`=`ValueID`/`Value`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["VDV", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VDV=ValueIDA:ValueIDB"
            , "\t#ValueDivValue=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDA`/`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["ValueDivValue", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#VDV=ValueIDA:ValueIDB"
            , "\t#ValueDivValue=ValueIDA:ValueIDB"
            , "`ValueIDA`=`ValueIDA`/`ValueIDB`"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],

    ["CMP", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMP=ValueID:Value"
            , "\t#CMPV=ValueID:Value"
            , "\t#CMPValue=ValueID:Value"
            , "比较`ValueID`与`Value`的大小，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则与数值比较，否则与字符串比较"]
        , type: [ParamType.Number, ParamType.Any]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["CMPV", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMP=ValueID:Value"
            , "\t#CMPV=ValueID:Value"
            , "\t#CMPValue=ValueID:Value"
            , "比较`ValueID`与`Value`的大小，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则与数值比较，否则与字符串比较"]
        , type: [ParamType.Number, ParamType.Any]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["CMPValue", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMP=ValueID:Value"
            , "\t#CMPV=ValueID:Value"
            , "\t#CMPValue=ValueID:Value"
            , "比较`ValueID`与`Value`的大小，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则与数值比较，否则与字符串比较"]
        , type: [ParamType.Number, ParamType.Any]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.Value]
    }],
    ["CMPGeneral", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMPGeneral=Value:Value"
            , "不引用变量，直接比较两个值，规则与`#CMP`相同"]
        , type: [ParamType.Any, ParamType.Any]
        , inlayHintType: [inlayHintType.Value, inlayHintType.Value]
    }],
    ["CMPAB", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMPAB=ValueIDA:ValueIDB"
            , "\t#CMPVAB=ValueIDA:ValueIDB"
            , "\t#CMPValueAB=ValueIDA:ValueIDB"
            , "\t#CMPVV=ValueIDA:ValueIDB"
            , "\t#CMPValueValue=ValueIDA:ValueIDB"
            , "比较`ValueIDA`与`ValueIDB`的大小"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["CMPVAB", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMPAB=ValueIDA:ValueIDB"
            , "\t#CMPVAB=ValueIDA:ValueIDB"
            , "\t#CMPValueAB=ValueIDA:ValueIDB"
            , "\t#CMPVV=ValueIDA:ValueIDB"
            , "\t#CMPValueValue=ValueIDA:ValueIDB"
            , "比较`ValueIDA`与`ValueIDB`的大小"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["CMPValueAB", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMPAB=ValueIDA:ValueIDB"
            , "\t#CMPVAB=ValueIDA:ValueIDB"
            , "\t#CMPValueAB=ValueIDA:ValueIDB"
            , "\t#CMPVV=ValueIDA:ValueIDB"
            , "\t#CMPValueValue=ValueIDA:ValueIDB"
            , "比较`ValueIDA`与`ValueIDB`的大小"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["CMPVV", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMPAB=ValueIDA:ValueIDB"
            , "\t#CMPVAB=ValueIDA:ValueIDB"
            , "\t#CMPValueAB=ValueIDA:ValueIDB"
            , "\t#CMPVV=ValueIDA:ValueIDB"
            , "\t#CMPValueValue=ValueIDA:ValueIDB"
            , "比较`ValueIDA`与`ValueIDB`的大小"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["CMPValueValue", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMPAB=ValueIDA:ValueIDB"
            , "\t#CMPVAB=ValueIDA:ValueIDB"
            , "\t#CMPValueAB=ValueIDA:ValueIDB"
            , "\t#CMPVV=ValueIDA:ValueIDB"
            , "\t#CMPValueValue=ValueIDA:ValueIDB"
            , "比较`ValueIDA`与`ValueIDB`的大小"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["CMPSAB", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMPSAB=ValueIDA:ValueIDB"
            , "\t#CMPStringAB=ValueIDA:ValueIDB"
            , "\t#CMPSS=ValueIDA:ValueIDB"
            , "\t#CMPStringString=ValueIDA:ValueIDB"
            , "比较`ValueIDA`与`ValueIDB`的大小"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["CMPStringAB", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMPSAB=ValueIDA:ValueIDB"
            , "\t#CMPStringAB=ValueIDA:ValueIDB"
            , "\t#CMPSS=ValueIDA:ValueIDB"
            , "\t#CMPStringString=ValueIDA:ValueIDB"
            , "比较`ValueIDA`与`ValueIDB`的大小"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["CMPSS", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMPSAB=ValueIDA:ValueIDB"
            , "\t#CMPStringAB=ValueIDA:ValueIDB"
            , "\t#CMPSS=ValueIDA:ValueIDB"
            , "\t#CMPStringString=ValueIDA:ValueIDB"
            , "比较`ValueIDA`与`ValueIDB`的大小"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],
    ["CMPStringString", {
        prefix: "#"
        , minParam: 2, maxParam: 2
        , comment: ["\t#CMPSAB=ValueIDA:ValueIDB"
            , "\t#CMPStringAB=ValueIDA:ValueIDB"
            , "\t#CMPSS=ValueIDA:ValueIDB"
            , "\t#CMPStringString=ValueIDA:ValueIDB"
            , "比较`ValueIDA`与`ValueIDB`的大小"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ValueID, inlayHintType.ValueID]
    }],

    ["JE", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#JE=Label"
            , "比较结果等于时，跳转至`Label`"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.Label]
    }],
    ["JA", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#JE=Label"
            , "比较结果大于时，跳转至`Label`"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.Label]
    }],
    ["JB", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#JE=Label"
            , "比较结果小于时，跳转至`Label`"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.Label]
    }],
    ["JNE", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#JE=Label"
            , "比较结果不等于时，跳转至`Label`"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.Label]
    }],

    // keywords_dialogue

    ["DiaColor", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#DiaColor=R:G:B"
            , "\t#DiaColor=#FFFFFF"
            , "定义对白文字的RGB值，`R:G:B/#FFFFFF`"
            , "字体颜色无法设置为`(255,255,255)/#FFFFFF`，否则会导致勾边错误"]
        , type: [ParamType.Color]
        , inlayHintType: [inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["DiaSize", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["t#DiaSize=size"
            , "定义对白文字的大小，AVG模式下默认大小为17，VN模式下默认大小为18"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Size]
    }],
    ["DiaFont", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#DiaFont=font"
            , "定义对白文字的字体"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.Font]
    }],

    ["DiaShaderOn", {
        prefix: "#"
        , minParam: 2, maxParam: 4
        , comment: ["\t#DiaShaderOn=OutlinePixel:R:G:B"
            , "\t#DiaShaderOn=OutlinePixel:#FFFFFF"
            , "启用对白勾边，勾边颜色为`RGB/#FFFFFF`，勾边像素数为`OutlinePixel`"]
        , type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.OutlinePixel, inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["DiaShaderOff", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["关闭对白勾边效果"]
        , type: []
    }],

    ["DiaOutColor", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#DiaOutColor=R:G:B"
            , "\t#DiaOutColor=#FFFFFF"
            , "启用勾边时，更改对白勾边颜色为`RGB/#FFFFFF`"]
        , type: [ParamType.Color]
        , inlayHintType: [inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["DiaOutPixel", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#DiaOutPixel=OutlinePixel"
            , "启用勾边时，更改对白勾边像素数为`OutlinePixel`"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.OutlinePixel]
    }],
    ["DiaShadow", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#DiaShadow=On/Off"
            , "打开或关闭阴影模式，该模式仅在描边启用时有效"]
        , type: [ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.ShadowMode]
    }],

    ["NameColor", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#NameColor=R:G:B"
            , "\t#NameColor=#FFFFFF"
            , "定义姓名文字的RGB值，`R:G:B/#FFFFFF`"
            , "字体颜色无法设置为`(255,255,255)/#FFFFFF`，否则会导致勾边错误"]
        , type: [ParamType.Color]
        , inlayHintType: [inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["NameSize", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#NameSize=size"
            , "定义姓名文字的大小，默认大小为18"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Size]
    }],
    ["NameFont", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#NameFont=font"
            , "定义姓名文字的字体"]
        , type: [ParamType.String]
        , inlayHintType: [inlayHintType.Font]
    }],

    ["NameShaderOn", {
        prefix: "#"
        , minParam: 2, maxParam: 4
        , comment: ["\t#NameShaderOn=OutlinePixel:R:G:B"
            , "\t#NameShaderOn=OutlinePixel:#FFFFFF"
            , "启用姓名勾边，勾边颜色为`RGB/#FFFFFF`，勾边像素数为`OutlinePixel`"]
        , type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.OutlinePixel, inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["NameShaderOff", {
        prefix: "#"
        , minParam: 0, maxParam: 0
        , comment: ["关闭姓名勾边效果"]
        , type: []
    }],

    ["NameOutColor", {
        prefix: "#"
        , minParam: 1, maxParam: 3
        , comment: ["\t#NameOutColor=R:G:B"
            , "\t#NameOutColor=#FFFFFF"
            , "启用勾边时，更改姓名勾边颜色为`RGB/#FFFFFF`"]
        , type: [ParamType.Color]
        , inlayHintType: [inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["NameOutPixel", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#NameOutPixel=OutlinePixel"
            , "启用勾边时，更改对白勾边像素数为`OutlinePixel`"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.OutlinePixel]
    }],
    ["NameShadow", {
        prefix: "#"
        , minParam: 1, maxParam: 1
        , comment: ["\t#NameShadow=On/Off"
            , "打开或关闭阴影模式，该模式仅在描边启用时有效"]
        , type: [ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.ShadowMode]
    }],

    //----------
    // At
    //----------

    ["Dia", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@Dia=filename.png"
            , "\t@DiaChange=filename.png"
            , "切换对话框，解析到文本后进行，调用指令`@DiaTrans`"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.DiaFileName]
    }],
    ["DiaChange", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@Dia=filename.png"
            , "\t@DiaChange=filename.png"
            , "切换对话框，解析到文本后进行，调用指令`@DiaTrans`"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.DiaFileName]
    }],
    ["DiaTrans", {
        prefix: "@"
        , minParam: 0, maxParam: 1
        , comment: ["\t@DiaTrans=force"
            , "内部转译指令，判定并更新对话框"
            , "`force` = `1`时，强制执行叠化"]
        , type: [ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.Force]
        , internal: true
    }],
    ["Name", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@Name=filename.png"
            , "\t@NameChange=filename.png"
            , "切换姓名栏，解析到文本后进行，调用指令`@NameTrans`"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.NameFileName]
    }],
    ["NameChange", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@Name=filename.png"
            , "\t@NameChange=filename.png"
            , "切换姓名栏，解析到文本后进行，调用指令`@NameTrans`"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.NameFileName]
    }],
    ["NameTrans", {
        prefix: "@"
        , minParam: 0, maxParam: 1
        , comment: ["\t@NameTrans=force"
            , "内部转译指令，判定并更新姓名栏"
            , "`force` = `1`时，强制执行叠化"]
        , type: [ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.Force]
        , internal: true
    }],
    ["StashUIGraphic", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["保存UI图像，用于在`@TextFadeOut`后还原"]
        , type: []
    }],
    ["RestoreUIGraphic", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["还原`@StashUIGraphic`保存的信息"]
        , type: []
    }],
    ["TextFadeOut", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["该指令会自动转译为"
            , "\t@Name=NameNull.png"
            , "\t@NameTrans"
            , "\t@Dia=DiaNull.png"
            , "\t@DiaTrans"]
        , type: []
    }],

    // keywords_media

    ["P", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@P=filename.mp3:volume:channel"
            , "\t@Play=filename.mp3:volume:channel"
            , "在指定的频道内以指定的音量播放一次`Audio`文件夹下指定的音频文件"
            , "其中`volume`可以直接接受`BGM`、`BGS`、`SE`、`DUB`作为参数来返回对应通道的音量"
            , "系统默认占用`1~5`号通道，用户可以安全使用的为`6~48`号通道"]
        , type: [ParamType.File, ParamType.String, ParamType.Number]
        , inlayHintType: [inlayHintType.AudioFileName, inlayHintType.Volume, inlayHintType.Channel]
    }],
    ["Play", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@P=filename.mp3:volume:channel"
            , "\t@Play=filename.mp3:volume:channel"
            , "在指定的频道内以指定的音量播放一次`Audio`文件夹下指定的音频文件"
            , "其中`volume`可以直接接受`BGM`、`BGS`、`SE`、`DUB`作为参数来返回对应通道的音量"
            , "系统默认占用`1~5`号通道，用户可以安全使用的为`6~48`号通道"]
        , type: [ParamType.File, ParamType.String, ParamType.Number]
        , inlayHintType: [inlayHintType.AudioFileName, inlayHintType.Volume, inlayHintType.Channel]
    }],

    ["Stop", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@Stop=channel"
            , "停止特定通道的音频播放"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Channel]
    }],

    ["Se", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@SE=filename.MP3"
            , "播放SE"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.SEFileName]
    }],

    ["Bgm", {
        prefix: "@"
        , minParam: 1, maxParam: 4
        , comment: ["\t@Bgm=filename.MP3:fadeSpeed:StartPoint:endpoint"
            , "\t@BgmLoop=filename.MP3:fadeSpeed:StartPoint:endpoint"
            , "定义BGM的A-B循环，从起点开始循环播放到终点，淡入速度为淡入持续秒数，等待淡入淡出属于强制等待"
            , "淡入淡出速度为持续秒数，等待淡入淡出属于强制等待"
            , "循环起始点/循环终止点参数设定为零，引擎会进行整曲循环"]
        , type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.BGMFileName, inlayHintType.FadeSpeed, inlayHintType.StartPoint, inlayHintType.EndPoint]
    }],
    ["BgmLoop", {
        prefix: "@"
        , minParam: 1, maxParam: 4
        , comment: ["\t@Bgm=filename.MP3:fadeSpeed:StartPoint:endpoint"
            , "\t@BgmLoop=filename.MP3:fadeSpeed:StartPoint:endpoint"
            , "定义BGM的A-B循环，从起点开始循环播放到终点，淡入速度为淡入持续秒数，等待淡入淡出属于强制等待"
            , "淡入淡出速度为持续秒数，等待淡入淡出属于强制等待"
            , "循环起始点/循环终止点参数设定为零，引擎会进行整曲循环"]
        , type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.BGMFileName, inlayHintType.FadeSpeed, inlayHintType.StartPoint, inlayHintType.EndPoint]
    }],

    ["BgmPre", {
        prefix: "@"
        , minParam: 1, maxParam: 5
        , comment: ["\t@BgmPre=filename.MP3:fadeSpeed:StartPoint:endpoint:PreludePoint"
            , "\t@BgmPreludeLoop=filename.MP3:fadeSpeed:StartPoint:endpoint:PreludePoint"
            , "定义BGM有前奏的A-B循环，从前奏点开始播放，播放至循环终点后，在循环起点和循环终点间循环播放"
            , "淡入淡出速度为持续秒数，等待淡入淡出属于强制等待"
            , "循环起始点/循环终止点/前奏点参数设定为零，效果与上条指令一致"]
        , type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.BGMFileName, inlayHintType.FadeSpeed, inlayHintType.StartPoint, inlayHintType.EndPoint, inlayHintType.PreludePoint]
    }],
    ["BgmPreludeLoop", {
        prefix: "@"
        , minParam: 1, maxParam: 5
        , comment: ["\t@BgmPre=filename.MP3:fadeSpeed:StartPoint:endpoint:PreludePoint"
            , "\t@BgmPreludeLoop=filename.MP3:fadeSpeed:StartPoint:endpoint:PreludePoint"
            , "定义BGM有前奏的A-B循环，从前奏点开始播放，播放至循环终点后，在循环起点和循环终点间循环播放"
            , "淡入淡出速度为持续秒数，等待淡入淡出属于强制等待"
            , "循环起始点/循环终止点/前奏点参数设定为零，效果与上条指令一致"]
        , type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.BGMFileName, inlayHintType.FadeSpeed, inlayHintType.StartPoint, inlayHintType.EndPoint, inlayHintType.PreludePoint]
    }],

    ["BgmPause", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["暂停BGM"]
        , type: []
    }],
    ["BgmResume", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["恢复BGM"]
        , type: []
    }],

    ["BgmFadeOut", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@BgmFadeOut=fadeSpeed"
            , "淡出BGM"
            , "淡入淡出速度为持续秒数，等待淡入淡出属于强制等待"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.FadeSpeed]
    }],

    ["Bgs", {
        prefix: "@"
        , minParam: 1, maxParam: 2
        , comment: ["\t@Bgs=filename.MP3:fadeSpeed"
            , "\t@BgsLoop=filename.MP3:fadeSpeed"
            , "定义BGS，BGS默认循环播放，请确认BGS素材可无缝循环"
            , "淡入淡出速度为持续秒数，等待淡入淡出属于强制等待"]
        , type: [ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.BGSFileName, inlayHintType.FadeSpeed]
    }],
    ["BgsLoop", {
        prefix: "@"
        , minParam: 1, maxParam: 2
        , comment: ["\t@Bgs=filename.MP3:fadeSpeed"
            , "\t@BgsLoop=filename.MP3:fadeSpeed"
            , "定义BGS，BGS默认循环播放，请确认BGS素材可无缝循环"
            , "淡入淡出速度为持续秒数，等待淡入淡出属于强制等待"]
        , type: [ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.BGSFileName, inlayHintType.FadeSpeed]
    }],

    ["BgsPause", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["暂停BGS"]
        , type: []
    }],
    ["BgsResume", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["恢复BGS"]
        , type: []
    }],

    ["BgsFadeOut", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@BgsFadeOut=fadeSpeed"
            , "淡出BGS"
            , "淡入淡出速度为持续秒数，等待淡入淡出属于强制等待"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.FadeSpeed]
    }],

    ["Dub", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@Dub=filename.mp3"
            , "\t@DubPlay=filename.mp3"
            , "更新语音内容，该语音会在显示下一句文本时播放，使用该指令会自动禁用语音序列"
            , "该指令所播放的音频文件类型由用户指定"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.DubFileName]
    }],
    ["DubPlay", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@Dub=filename.mp3"
            , "\t@DubPlay=filename.mp3"
            , "更新语音内容，该语音会在显示下一句文本时播放，使用该指令会自动禁用语音序列"
            , "该指令所播放的音频文件类型由用户指定"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.DubFileName]
    }],

    ["DubSeque", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["启用语音序列，默认启用"
            , "变更`NowTalking`后会自动启用语音序列"
            , "使用`DubPlay`指令后会自动禁用语音序列"]
        , type: []
    }],
    ["DubSequeOff", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["禁用语音序列，默认启用"
            , "变更`NowTalking`后会自动启用语音序列"
            , "使用`DubPlay`指令后会自动禁用语音序列"]
        , type: []
    }],
    ["Ntk", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@NTK=NowTalking"
            , "\t@NTKChange=NowTalking"
            , "变更`NowTalking`的值，并且在下一句语音开始播放对应的语音文件`NowTalking.OGG`"
            , "`NowTalking`默认从0开始"
            , "变更后会自动启用语音序列"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.NowTalking]
    }],
    ["NtkChange", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@NTK=NowTalking"
            , "\t@NTKChange=NowTalking"
            , "变更`NowTalking`的值，并且在下一句语音开始播放对应的语音文件`NowTalking.OGG`"
            , "`NowTalking`默认从0开始"
            , "变更后会自动启用语音序列"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.NowTalking]
    }],

    ["PV", {
        prefix: "@"
        , minParam: 1, maxParam: 2
        , comment: ["\t@PV=FileName.AVI:StartPos"
            , "\t@PlayVideo=FileName.AVI:StartPos"
            , "最基本的也是最简单的指令，从`StartPos`开始播放`FileName.AVI`，单位毫秒，等价于以下指令组合"
            , "\t@OpenVideo=FileName.AVI:StartPos"
            , "\t@VideoResume"]
        , type: [ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.VideoFileName, inlayHintType.StartPoint]
    }],
    ["PlayVideo", {
        prefix: "@"
        , minParam: 1, maxParam: 2
        , comment: ["\t@PV=FileName.AVI:StartPos"
            , "\t@PlayVideo=FileName.AVI:StartPos"
            , "最基本的也是最简单的指令，从`StartPos`开始播放`FileName.AVI`，单位毫秒，等价于以下指令组合"
            , "\t@OpenVideo=FileName.AVI:StartPos"
            , "\t@VideoResume"]
        , type: [ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.VideoFileName, inlayHintType.StartPoint]
    }],
    ["ChangeVideo", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@ChangeVideo=FileName.AVI"
            , "切换视频，新打开的视频会自动切换至当前视频的进度，用于无缝切换差分视频"
            , "若当前正在播放视频，则该指令转义为:"
            , "\t@PlayVideo=FileName.AVI:CurrentVideoPosition"
            , "否则转义为:"
            , "\t@OpenVideo=FileName.AVI:CurrentVideoPosition"
            , "视频的循环状态和循环叠化会被保留"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.VideoFileName]
    }],
    ["OV", {
        prefix: "@"
        , minParam: 1, maxParam: 2
        , comment: ["\t@OV=FileName.AVI:StartPos"
            , "\t@OpenVideo=FileName.AVI:StartPos"
            , "打开视频至`StartPos`，但并不播放，需要播放时请使用`@VideoResume`"
            , "若已经打开了视频，会抓取旧视频的当前帧作为CG进行过渡，否则则抓取新视频的首帧作为CG进行过渡"]
        , type: [ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.VideoFileName, inlayHintType.StartPoint]
    }],
    ["OpenVideo", {
        prefix: "@"
        , minParam: 1, maxParam: 2
        , comment: ["\t@OV=FileName.AVI:StartPos"
            , "\t@OpenVideo=FileName.AVI:StartPos"
            , "打开视频至`StartPos`，但并不播放，需要播放时请使用`@VideoResume`"
            , "若已经打开了视频，会抓取旧视频的当前帧作为CG进行过渡，否则则抓取新视频的首帧作为CG进行过渡"]
        , type: [ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.VideoFileName, inlayHintType.StartPoint]
    }],
    ["CV", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["抓取当前帧作为CG，并关闭视频"]
        , type: []
    }],
    ["CloseVideo", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["抓取当前帧作为CG，并关闭视频"]
        , type: []
    }],
    ["CloseVideo_Core", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["不考虑当前情况与过渡直接关闭视频，用于历史记录跳转等场合"]
        , type: []
        , internal: true
    }],
    ["VR", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["继续播放视频"]
        , type: []
    }],
    ["VideoResume", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["继续播放视频"]
        , type: []
    }],
    ["VP", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["暂停视频"]
        , type: []
    }],
    ["VideoPause", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["暂停视频"]
        , type: []
    }],
    ["VW", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["当前视频播放结束后才会进入下一阶段"]
        , type: []
    }],
    ["VideoWait", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["当前视频播放结束后才会进入下一阶段"]
        , type: []
    }],
    ["VL", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["\t@VideoLoop=LoopTransition"
            , "设定当前视频循环播放，若`LoopTransition = 1`，则会在循环结束时叠化至视频开头，适用于视频本身非无缝循环的场合"]
        , type: []
    }],
    ["VideoLoop", {
        prefix: "@"
        , minParam: 0, maxParam: 1
        , comment: ["\t@VideoLoop=LoopTransition"
            , "设定当前视频循环播放，若`LoopTransition = 1`，则会在循环结束时叠化至视频开头，适用于视频本身非无缝循环的场合"]
        , type: [ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.LoopTransition]
    }],
    ["SVP", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@SVP=StartPos"
            , "\t@SetVideoPos=StartPos"
            , "设置视频位置"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.StartPoint]
    }],
    ["SetVideoPos", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@SVP=StartPos"
            , "\t@SetVideoPos=StartPos"
            , "设置视频位置"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.StartPoint]
    }],
    ["VideoCache", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@VideoCache=FilePath"
            , "缓存视频，用于节省读取加密视频的用时。非加密视频会直接读取磁盘，因此无需缓存"
            , "若运行于非加密模式或若视频已被缓存，则不会执行任何操作"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.VideoFileName]
    }],
    ["VideoErase", {
        prefix: "@"
        , minParam: 0, maxParam: 1
        , comment: ["\t@VideoErase=FilePath"
            , "清除已缓存的视频，若不指定`FilePath`，则会清除所有缓存的视频"
            , "当前正在被使用的视频不会被清除"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.VideoFileName]
    }],

    // keywords_effect

    ["CreateBlur", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["创建带有背景模糊的景深对象，对象保存至景深堆栈，默认ID从`-100`开始递减"
            , "该指令创建的景深对象位于演出对象最下方"]
        , type: []
    }],
    ["AddBlur", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@AddBlur=Num"
            , "`@AddBlur`会转译为`Num`个`@CreateBlur`指令，创建结束的景深对象默认位于演出对象最下方。`Num`数值越大，模糊效果越强，留空默认为1"
            , "可使用`@Order`指令控制景深对象次序，使用`@CharAllDispose`指令不会销毁景深对象。请勿使用`@CharDispose`指令销毁，该方法会破坏景深堆栈指针"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Num]
    }],
    ["RemoveBlur", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@RemoveBlur=Num"
            , "`@RemoveBlur`会转译为`Num`个`@DestroyBlur`指令，欲销毁全部景深对象，请将`Num`设定为一个较大的数，如`255`，实际指令转译最大只会进行当前景深对象数(即景深堆栈深度)次"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Num]
    }],
    ["DestroyBlur", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["移除景深堆栈最上方的景深对象"]
        , type: []
    }],
    ["BackZoomParam", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@BackZoomParam=Easing_FuncA:Easing_FuncB"
            , "指定进行缩放时的Easing参数"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.Easing_FuncA, inlayHintType.Easing_FuncB]
    }],
    ["BackZoomReset", {
        prefix: "@"
        , minParam: 1, maxParam: 3
        , comment: ["\t@BackZoomReset=Speed:Instant:ForceWait"
            , "按当前参数重置缩放，转译为指令`@BackZoom=0:0:ResolutionX:ResolutionY:Speed:Instant:ForceWait`在真实坐标模式下执行"]
        , type: [ParamType.Number, ParamType.ZeroOne, ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.Speed, inlayHintType.Instant, inlayHintType.CrossState]
    }],
    ["BackZoom", {
        prefix: "@"
        , minParam: 5, maxParam: 7
        , comment: ["\t@BackZoom=X:Y:width:height:Speed:Instant:ForceWait"
            , "缩放到大小为`(width,height)`，区域中心坐标`(x,y)`指定缩放速度以及是否立即缩放"
            , "`ForceWait`参数为`0/1`，`0`表示默认在阶段二进行变化，`1`表示跨阶段变化"]
        , type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.ZeroOne, ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.X, inlayHintType.Y, inlayHintType.Width, inlayHintType.Height, inlayHintType.Speed, inlayHintType.Instant, inlayHintType.CrossState]
    }],
    ["ShakeDir", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@ShakeDir=Dir"
            , "设置震动方向，`X=0`，`Y=1`"]
        , type: [ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.Dir]
    }],
    ["ShakeCoef", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@ShakeCoef=Strength"
            , "设置震动强度"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Strength]
    }],
    ["ShakeAttenuation", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@ShakeAttenuation=On"
            , "设置震动幅度衰减，仅适用于模式0"]
        , type: [ParamType.Boolean]
        , inlayHintType: [inlayHintType.Boolean]
    }],
    ["ShakeAttenuationParam", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@ShakeAttenuationParam=FuncA:FuncB"
            , "设置震动衰减Easing参数"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.Easing_FuncA, inlayHintType.Easing_FuncA]
    }],
    ["Shake", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["震动一定时长后停止震动，单位为帧，通常情况下设定为60代表震动一秒"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Duration]
    }],
    ["KeepShake", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["持续震动"]
        , type: []
    }],
    ["KeepShakeOff", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["停止震动"]
        , type: []
    }],
    ["Fade", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["创建淡入淡出叠化效果，会被转译为`@PatternFade`"]
        , type: []
    }],
    ["DestroyFade", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["消除之前创建的所有叠化效果，会被转译为`@PatternFadeOut`"]
        , type: []
    }],

    ["PF", {
        prefix: "@"
        , minParam: 1, maxParam: 2
        , comment: ["\t@PF=PicName:Orderable"
            , "\t@PatternFade=PicName:Orderable"
            , "创建`Pattern`过渡元件，使用`pattern fade`读取`PicName`图像叠化进入"]
        , type: [ParamType.File, ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.PatternFadeFileName, inlayHintType.Orderable]
    }],
    ["PatternFade", {
        prefix: "@"
        , minParam: 1, maxParam: 2
        , comment: ["\t@PF=PicName:Orderable"
            , "\t@PatternFade=PicName:Orderable"
            , "创建`Pattern`过渡元件，使用`pattern fade`读取`PicName`图像叠化进入"]
        , type: [ParamType.File, ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.PatternFadeFileName, inlayHintType.Orderable]
    }],
    ["PFO", {
        prefix: "@"
        , minParam: 1, maxParam: 2
        , comment: ["\t@PFO=PicName"
            , "\t@PatternFadeOut=PicName:Orderable"
            , "使用`PatternFade`读取`PicName`图像叠化退出使用`PatternFade`创建的对象，具有`Orderable`属性的对象可参与排序"
            , "该指令运行结束后会自动销毁该Pattern过渡元件"]
        , type: [ParamType.File, ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.PatternFadeFileName, inlayHintType.Orderable]
    }],
    ["PatternFadeOut", {
        prefix: "@"
        , minParam: 1, maxParam: 2
        , comment: ["\t@PFO=PicName"
            , "\t@PatternFadeOut=PicName:Orderable"
            , "使用`PatternFade`读取`PicName`图像叠化退出使用`PatternFade`创建的对象，具有`Orderable`属性的对象可参与排序"
            , "该指令运行结束后会自动销毁该Pattern过渡元件"]
        , type: [ParamType.File, ParamType.ZeroOne]
        , inlayHintType: [inlayHintType.PatternFadeFileName, inlayHintType.Orderable]
    }],

    ["Rain", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["立即创建下雨效果，允许连续使用"]
        , type: []
    }],
    ["Snow", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["立即创建下雪效果，允许连续使用"]
        , type: []
    }],
    ["Normal", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["立即取消天气效果，允许连续使用"]
        , type: []
    }],
    ["ToRain", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["逐渐创建下雨效果，不会在过渡状态2等待，不受到强制等待指令控制"]
        , type: []
    }],
    ["ToSnow", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["逐渐创建下雪效果，不会在过渡状态2等待，不受到强制等待指令控制"]
        , type: []
    }],
    ["ToNormal", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["逐渐取消天气效果，不会在过渡状态2等待，不受到强制等待指令控制"]
        , type: []
    }],

    ["CrossFade", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@CrossFade=ID"
            , "为该对象下次叠化启用交错模式"
            , "ID留空，程序会尝试捕获最新调用叠化指令的对象，在叠化完成后，CrossFade会自动禁用"
            , "在叠化阶段开始指令前(等待/强制等待/文本)使用指令均有效，但从可读性角度建议写于相应叠化指令后"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID]
    }],

    ["KeepRes", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@KeepRes=ID"
            , "\t@KeepResolution=ID"
            , "该ID对应的对象会在叠化时保持当前设定的分辨率"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID]
    }],
    ["KeepResolution", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@KeepRes=ID"
            , "\t@KeepResolution=ID"
            , "该ID对应的对象会在叠化时保持当前设定的分辨率"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID]
    }],

    ["KeepResOff", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@KeepResOff=ID"
            , "\t@KeepResolutionOff=ID"
            , "该ID对应的对象会在叠化时重设分辨率为新图像的分辨率"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID]
    }],
    ["KeepResolutionOff", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@KeepResOff=ID"
            , "\t@KeepResolutionOff=ID"
            , "该ID对应的对象会在叠化时重设分辨率为新图像的分辨率"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID]
    }],

    ["Sepia", {
        prefix: "@"
        , minParam: 0, maxParam: 3
        , comment: ["\t@Sepia=Strength:NoiseMotion:Period"
            , "\t@SepiaToning=Strength:NoiseMotion:Period"
            , "创建强度为`Strength`的`Sepia Toning`对象，对象默认ID为`-5`。其中`Strength`应为一个`[0,1]`的浮点数，默认值为`0.5`，`NoiseMotion`参数控制噪声运动的开启与关闭，当设定为`1`或`On`的时候会启用噪声运动，运动周期为`Period`，单位毫秒，默认值为`-1`，即每帧更新。已经创建了`Sepia Toning`对象后调用该指令，该指令无效"]
        , type: [ParamType.Number, ParamType.Boolean, ParamType.Number]
        , inlayHintType: [inlayHintType.Strength, inlayHintType.Boolean, inlayHintType.Period]
    }],
    ["SepiaToning", {
        prefix: "@"
        , minParam: 0, maxParam: 3
        , comment: ["\t@Sepia=Strength:NoiseMotion:Period"
            , "\t@SepiaToning=Strength:NoiseMotion:Period"
            , "创建强度为`Strength`的`Sepia Toning`对象，对象默认ID为`-5`。其中`Strength`应为一个`[0,1]`的浮点数，默认值为`0.5`，`NoiseMotion`参数控制噪声运动的开启与关闭，当设定为`1`或`On`的时候会启用噪声运动，运动周期为`Period`，单位毫秒，默认值为`-1`，即每帧更新。已经创建了`Sepia Toning`对象后调用该指令，该指令无效"]
        , type: [ParamType.Number, ParamType.Boolean, ParamType.Number]
        , inlayHintType: [inlayHintType.Strength, inlayHintType.Boolean, inlayHintType.Period]
    }],
    ["ChangeSepiaStrength", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@ChangeSepiaStrength=Strength"
            , "在演出执行阶段改变`Sepia Toning`对象的`Strength`，参数留空会将`Strength`设定为默认值`0.5`"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Strength]
    }],
    ["SetSepiaNoiseMotion", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@SetSepiaNoiseMotion=On/Off"
            , "控制噪声运动的开启与关闭，设定为`1`或`On`时启用噪声运动，设定为`0`或`Off`时禁用噪声运动，参数为空会Toggle当前启用状态"]
        , type: [ParamType.Boolean]
        , inlayHintType: [inlayHintType.Boolean]
    }],
    ["ChangeSepiaNoiseMotionPeriod", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@ChangeSepiaNoiseMotionPeriod=Period"
            , "将噪声运动的运动周期设定为`Period`，单位毫秒，参数为空会将`Period`设定为默认值`-1`，一个典型的参考值为`300`毫秒"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.Period]
    }],

    // keywords_preobj

    ["StrCenter", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["定义坐标参数留空时字符串的默认位置，该指令后创建的字符串默认居中"]
        , type: []
    }],
    ["StrBottom", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["定义坐标参数留空时字符串的默认位置，该指令后创建的字符串默认底部居中"]
        , type: []
    }],
    ["Str", {
        prefix: "@"
        , minParam: 2, maxParam: 11
        , comment: ["\t@Str=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@Str=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@String=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@String=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "创建字符串，字符串ID与图像ID相互独立"
            , "除输入完整参数外，字符串参数还允许通过单独指令修改。在字符串创建的解析循环中进行的修改会作用于创建叠化，其余场合使用指令修改参数是否进行叠化请参考具体指令说明"
            , "默认参数：字符串对象宽600，字符串对象高60；默认不透明度`0`；默认底部居中；默认字号`22`；默认字体`黑体`；默认颜色：黑色文字`RGB=(0,0,0)`，白色勾边`RGB=(255,255,255)`"]
        , type: [ParamType.String, ParamType.Number, ParamType.ZeroOne, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.String, ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.String, inlayHintType.ID, inlayHintType.TypeEffect, inlayHintType.Alpha, inlayHintType.X, inlayHintType.Y, inlayHintType.Size, inlayHintType.Font, inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["String", {
        prefix: "@"
        , minParam: 2, maxParam: 11
        , comment: ["\t@Str=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@Str=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@String=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@String=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "创建字符串，字符串ID与图像ID相互独立"
            , "除输入完整参数外，字符串参数还允许通过单独指令修改。在字符串创建的解析循环中进行的修改会作用于创建叠化，其余场合使用指令修改参数是否进行叠化请参考具体指令说明"
            , "默认参数：字符串对象宽600，字符串对象高60；默认不透明度`0`；默认底部居中；默认字号`22`；默认字体`黑体`；默认颜色：黑色文字`RGB=(0,0,0)`，白色勾边`RGB=(255,255,255)`"]
        , type: [ParamType.String, ParamType.Number, ParamType.ZeroOne, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.String, ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.String, inlayHintType.ID, inlayHintType.TypeEffect, inlayHintType.Alpha, inlayHintType.X, inlayHintType.Y, inlayHintType.Size, inlayHintType.Font, inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["CreateStr", {
        prefix: "@"
        , minParam: 2, maxParam: 11
        , comment: ["\t@Str=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@Str=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@String=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@String=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "创建字符串，字符串ID与图像ID相互独立"
            , "除输入完整参数外，字符串参数还允许通过单独指令修改。在字符串创建的解析循环中进行的修改会作用于创建叠化，其余场合使用指令修改参数是否进行叠化请参考具体指令说明"
            , "默认参数：字符串对象宽600，字符串对象高60；默认不透明度`0`；默认底部居中；默认字号`22`；默认字体`黑体`；默认颜色：黑色文字`RGB=(0,0,0)`，白色勾边`RGB=(255,255,255)`"]
        , type: [ParamType.String, ParamType.Number, ParamType.ZeroOne, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.String, ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.String, inlayHintType.ID, inlayHintType.TypeEffect, inlayHintType.Alpha, inlayHintType.X, inlayHintType.Y, inlayHintType.Size, inlayHintType.Font, inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["CreateString", {
        prefix: "@"
        , minParam: 2, maxParam: 11
        , comment: ["\t@Str=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@Str=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@String=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@String=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@CreateStr=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "\t@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
            , "\t@CreateString=string:ID:TypeEffect:Alpha:x:y:size:font:#FFFFFF"
            , "创建字符串，字符串ID与图像ID相互独立"
            , "除输入完整参数外，字符串参数还允许通过单独指令修改。在字符串创建的解析循环中进行的修改会作用于创建叠化，其余场合使用指令修改参数是否进行叠化请参考具体指令说明"
            , "默认参数：字符串对象宽600，字符串对象高60；默认不透明度`0`；默认底部居中；默认字号`22`；默认字体`黑体`；默认颜色：黑色文字`RGB=(0,0,0)`，白色勾边`RGB=(255,255,255)`"]
        , type: [ParamType.String, ParamType.Number, ParamType.ZeroOne, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.String, ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.String, inlayHintType.ID, inlayHintType.TypeEffect, inlayHintType.Alpha, inlayHintType.X, inlayHintType.Y, inlayHintType.Size, inlayHintType.Font, inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],

    ["StrS", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@StrS=ID:Size"
            , "\t@StrSize=ID:Size"
            , "无叠化，更改字符串字号"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Size]
    }],
    ["StrSize", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@StrS=ID:Size"
            , "\t@StrSize=ID:Size"
            , "无叠化，更改字符串字号"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Size]
    }],
    ["StrF", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@StrF=ID:Font"
            , "\t@StrFont=ID:Font"
            , "无叠化，更改字符串字体"]
        , type: [ParamType.Number, ParamType.String]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Font]
    }],
    ["StrFont", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@StrF=ID:Font"
            , "\t@StrFont=ID:Font"
            , "无叠化，更改字符串字体"]
        , type: [ParamType.Number, ParamType.String]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Font]
    }],
    ["StrA", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@StrA=ID:120"
            , "\t@StrAlpha=ID:120"
            , "切换对象到指定的不透明度"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Alpha]
    }],
    ["StrAlpha", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@StrA=ID:120"
            , "\t@StrAlpha=ID:120"
            , "切换对象到指定的不透明度"]
        , type: [ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Alpha]
    }],

    ["StrC", {
        prefix: "@"
        , minParam: 2, maxParam: 4
        , comment: ["\t@StrC=ID:R:G:B"
            , "\t@StrC=ID:#FFFFFF"
            , "\t@StrColor=ID:R:G:B"
            , "\t@StrColor=ID:#FFFFFF"
            , "无叠化，更改字符串颜色"]
        , type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],
    ["StrColor", {
        prefix: "@"
        , minParam: 2, maxParam: 4
        , comment: ["\t@StrC=ID:R:G:B"
            , "\t@StrC=ID:#FFFFFF"
            , "\t@StrColor=ID:R:G:B"
            , "\t@StrColor=ID:#FFFFFF"
            , "无叠化，更改字符串颜色"]
        , type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.ColorHex, inlayHintType.ColorRGB_G, inlayHintType.ColorRGB_B]
    }],

    ["MS", {
        prefix: "@"
        , minParam: 3, maxParam: 7
        , comment: ["\t@MS=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "\t@MoveStr=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "移动字符串对象，具体参数说明请参见`@MoveObj`一节，坐标受`@StrCenter`参数影响"]
        , type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.X, inlayHintType.Y, inlayHintType.Time, inlayHintType.Easing_FuncA, inlayHintType.Easing_FuncB, inlayHintType.Mode]
    }],
    ["MoveStr", {
        prefix: "@"
        , minParam: 3, maxParam: 7
        , comment: ["\t@MS=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "\t@MoveStr=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "移动字符串对象，具体参数说明请参见`@MoveObj`一节，坐标受`@StrCenter`参数影响"]
        , type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.X, inlayHintType.Y, inlayHintType.Time, inlayHintType.Easing_FuncA, inlayHintType.Easing_FuncB, inlayHintType.Mode]
    }],
    ["DestroyStr", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@DestroyStr=ID"
            , "\t@DestroyString=ID"
            , "销毁字符串"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID]
    }],
    ["DestroyString", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@DestroyStr=ID"
            , "\t@DestroyString=ID"
            , "销毁字符串"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID]
    }],

    ["DestroyAllStr", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["销毁全部字符串对象"]
        , type: []
    }],
    ["DestroyAllString", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["销毁全部字符串对象"]
        , type: []
    }],

    ["Spe", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["该指令在调用前会在引擎内部更新`CoefStr`、`FolderStr`参数，定义转译后指令的文件路径、参数。**该指令为内部指令，请避免在脚本中使用。**"
            , "以使用内部指令`@Spe=dialog2.png`创建对话框为例"
            , "指令会被转译为`@Char=FolderStr+dialog2.png+CoefStr`，执行后更新相应参数"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.FileName]
        , internal: true
    }],

    ["MO", {
        prefix: "@"
        , minParam: 3, maxParam: 7
        , comment: ["\t@MO=FixedValue:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "\t@MoveObj=FixedValue:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "内部指令，`@MoveChar`与@`MoveStr`会被引擎转译为该指令执行"]
        , type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.FixedValue, inlayHintType.X, inlayHintType.Y, inlayHintType.Time, inlayHintType.Easing_FuncA, inlayHintType.Easing_FuncB, inlayHintType.Mode]
        , internal: true
    }],
    ["MoveObj", {
        prefix: "@"
        , minParam: 3, maxParam: 7
        , comment: ["\t@MO=FixedValue:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "\t@MoveObj=FixedValue:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "内部指令，`@MoveChar`与@`MoveStr`会被引擎转译为该指令执行"]
        , type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.FixedValue, inlayHintType.X, inlayHintType.Y, inlayHintType.Time, inlayHintType.Easing_FuncA, inlayHintType.Easing_FuncB, inlayHintType.Mode]
        , internal: true
    }],

    ["CG", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@CG=filename.png"
            , "\t@CGChange=filename.png"
            , "切换CG，叠化阶段进行"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.CGFileName]
    }],
    ["CGChange", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@CG=filename.png"
            , "\t@CGChange=filename.png"
            , "切换CG，叠化阶段进行"]
        , type: [ParamType.File]
        , inlayHintType: [inlayHintType.CGFileName]
    }],

    ["CPF", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@CPF=PicName:PatternName:ID"
            , "\t@CPatternFade=PicName:PatternName:ID"
            , "读取贴图，前景背景同时叠化"]
        , type: [ParamType.File, ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],
    ["CPatternFade", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@CPF=PicName:PatternName:ID"
            , "\t@CPatternFade=PicName:PatternName:ID"
            , "读取贴图，前景背景同时叠化"]
        , type: [ParamType.File, ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],
    ["CPFI", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@CPFI=PicName:PatternName:ID"
            , "\t@CPatternFadeIn=PicName:PatternName:ID"
            , "读取贴图，叠化至前景图像"]
        , type: [ParamType.File, ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],
    ["CPatternFadeIn", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@CPFI=PicName:PatternName:ID"
            , "\t@CPatternFadeIn=PicName:PatternName:ID"
            , "读取贴图，叠化至前景图像"]
        , type: [ParamType.File, ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],
    ["CPFO", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@CPFO=PicName:PatternName:ID"
            , "\t@CPatternFadeOut=PicName:PatternName:ID"
            , "读取贴图，叠化至背景图像"]
        , type: [ParamType.File, ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],
    ["CPatternFadeOut", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@CPFO=PicName:PatternName:ID"
            , "\t@CPatternFadeOut=PicName:PatternName:ID"
            , "读取贴图，叠化至背景图像"]
        , type: [ParamType.File, ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],
    ["CGPFI", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@CGPFI=PicName:PatternName"
            , "\t@CGPatternFadeIn=PicName:PatternName"
            , "转译指令，读取贴图，CG叠化至前景图像"]
        , type: [ParamType.File, ParamType.File]
        , inlayHintType: [inlayHintType.CGFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],
    ["CGPatternFadeIn", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@CGPFI=PicName:PatternName"
            , "\t@CGPatternFadeIn=PicName:PatternName"
            , "转译指令，读取贴图，CG叠化至前景图像"]
        , type: [ParamType.File, ParamType.File]
        , inlayHintType: [inlayHintType.CGFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],

    ["CGPFO", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@CGPFO=PicName:PatternName"
            , "\t@CGPatternFadeOut=PicName:PatternName"
            , "转译指令，读取贴图，CG叠化至背景图像"]
        , type: [ParamType.File, ParamType.File]
        , inlayHintType: [inlayHintType.CGFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],
    ["CGPatternFadeOut", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@CGPFO=PicName:PatternName"
            , "\t@CGPatternFadeOut=PicName:PatternName"
            , "转译指令，读取贴图，CG叠化至背景图像"]
        , type: [ParamType.File, ParamType.File]
        , inlayHintType: [inlayHintType.CGFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],

    ["CharPF", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@CharPF=PicName:PatternName:ID"
            , "\t@CharPatternFade=PicName:PatternName:ID"
            , "转译指令，读取贴图，叠化至前景图像。**不建议进行差分和不同对象的切换，而是将当前图像切换至透明图像来实现进场和退场效果**"]
        , type: [ParamType.File, ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],
    ["CharPatternFade", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@CharPF=PicName:PatternName:ID"
            , "\t@CharPatternFade=PicName:PatternName:ID"
            , "转译指令，读取贴图，叠化至前景图像。**不建议进行差分和不同对象的切换，而是将当前图像切换至透明图像来实现进场和退场效果**"]
        , type: [ParamType.File, ParamType.File, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.PatternFadeFileName, inlayHintType.ID]
    }],

    ["Char", {
        prefix: "@"
        , minParam: 2, maxParam: 7
        , comment: ["\t@Char=filename.png:ID:Alpha:X:Y:Width:Height"
            , "\t@Character=filename.png:ID:Alpha:X:Y:Width:Height"
            , "该指令用于创建图像：留空文件后缀名时，会默认图片格式为PNG；不透明度范围为0~255；文件名支持使用../返回上级路径；坐标系以画面中央底部为原点；坐标以图像中央底部为热点；长宽默认为图片原始尺寸，使用+/-指定增量时，会以原始尺寸为基础进行计算"]
        , type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.ID, inlayHintType.Alpha, inlayHintType.X, inlayHintType.Y, inlayHintType.Width, inlayHintType.Height]
    }],
    ["Character", {
        prefix: "@"
        , minParam: 2, maxParam: 6
        , comment: ["\t@Char=filename.png:ID:Alpha:X:Y:Width:Height"
            , "\t@Character=filename.png:ID:Alpha:X:Y:Width:Height"
            , "该指令用于创建图像：留空文件后缀名时，会默认图片格式为PNG；不透明度范围为0~255；文件名支持使用../返回上级路径；坐标系以画面中央底部为原点；坐标以图像中央底部为热点；长宽默认为图片原始尺寸，使用+/-指定增量时，会以原始尺寸为基础进行计算"]
        , type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.ID, inlayHintType.Alpha, inlayHintType.X, inlayHintType.Y, inlayHintType.Width, inlayHintType.Height]
    }],

    ["CC", {
        prefix: "@"
        , minParam: 2, maxParam: 5
        , comment: ["\t@CC=filename:ID:alpha:width:height"
            , "\t@CharChange=filename:ID:alpha:width:height"
            , "该指令用于切换为其他角色或动作：留空文件后缀名时，会默认图片格式为PNG；不透明度范围为0~255，该指令会重置`@CharAlpha`设定的不透明度；文件名支持使用../返回上级路径"
            , "交错模式：通常来说，切换角色时应启用交错模式，更改长宽比时，会自动切换为交错模式"
            , "长宽：默认为新图片原始尺寸，使用+/-指定增量时，会以原始尺寸为基础进行计算"]
        , type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.ID, inlayHintType.Alpha, inlayHintType.Width, inlayHintType.Height]
    }],
    ["CharChange", {
        prefix: "@"
        , minParam: 2, maxParam: 5
        , comment: ["\t@CC=filename:ID:alpha:width:height"
            , "\t@CharChange=filename:ID:alpha:width:height"
            , "该指令用于切换为其他角色或动作：留空文件后缀名时，会默认图片格式为PNG；不透明度范围为0~255，该指令会重置`@CharAlpha`设定的不透明度；文件名支持使用../返回上级路径"
            , "交错模式：通常来说，切换角色时应启用交错模式，更改长宽比时，会自动切换为交错模式"
            , "长宽：默认为新图片原始尺寸，使用+/-指定增量时，会以原始尺寸为基础进行计算"]
        , type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.CharacterFileName, inlayHintType.ID, inlayHintType.Alpha, inlayHintType.Width, inlayHintType.Height]
    }],

    ["CA", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@CA=ID:Alpha"
            , "\t@CharAlpha=ID:Alpha"
            , "切换对象到指定的不透明度"]
        , type: [ParamType.Number, ParamType.Number,]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Alpha]
    }],
    ["CharAlpha", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@CA=ID:Alpha"
            , "\t@CharAlpha=ID:Alpha"
            , "切换对象到指定的不透明度"]
        , type: [ParamType.Number, ParamType.Number,]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Alpha]
    }],
    ["HideChar", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@HideChar=ID"
            , "若`PreviousAlpha = -1`，记忆当前的目标不透明度，并执行"
            , "\t@CharAlpha=ID:255"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID]
    }],
    ["HideAllChar", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["为所有未隐藏的图像对象执行"
            , "\t@HideChar=ID"]
        , type: []
        , inlayHintType: []
    }],
    ["ShowChar", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["@ShowChar=ID"
            , "执行"
            , "\t@CharAlpha=ID:PreviousAlpha"
            , "还原已隐藏的图像对象的目标不透明度，并重置`PreviousAlpha = -1`"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID]
    }],
    ["ShowAllChar", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["为所有隐藏的图像对象执行"
            , "\t@ShowChar=ID"]
        , type: []
        , inlayHintType: []
    }],
    ["CharRotate", {
        prefix: "@"
        , minParam: 4, maxParam: 4
        , comment: ["\t@CharRotate=ID:angle:clockwise:CircleCount"
            , "旋转对象至目标角度与预定圈数，`clockwise = 1`为顺时针，`clockwise = -1`为逆时针"
            , "若目标角度设定为360度，旋转0圈，将持续旋转"
            , "该指令不可与立绘叠化同时使用"]
        , type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Angle, inlayHintType.Clockwise, inlayHintType.CircleCount]
    }],
    ["AttachShader", {
        prefix: "@"
        , minParam: 2, maxParam: 34
        , comment: ["\t@AttachShader=ID:ShaderName:Param1:Param2:..."
            , "为非特效图像附加Shader，依照内部顺序指定参数"]
        , type: [ParamType.Number, ParamType.String
            , ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
            , ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
            , ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
            , ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
            , ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
            , ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
            , ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
            , ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any]
        , inlayHintType: [inlayHintType.ID, inlayHintType.ShaderName
            , inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam
            , inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam
            , inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam
            , inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam
            , inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam
            , inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam
            , inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam
            , inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam, inlayHintType.ShaderParam]
    }],

    ["SetAutoArrange", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@SetAutoArrange=On/Off"
            , "控制自动间距功能的开启与关闭，设定为1或On时启用自动间距，设定为0或Off时禁用自动间距，参数为空会Toggle当前启用状态"
            , "启用自动间距后，新建/销毁立绘时会自动调整间距，最大支持处理六张立绘的间距"]
        , type: [ParamType.Boolean]
        , inlayHintType: [inlayHintType.Boolean]
    }],
    ["CD", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@CD=ID"
            , "\t@CharDispose=ID"
            , "销毁并释放该ID对应的图像对象的本体和遮罩，会转译为`@CharAlpha:ID:255`并启用`Destroy`Flag"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID,]
    }],
    ["CharDispose", {
        prefix: "@"
        , minParam: 1, maxParam: 1
        , comment: ["\t@CD=ID"
            , "\t@CharDispose=ID"
            , "销毁并释放该ID对应的图像对象的本体和遮罩，会转译为`@CharAlpha:ID:255`并启用`Destroy`Flag"]
        , type: [ParamType.Number]
        , inlayHintType: [inlayHintType.ID,]
    }],

    ["CAD", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["销毁全部的图像对象，并释放其对应的本体和遮罩"
            , "CG/UI不会被销毁"]
        , type: []
    }],
    ["CharAllDispose", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["销毁全部的图像对象，并释放其对应的本体和遮罩"
            , "CG/UI不会被销毁"]
        , type: []
    }],
    ["MC", {
        prefix: "@"
        , minParam: 3, maxParam: 7
        , comment: ["\t@MC=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "\t@MoveChar=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "移动图片对象，具体参数说明请参见`@MoveObj`一节"]
        , type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.X, inlayHintType.Y, inlayHintType.Time, inlayHintType.Easing_FuncA, inlayHintType.Easing_FuncB, inlayHintType.Mode]
    }],
    ["MoveChar", {
        prefix: "@"
        , minParam: 3, maxParam: 7
        , comment: ["\t@MC=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "\t@MoveChar=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
            , "移动图片对象，具体参数说明请参见`@MoveObj`一节"]
        , type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.X, inlayHintType.Y, inlayHintType.Time, inlayHintType.Easing_FuncA, inlayHintType.Easing_FuncB, inlayHintType.Mode]
    }],

    ["HideUI", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["无叠化，隐藏菜单与快捷栏，会自动转译`#DisableUI`"]
        , type: []
    }],
    ["ShowUI", {
        prefix: "@"
        , minParam: 0, maxParam: 0
        , comment: ["无叠化，重新显示菜单与快捷栏，会自动转译`#EnableUI`"]
        , type: []
    }],

    ["Order", {
        prefix: "@"
        , minParam: 3, maxParam: 3
        , comment: ["\t@Order=ID:Order:Type"
            , "无叠化，调整ID指定对象的层级，通过`Type`指定不同的对象类型"
            , "`Type`为`Pic`则移动`ID`对应的图像对象，`Type`为`Str`则移动`ID`对应的字符串对象"]
        , type: [ParamType.Number, ParamType.Order, ParamType.ObjType]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Order, inlayHintType.Type]
    }],
    ["Front", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@Front=ID:Type"
            , "无叠化，将`ID`指定的`Type`对象移至顶层"]
        , type: [ParamType.Number, ParamType.ObjType]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Type]
    }],
    ["Back", {
        prefix: "@"
        , minParam: 2, maxParam: 2
        , comment: ["\t@Back=ID:Type"
            , "无叠化，将`ID`指定的`Type`对象移至底层"]
        , type: [ParamType.Number, ParamType.ObjType]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Type]
    }],
    ["Forward", {
        prefix: "@"
        , minParam: 2, maxParam: 3
        , comment: ["\t@Forward=ID:Type:Num"
            , "无叠化，将`ID`指定的`Type`对象上移`Num`层，参数留空默认上移一层"]
        , type: [ParamType.Number, ParamType.ObjType, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Type, inlayHintType.Num]
    }],
    ["Backward", {
        prefix: "@"
        , minParam: 2, maxParam: 3
        , comment: ["\t@Backward=ID:Type:Num"
            , "无叠化，将`ID`指定的`Type`对象下移`Num`层，参数留空默认下移一层"]
        , type: [ParamType.Number, ParamType.ObjType, ParamType.Number]
        , inlayHintType: [inlayHintType.ID, inlayHintType.Type, inlayHintType.Num]
    }],
]);