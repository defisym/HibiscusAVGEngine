/* eslint-disable @typescript-eslint/naming-convention */

import * as vscode from 'vscode';
import { align_objectType, align_objectTypeMap } from './align';
import { audio_inlayHintAddition_ChannelTypeMap } from './audio';
import { easing_inlayHintAddition_funcName, easing_inlayHintAddition_funcNameMap, easing_inlayHintAddition_modeName, easing_inlayHintAddition_modeNameMap } from './easing';
import { object_objectType, object_objectTypeMap } from './objectType';
import { sleep } from './utilities';

export let sharpKeywordList: string[] = [];
export let atKeywordList: string[] = [];
export let keywordList: string[] = [];

export let internalKeywordList: string[] = [];
export let deprecatedKeywordList: string[] = [];

// cannot be created by user
export interface internalImageIDAvailableBehavior {
	Create: boolean;
	Destroy: boolean;
}

export const internalImageID = new Map<number, internalImageIDAvailableBehavior>([
	[-1, { Create: false, Destroy: false }],      // 姓名栏
	[-2, { Create: false, Destroy: false }],      // 对话框
	[-3, { Create: false, Destroy: false }],       // 头像栏
	[-4, { Create: false, Destroy: false }],       // 底板
	[-5, { Create: false, Destroy: false }],        // CG
	[-6, { Create: false, Destroy: false }],        // 头像

	[-100, { Create: false, Destroy: true }],       // Sepia Toning

	[-1000, { Create: false, Destroy: false }],       // 景深
	[-1001, { Create: false, Destroy: false }],       // 景深
	[-1002, { Create: false, Destroy: false }],       // 景深
	[-1003, { Create: false, Destroy: false }],       // 景深
	[-1004, { Create: false, Destroy: false }],       // 景深
	[-1005, { Create: false, Destroy: false }],       // 景深
	[-1006, { Create: false, Destroy: false }],       // 景深
	[-1007, { Create: false, Destroy: false }],       // 景深
	[-1008, { Create: false, Destroy: false }],       // 景深
	[-1009, { Create: false, Destroy: false }],       // 景深
	[-1010, { Create: false, Destroy: false }],       // 景深
	[-1011, { Create: false, Destroy: false }],       // 景深
	[-1012, { Create: false, Destroy: false }],       // 景深
	[-1013, { Create: false, Destroy: false }],       // 景深
	[-1014, { Create: false, Destroy: false }],       // 景深
	[-1015, { Create: false, Destroy: false }],       // 景深
	[-1016, { Create: false, Destroy: false }],       // 景深
	[-1017, { Create: false, Destroy: false }],       // 景深
	[-1018, { Create: false, Destroy: false }],       // 景深
	[-1019, { Create: false, Destroy: false }],       // 景深
	[-1020, { Create: false, Destroy: false }],       // 景深

	[-65535, { Create: false, Destroy: false }]     // 错误提示
]);

export type docList = Map<string, string[]>;

export let settingsParamList: string[] = [];

export const settingsParamDocList = new Map<string, string[]>([
	["Settings", ["在脚本的第一行可以使用`#Settings`指令对脚本进行设置，格式如下:"
		, "\t#Settings=Param1|Param2|..."
		, "其中不同参数使用`|`进行分割"]],

	["LangSwitchAble", ["该脚本支持切换语言后读取"]],

	["NoIndent", ["该脚本忽略文本的首行缩进"]],
	["CenterNoIndent", ["该脚本忽略居中行文本的首行缩进"]],

	["VN", ["启用Visual Novel模式"]],
	["VNMode", ["启用Visual Novel模式"]],
	["Lite", ["启用Lite模式，该模式下部分功能会被禁用"]],
	["LiteMode", ["启用Lite模式，该模式下部分功能会被禁用"]],

	["UnSkipAble", ["该脚本无法使用跳过按钮/快捷键跳过"
		, "若需要中途启用，可使用`#SkipAble`指令"]],

	["NoHistory", ["禁用历史记录功能"]],
	["NoHistoryJump", ["禁用历史记录跳转功能"]],
	["ResetHistory", ["开始对话时重置历史记录"]],

	["SeparateDubID", ["对不同角色使用不同的语音ID"]],

	["NoSideEffect", ["断言脚本的跳转无副作用"]],

	["LoadOnCall", ["在第一次使用时读取并缓存"]],
	["LoadAtStart", ["在读取脚本时即读取该场景中使用的所有图像素材并缓存"]],
	["LoadAll", ["加载图像文件夹中的所有图像素材并缓存"]],

	["EraseAtEnd", ["在程序退出后清除缓存"]],
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

export let commandDocList = new Map<string, string[]>();

export const dialogueTextElement = `
| 姓名    | 头像提示    | 语音提示   | 文本        |
| ------- | ----------- | ---------- | ----------- |
| \`{$Name}\` | \`{$HeadHint}\` | \`{$DubHint}\` | \`{$Dialogue}\` |
`;

export const narratorTextElement = `
| 头像提示    | 语音提示   | 文本        |
| ----------- | ---------- | ----------- |
| \`{$HeadHint}\` | \`{$DubHint}\` | \`{$Dialogue}\` |
`;

export const narratorTextPlain = `
| 文本        |
| ----------- |
| \`{$Dialogue}\` |
`;

export const normalTextDoc = `
### 基本

非注释区块内，无\`;\`、\`(\`、\`//\`、\`#\`、\`@\`前缀的行会被视为文本，非\`$\`开头且具有姓名部分的行会被视为对白，其余情况视为旁白

| 旁白前缀 | 姓名   | 头像提示     | 英文冒号 | 桥接符   | 文本       |
| -------- | ------ | ------------ | -------- | -------- | ---------- |
| \`($)\`    | \`Name\` | \`[HeadHint]\` | \`:\`      | \`(&/&&)\` | \`Dialogue\` |

### 旁白前缀

存在该前缀，且存在姓名部分时，该行按照旁白处理

### 姓名

说话人的姓名，默认作为语音提示以查找音量定义。在头像提示不存在或头像提示指定的文件不存在时，姓名也用作替代头像提示

支持格式控制

### 头像提示

姓名末尾的\`[FileName]\`会被视为头像提示，优先按照其指定的文件名在\`Data\Graphics\Characters\Heads\`下查找，若文件不存在，则使用姓名作为替代文件名查找。若姓名对应的文件名也不存在，则显示对应文件夹下的\`Unknown.png\`作为替代

### 桥接符

在非VN模式下可以使用桥接符号\`&\`对旁白文本进行桥接，以实现在文本显示途中追加演出，可配合\`#AutoChangePage\`等指令实现自动翻页演出

\`\`\`C++
对话中间插入演出。
......
&这是不换行的演出。
......
&&这是换行的演出。
\`\`\`

\`\`\`C++
对话中间插入演出。这是不换行的演出。
这是换行的演出。
\`\`\`

### 文本

可使用\`/n\`或\`\\n\`作为换行的转义字符

支持格式控制

### 格式控制

#### 通用

##### 转义

\`\\[\`会被转义为\`]\`

##### 忽略

\`[^]\`后的所有格式控制都会被忽略

##### 忽略非图标

\`[^-]\`后除\`[ICon]\`外的所有格式控制，包括\`[IConOffsetX]\`等图标格式控制都会被忽略

##### 取消忽略

\`[!^]\`取消忽略所有格式

##### 重置

\`[!]\`重置格式到默认状态(即对象属性定义)

##### 数值参数

- 参数为时\`!\`重置至默认值
- 参数以\`+/-\`开头则增/减至当前值
- 参数以\`\\\`开头不处理增减
  - 例: 当前值为1.0
    - \`-0.5\` -> \`1.0\`- \`0.5\` = \`0.5\`
    - \`\\+0.5\` -> \`+0.5\`
    - \`\\-0.5\` -> \`-0.5\`

#### 标签

\`[Tag = CallbackName, Params]\`

解析到标签时调用指定名称的方法

在评注中的标签将会被忽略

#### 评注

##### 插入评注
	
\`[Remark = CharCount, Content]\` 
	
在后续\`CharCount\`个字符上方插入评注
	
由于评注内容可能含有\`,\`，因此与其他格式不同，解析从左开始。评注内容会使用一个子字符串对象渲染，拥有与插入时父对象相同的颜色和字体等设置，默认字号是父字号的一半，且直接渲染至父对象
	
- 评注内容中不能含有开的\`[]\`，会导致后续解析错误
- 如果被评注文本中途出现了换行，则评注的渲染会被取消
- 如果字体和字号出现了大幅变动，则会出现重叠
- 评注的坐标由被评注文本估计得来，因此打字过程中会出现偏移
	
#### 评注格式
	
##### 评注偏移
	
\`[RemarkOffsetX = 0.0][/RemarkOffsetX]\`&\`[RemarkOffsetY = 0.0][/RemarkOffsetY]\`
	
相对于当前字符大小百分比的偏移量，用于对齐评注与文本
	
具体参数请参考\`数值参数\`一节

#### 图标

#### 插入图标

\`[ICon = Direction, Frame]\`

在文本中插入图标。若参数不足，则从右至左引用，即有一个参数时认为其是\`Frame\`

如果链接的是其他对象，则需要手动处理每个参数，并返回引用Key和对应的Surface指针

例:将文件路径的哈希值作为Key并返回库中的指针

\`这里是头像[ICon = heads\\<PF1>]\`

#### 图标格式

##### 图标偏移

\`[IConOffsetX = 0.0][/IConOffsetX]\`&\`[IConOffsetY = 0.0][/IConOffsetY]\`

相对于当前字符大小百分比的偏移量，用于对齐图标与文本

具体参数请参考\`数值参数\`一节

##### 图标比例

\`[IConScale = 1.0][/IConScale]\`

图标缩放比例

具体参数请参考\`数值参数\`一节

##### 图标重采样

\`[IConResample = 1][/IConResample]\`

缩放时是否对原始图像进行重采样，1 = 启用，0 = 禁用

参数为时\`!\`重置至默认值

#### 水平对齐

\`[Align = LEFT]\`

调整不同行的水平对齐

#### 震动

\`[Shake = Type, Amplitude, TimerCoef, CharOffset]\`

控制文本震动。若参数不足，则从左至右引用，即有一个参数时认为其是\`Type\`，两个参数时认为其是\`Type\`与\`Amplitude\`

\`Type\`: 震动类型，默认为\`None\`，可为\`X\`，\`Y\`，\`Random\`，其中\`X\`、\`Y\`基于三角函数
\`Amplitude\`: 震动幅度，默认为\`1.0\`，相对于震动文本的大小。如文本高度为\`30\`，\`Amplitude = 0.5\`，则震动幅度为\`15\`，会在\`+/- 15\`范围内震动
\`TimerCoef\`: 时间参数，默认为\`1.0\`，决定震动的速度
\`CharOffset\`: 字符偏移，默认为\`1.0 / 6.0\`，决定相邻字符的运动间隔，数值越大，运动间隔越大。该指仅在\`X\`、\`Y\`模式下有效，为相对于\`360°\`的系数。即\`CharOffset = 0.2\`，间隔为\`72°\`

#### 颜色

\`[Color = #FFFFFFFF][/Color]\` or \`[C = #FFFFFFFF][/C]\`

颜色参数为十六进制，顺序为\`AARRGGBB\`，或\`A, R, G, B\`

当RGB参数少于四个时，按照如下顺序引用:

\`\`\`C++
R
R G
R G B
A R G B
\`\`\`

具体参数请参考\`数值参数\`一节

#### 字体

更新\`LogFont\`并创建绘制字体指针

##### 字体

\`[Font = FontName][/Font]\` or \`[F = FontName][/F]\`

参数为时\`!\`重置至默认值

##### 字号

\`[Size = FontSize][/Size]\` or \`[S = FontSize][/S]\`

具体参数请参考\`数值参数\`一节

##### 加粗

\`[Bold][/Bold]\` or \`[B][/B]\`

##### 取消加粗

\`[!Bold][/!Bold]\` or \`[!B][/!B]\`

##### 倾斜

\`[Italic][/Italic]\` or \`[I][/I]\`

##### 取消倾斜

\`[!Italic][/!Italic]\` or \`[!I][/!I]\`

##### 下划线

\`[Underline][/Underline]\` or \`[U][/U]\`

##### 取消下划线

\`[!Underline][/!Underline]\` or \`[!U][/!U]\`

##### 删除线

\`[StrikeOut][/StrikeOut]\` or \`[S][/S]\`

##### 取消删除线

\`[!StrikeOut][/!StrikeOut]\` or \`[!S][/!S]\`

`;

export enum ParamType {
	String,
	Number,
	ZeroOne,
	Boolean,
	Volume,
	Order,
	ObjType,
	Color,
	File,
	Any,
};

export const ParamTypeMap = new Map<string, ParamType>([
	["String", ParamType.String],
	["Number", ParamType.Number],
	["ZeroOne", ParamType.ZeroOne],
	["Boolean", ParamType.Boolean],
	["Volume", ParamType.Volume],
	["Order", ParamType.Order],
	["ObjType", ParamType.ObjType],
	["Color", ParamType.Color],
	["File", ParamType.File],
	["Any", ParamType.Any],
]);

export enum InlayHintType {
	FileName,
	CharacterFileName,
	DiaFileName,
	NameFileName,
	CGFileName,
	PatternFadeFileName,
	AudioFileName,
	BGMFileName,
	BGSFileName,
	SEFileName,
	DubFileName,
	VideoFileName,
	ID,
	Alpha,
	X,
	Y,
	Width,
	Height,
	ColorHex,
	ColorRGB_R,
	ColorRGB_G,
	ColorRGB_B,
	MemLimit,
	XOffset,
	YOffset,
	TransitionSpeed,
	DebugMSG,
	WaitTime,
	Label,
	Frame,
	Chapter,
	SwitchNum,
	Text,
	AchName,
	StatName,
	StatAdd,
	ContentName,
	Page,
	Pos,
	CaptureID,
	Boolean,
	ValueID,
	Value,
	Size,
	Font,
	OutlinePixel,
	Volume,
	Channel,
	FadeSpeed,
	StartPoint,
	EndPoint,
	PreludePoint,
	NowTalking,
	Num,
	Easing_FuncA,
	Easing_FuncB,
	Speed,
	Instant,
	CrossState,
	DelayTime,
	Dir,
	Duration,
	Orderable,
	Strength,
	Period,
	String,
	TypeEffect,
	Time,
	Mode,
	FixedValue,
	Angle,
	Clockwise,
	CircleCount,
	Order,
	Type,
	ShaderName,
	ShaderParamName,
	ShaderParam,
	Force,
	IgnoreDebug,
	ShadowMode,
	LoopTransition,
	DubSequePrefix,
	DubChapterName,
	KeepSeq,
	KeepNTK,
	CommandToEval,
	BlurRadius,
	Align,
	SpaceType,
	Space,
	ChannelType,
	FadeTime,
	CharName,
	LayoutPrefix,
	PerspectiveMatrix,
	Animation,
	AnimationSpeed,
	AnimationFrame,
	AnimationFrameType,
	PeriodicAnimation,
	PeriodicAnimationName,
	PeriodicAnimationDelta,
	PeriodicAnimationPeriod,
	VideoCodec,
	AudioCodec,
	RichPresence,
	AllowSkip,
	FunctionName,
	FunctionParam,
}

export let inlayHintMap = new Map<number, string>([
	[InlayHintType.FileName, "文件名"],
	[InlayHintType.CharacterFileName, "立绘文件名"],
	[InlayHintType.DiaFileName, "对话框文件名"],
	[InlayHintType.NameFileName, "姓名栏文件名"],
	[InlayHintType.CGFileName, "CG文件名"],
	[InlayHintType.PatternFadeFileName, "PatternFade文件名"],
	[InlayHintType.AudioFileName, "音频文件名"],
	[InlayHintType.BGMFileName, "BGM文件名"],
	[InlayHintType.BGSFileName, "BGS文件名"],
	[InlayHintType.SEFileName, "SE文件名"],
	[InlayHintType.DubFileName, "配音文件名"],
	[InlayHintType.VideoFileName, "视频文件名"],
	[InlayHintType.ID, "ID"],
	[InlayHintType.Alpha, "透明度"],
	[InlayHintType.X, "X坐标"],
	[InlayHintType.Y, "Y坐标"],
	[InlayHintType.Width, "宽度"],
	[InlayHintType.Height, "高度"],
	[InlayHintType.ColorHex, "颜色值(16进制)"],
	[InlayHintType.ColorRGB_R, "颜色值(RGB),R分量"],
	[InlayHintType.ColorRGB_G, "颜色值(RGB),G分量"],
	[InlayHintType.ColorRGB_B, "颜色值(RGB),B分量"],
	[InlayHintType.MemLimit, "内存限制"],
	[InlayHintType.XOffset, "X偏移"],
	[InlayHintType.YOffset, "Y偏移"],
	[InlayHintType.TransitionSpeed, "过渡速度"],
	[InlayHintType.DebugMSG, "调试信息"],
	[InlayHintType.WaitTime, "等待时间(ms)"],
	[InlayHintType.Label, "跳转标签"],
	[InlayHintType.Frame, "跳转场景"],
	[InlayHintType.Chapter, "跳转章节"],
	[InlayHintType.SwitchNum, "选项个数"],
	[InlayHintType.Text, "文本"],
	[InlayHintType.AchName, "成就名称"],
	[InlayHintType.StatName, "统计名称"],
	[InlayHintType.StatAdd, "统计增量"],
	[InlayHintType.ContentName, "内容名称"],
	[InlayHintType.Page, "页面"],
	[InlayHintType.Pos, "位置"],
	[InlayHintType.CaptureID, "捕获ID"],
	[InlayHintType.Boolean, "布尔值"],
	[InlayHintType.ValueID, "变量ID"],
	[InlayHintType.Value, "变量值"],
	[InlayHintType.Size, "字号"],
	[InlayHintType.Font, "字体"],
	[InlayHintType.OutlinePixel, "描边像素数"],
	[InlayHintType.Volume, "音量"],
	[InlayHintType.Channel, "音频通道"],
	[InlayHintType.FadeSpeed, "淡入淡出时长(毫秒)"],
	[InlayHintType.StartPoint, "开始点"],
	[InlayHintType.EndPoint, "结束点"],
	[InlayHintType.PreludePoint, "前奏点"],
	[InlayHintType.NowTalking, "语音指针"],
	[InlayHintType.Num, "个数"],
	[InlayHintType.Easing_FuncA, "缓动函数A"],
	[InlayHintType.Easing_FuncB, "缓动函数B"],
	[InlayHintType.Speed, "速度"],
	[InlayHintType.Instant, "立即"],
	[InlayHintType.CrossState, "跨阶段演出"],
	[InlayHintType.DelayTime, "间隔时间"],
	[InlayHintType.Dir, "方向"],
	[InlayHintType.Duration, "持续时间"],
	[InlayHintType.Orderable, "可排序"],
	[InlayHintType.Strength, "强度"],
	[InlayHintType.Period, "周期"],
	[InlayHintType.String, "字符串"],
	[InlayHintType.TypeEffect, "打字效果"],
	[InlayHintType.Time, "运动时间"],
	[InlayHintType.Mode, "运动模式"],
	[InlayHintType.FixedValue, "固定值"],
	[InlayHintType.Angle, "角度"],
	[InlayHintType.Clockwise, "顺时针"],
	[InlayHintType.CircleCount, "旋转圈数"],
	[InlayHintType.Order, "层级"],
	[InlayHintType.Type, "类型"],
	[InlayHintType.ShaderName, "Shader"],
	[InlayHintType.ShaderParamName, "Shader参数名"],
	[InlayHintType.ShaderParam, "Shader参数"],
	[InlayHintType.Force, "强制执行"],
	[InlayHintType.IgnoreDebug, "忽略仅调试可用"],
	[InlayHintType.ShadowMode, "阴影模式"],
	[InlayHintType.LoopTransition, "循环时叠化"],
	[InlayHintType.DubSequePrefix, "语音序列前缀"],
	[InlayHintType.DubChapterName, "语音章节名"],
	[InlayHintType.KeepSeq, "保持序列状态"],
	[InlayHintType.KeepNTK, "保持语音指针"],
	[InlayHintType.CommandToEval, "执行指令"],
	[InlayHintType.BlurRadius, "模糊半径"],
	[InlayHintType.Align, "对齐方式"],
	[InlayHintType.SpaceType, "间距类型"],
	[InlayHintType.Space, "间距"],
	[InlayHintType.ChannelType, "通道类型"],
	[InlayHintType.FadeTime, "过渡时间"],
	[InlayHintType.CharName, "角色姓名"],
	[InlayHintType.LayoutPrefix, "配置文件前缀"],
	[InlayHintType.PerspectiveMatrix, "变换矩阵"],
	[InlayHintType.Animation, "动画文件"],
	[InlayHintType.AnimationSpeed, "动画速度"],
	[InlayHintType.AnimationFrame, "动画帧"],
	[InlayHintType.AnimationFrameType, "动画帧类型"],
	[InlayHintType.PeriodicAnimation, "启用周期动画"],
	[InlayHintType.PeriodicAnimationName, "周期动画名"],
	[InlayHintType.PeriodicAnimationDelta, "增量"],
	[InlayHintType.PeriodicAnimationPeriod, "周期"],
	[InlayHintType.VideoCodec, "视频解码器"],
	[InlayHintType.AudioCodec, "音频解码器"],
	[InlayHintType.RichPresence, "丰富状态"],
	[InlayHintType.AllowSkip, "允许跳过"],
	[InlayHintType.FunctionName, "原生方法名"],
	[InlayHintType.FunctionParam, "方法参数"],
]);

export enum IDBehaviour {
	Create,
	Destroy,
}

export enum IDType {
	Pic,
	Str,
	DependOnParam,
}

export interface ID {
	bBehaviour: IDBehaviour,
	type: IDType,
	param?: number,
}

export enum KeywordType {
	Region,
	System,
	Values,
	Dialogue,
	Media,
	Effect,
	Preobj,
}

export const KeywordTypeMap = new Map<string, KeywordType>([
	['Region', KeywordType.Region],
	['System', KeywordType.System],
	['Values', KeywordType.Values],
	['Dialogue', KeywordType.Dialogue],
	['Media', KeywordType.Media],
	['Effect', KeywordType.Effect],
	['Preobj', KeywordType.Preobj],
]);

export interface ParamInfo {
	// basic
	prefix: string;
	keywordType?: KeywordType;
	minParam: number;
	maxParam: number;
	description: string[];
	type: ParamType[];
	required?: (string[] | undefined)[];
	inlayHintType?: number[];
	inlayHintAddition?: (Map<string, string> | undefined)[];

	// outline
	outlineKeyword?: boolean;

	// diagnostic
	treatAsOneParam?: boolean;
	internal?: boolean;
	deprecated?: boolean;
	VNModeOnly?: boolean;
	NonVNModeOnly?: boolean;

	// formatting
	indentIn?: boolean;
	indentOut?: boolean;
	emptyLineBefore?: boolean;
	emptyLineAfter?: boolean;
}

// default
export function GetDefaultParamInfo(): ParamInfo {
	return {
		// basic
		prefix: '',
		minParam: 0,
		maxParam: 0,
		description: [],
		type: [],
		required: undefined,
		inlayHintType: undefined,
		inlayHintAddition: undefined,

		// outline
		outlineKeyword: undefined,

		// diagnostic
		treatAsOneParam: undefined,
		internal: undefined,
		deprecated: undefined,
		VNModeOnly: undefined,
		NonVNModeOnly: undefined,

		// formatting
		indentIn: undefined,
		indentOut: undefined,
		emptyLineBefore: undefined,
		emptyLineAfter: undefined,
	};
};

// base list
export let commandInfoBaseList = new Map<string, ParamInfo | undefined>([
	//--------------------
	// Sharp
	//--------------------

	//-----------------
	// keywords_region
	//-----------------

	["Begin", {
		prefix: "#"
		, keywordType: KeywordType.Region
		, minParam: 0, maxParam: 0
		, description: ["代码块开始/结束标志，允许你在编辑器中将代码段折叠，在引擎内部无任何效果"]
		, type: []
		, indentIn: true
		, emptyLineBefore: true
		, emptyLineAfter: true
	}],
	["End", {
		prefix: "#"
		, keywordType: KeywordType.Region
		, minParam: 0, maxParam: 0
		, description: ["代码块开始/结束标志，允许你在编辑器中将代码段折叠，在引擎内部无任何效果"]
		, type: []
		, indentOut: true
		, emptyLineBefore: true
		, emptyLineAfter: true
	}],

	//-----------------
	// keywords_system
	//-----------------

	["Error", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#Error=ErrorPic.png"
			, "内部指令，当引擎报错时会显示`Data\Graphic\_Sys`下对应的错误提示`ErrorPic.png`"]
		, type: [ParamType.File]
		, internal: true
	}],
	["NULL", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["空指令，用于指令转译"]
		, type: []
	}],

	["HandlePreload", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["内部指令，用于处理脚本定义的预载行为"]
		, type: []
		, internal: true
	}],
	["HandleErase", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["内部指令，用于处理脚本定义的清理行为"]
		, type: []
		, internal: true
	}],

	["UnSkipAble", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["读取到该指令后，当前章节无法使用跳过按钮/快捷键跳过"]
		, type: []
	}],
	["SkipAble", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["允许当前使用跳过按钮/快捷键跳过，用于取消`#UnSkipAble`"]
		, type: []
	}],
	["SGO", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 2, maxParam: 2
		, description: ["\t#SGO=XOffset:YOffset"
			, "\t#SetGlobalOffset=XOffset:YOffset"
			, "设定演出对象的全局偏移量，特效、UI与字符串对象不受影响"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.XOffset, InlayHintType.YOffset]
	}],
	["SetGlobalOffset", undefined],
	["TransitionSpeed", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#TransitionSpeed=Value"
			, "更改不透明度叠化速度，默认为`10`"
			, "参数设定为`default`可重置默认值"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.TransitionSpeed]
	}],
	["SeparateTransitionSpeed", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 3, maxParam: 3
		, description: ["\t#SeparateTransitionSpeed=ID:Type:Value"
			, "更改对象叠化速度，默认为`10`，参数设定为`default`可重置默认值"
			, "该值不为零时，会在叠化阶段覆盖全局叠化速度，并在叠化阶段结束后重置为零"]
		, type: [ParamType.Number, ParamType.ObjType, ParamType.Number]
		, required: [
			undefined,
			object_objectType,
			undefined
		]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Type, InlayHintType.TransitionSpeed]
		, inlayHintAddition: [
			undefined,
			object_objectTypeMap,
			undefined
		]
	}],
	["ForceTransition", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["该指令会截取当前窗口，并按照`TransitionSpeed`指定的速度进行淡出，用于为无法创建叠化的指令(如`@Order`、`#DefineRGB`等)强制添加叠化"]
		, type: []
	}],
	["Save", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["保存中断存档"]
		, type: []
	}],
	["Debug", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["调试模式下无叠化显示调试参数"]
		, type: []
	}],
	["DebugOff", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["调试模式下无叠化关闭调试参数"]
		, type: []
	}],

	["RefreshRGB", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["内部指令，将RGB刷新为指定的值"]
		, type: []
		, internal: true
	}],
	["StashRGB", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["缓存当前RGB值"]
		, type: []
	}],
	["RestoreRGB", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["将RGB指定为缓存的值"]
		, type: []
	}],
	["DisableRGB", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#DisableRGB=ID",
			"指定图像对象不受RGB参数影响"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.ID]
	}],
	["EnableRGB", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#EnableRGB=ID",
			"指定图像对象受到RGB参数影响"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.ID]
	}],

	["DefineRGB", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 3
		, description: ["\t#DefineRGB=R:G:B"
			, "\t#DefineRGB=#FFFFFF"
			, "定义立绘的色调RGB值为`R:G:B/#FFFFFF`，无叠化更新所有立绘对象(非特殊非特效对象)的RGB参数。该指令通常用于根据背景光照情况调整立绘色调，可使用附带的`RGBDefiner`工具来直观的调整该参数"]
		, type: [ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["TransitionRGB", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 3
		, description: ["\t#TransitionRGB=R:G:B"
			, "\t#TransitionRGB=#FFFFFF"
			, "与`#DefineRGB`行为一致，但是附带叠化过程"]
		, type: [ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],

	["MSG", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#MSG=Message"
			, "仅调试模式下可用，于调试输出中输出Message"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.DebugMSG]
	}],
	["MSGRAW", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["\t#MSGRAW"
			, "内部指令，仅调试模式下可用，于调试输出中输出内部变量，用于回避字符转义"]
		, type: []
		, inlayHintType: []
		, internal: true
	}],
	["MSGClear", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["仅调试模式下可用，清空调试输出，在翻页时会自动调用"]
		, type: []
	}],
	["StopFF", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 1
		, description: ["\t#StopFF=IgnoreDebug"
			, "解析至该语句后，快进将会在下一句文本处停止"
			, "默认仅调试模式下可用，`IgnoreDebug`为`1`时在通常模式下也可用"]
		, type: [ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.IgnoreDebug]
		, outlineKeyword: true
		, emptyLineBefore: true
	}],
	["StopFastForward", undefined],

	["HideUI", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["无叠化，隐藏菜单与快捷栏，会自动转译`#DisableUI`"]
		, type: []
	}],
	["ShowUI", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["无叠化，重新显示菜单与快捷栏，会自动转译`#EnableUI`"]
		, type: []
	}],
	["UpdateUICoord", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 1
		, description: ["\t#UpdateUICoord=Forced:CoordOnly"
			, "相对对话框更新UI坐标，`Forced = 1`时强制更新，`CoordOnly = 1`时不更新不透明度"]
		, type: [ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.Force]
		, internal: true
	}],
	["DisableUI", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["禁用UI"]
		, type: []
	}],
	["EnableUI", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["启用UI"]
		, type: []
	}],

	["FNT", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["强制无叠化，强制无叠化状态在解析到文本后重置为关闭"]
		, type: []
	}],
	["ForceNoTransition", undefined],

	["FNTO", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["关闭强制无叠化"]
		, type: []
	}],
	["ForceNoTransitionOff", undefined],

	["Eval", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#Eval=CommandToEval"
			, "执行`CommandToEval"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.CommandToEval]
		, treatAsOneParam: true
	}],

	["SideEffect", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["当声明脚本无副作用时，断言此行下方的行具有副作用"]
		, type: []
	}],
	["NoSideEffect", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["当声明脚本无副作用时，断言此行下方的行不具有副作用"]
		, type: []
	}],
	["EOF", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["文件尾标志，普通模式下解析到该指令即返回报错信息`脚本文件结尾必须为有效跳转`，`Lite`模式下则为执行完成标记"]
		, type: []
	}],

	["WaitGeneral", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 1
		, description: ["\t#WaitGeneral=Time"
			, "等待指令的公共调用，处理初始化、等待时间与状态机"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.WaitTime]
		, internal: true
		, emptyLineAfter: true
	}],
	["W", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 1
		, description: ["\t#W=2000"
			, "\t#Wait=2000"
			, "等待指令=等待时间"
			, "等待指令只对**交叠淡化**有效"
			, "等待时间为零时，则会在当前叠化指令完成后立即继续解析操作"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.WaitTime]
		, emptyLineAfter: true
	}],
	["Wait", undefined],
	["FW", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 1
		, description: ["\t#FW=2000"
			, "\t#ForceWait=2000"
			, "强制等待指令=等待时间"
			, "强制等待指令对**移动旋转、BGM淡出淡出**等有效"
			, "等待时间为零时，则会在当前叠化指令完成后立即继续解析操作"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.WaitTime]
		, emptyLineAfter: true
	}],
	["ForceWait", undefined],
	["OW", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 1
		, description: ["\t#OW=2000"
			, "\t#OperationWait=2000"
			, "等待指令=等待时间"
			, "与`#Wait`行为一致，但是操作等待指令会等待玩家输入"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.WaitTime]
		, emptyLineAfter: true
	}],
	["OperationWait", undefined],

	["AutoChangePage", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 1
		, description: ["\t#AutoChangePage=Time"
			, "该指令后的文本会在等待时间后自动换行，覆盖自动与手动翻页操作"
			, "若不指定Time，则会使用当前设置中的默认翻页延时"
			, "\t#AutoChangePage=1500"
			, "\t……1"
			, "\t&……2"
			, "文本会先显示`……1`，等待1500毫秒，然后追加显示`&……2`，随后通常处理"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.DelayTime]
		, emptyLineBefore: true
	}],
	["TextDisplaySpeed", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#TextDisplaySpeed=Time"
			, "`Time`为显示间隔的毫秒数，该指令会覆盖当前行文本的显示速度，无视设置中的`ShowAll`属性"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.DelayTime]
	}],

	["Jmp", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#JMP=Label"
			, "脚本内跳转，跳转到指定的标签位"
			, "置跳转标志位为1，跳转标志位在解析到文本后重置为0"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.Label]
		, outlineKeyword: true
		, emptyLineAfter: true
	}],
	["NJMP", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#NJMP=Label"
			, "检测并重置跳转标志位"
			, "若非跳转至此(跳转标志位等于0)，则跳转到指定的标签位，用于跳转后的再初始化"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.Label]
		, outlineKeyword: true
		, emptyLineAfter: true
	}],
	["Call", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#Call=Label"
			, "使用`#Call=Label`指令调用位于`Label`处的代码段。该代码段必须位于`#EOF`之前，且必须以`#Ret`结尾"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.Label]
		, outlineKeyword: true
		, emptyLineAfter: true
	}],
	["Ret", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["返回当前`Label`代码段的调用位点"]
		, type: []
		, outlineKeyword: true
		, emptyLineAfter: true
	}],
	["CallFunc", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 33
		, description: ["\t#CallFunc=FuncName:Params..."
			, "调用原生方法FuncName，用于二次扩展"]
			, type: [ParamType.String
				, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
				, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
				, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
				, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
				, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
				, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
				, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
				, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any]
			, inlayHintType: [InlayHintType.FunctionName
				,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam
				,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam
				,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam
				,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam
				,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam
				,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam
				,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam
				,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam,InlayHintType.FunctionParam]
	}],
	["FJMP", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#FJMP=TargetFrame"
			, "\t#JmpFra=TargetFrame"
			, "跨场景跳转，跳转到场景`TargetFrame`，仅接受数字参数"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.Frame]
		, outlineKeyword: true
	}],
	["JmpFra", undefined],

	["CJMP", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#CJMP=Chapter"
			, "\t#JmpCha=Chapter"
			, "跨章节跳转，更新`CurrentChapter`，跳转到章节`Chapter`"]
		, type: [ParamType.File]
		, inlayHintType: [InlayHintType.Chapter]
		, outlineKeyword: true
	}],
	["JmpCha", undefined],

	["SJMP", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["跳转到下一个跳转指令并重启扫描，内部指令，用于跳过文本功能"
			, "置跳转标志位为1，跳转标志位在解析到文本后重置为0"]
		, type: []
		, internal: true
		, deprecated: true
		, outlineKeyword: true
		, emptyLineAfter: true
	}],
	["SkipJmp", undefined],

	["FFJMP", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["使用无间断快进跳转到下一个跳转指令并重启扫描，内部指令，用于跳过文本功能"
			, "相较于`#SJMP/#SkipJmp`，无需处理跳转标志位与再初始化"]
		, type: []
		, internal: true
		, outlineKeyword: true
		, emptyLineAfter: true
	}],

	["SkipAnchor", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["该指令会被当作跳过终止指令处理。范例再初始化代码如下："
			, "\t#SkipAnchor"
			, "\t#NJMP=Init"
			, "\t#FNT"
			, "\t@CAD"
			, "\t@CG=NewCG.png"
			, "\t#TransitionSpeed=10"
			, "\t#FNTO"
			, "\t;Init"]
		, type: []
		, outlineKeyword: true
		, emptyLineAfter: true
	}],

	["SetSwitchColor", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 3
		, description: ["\t#SetSwitchColor=R:G:B"
			, "\t#SetSwitchColor=#FFFFFF"
			, "指定通常选项的颜色"
			, "该指令对所有选项生效，请在`#CreateSwitch`前调用"]
		, type: [ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["SetSwitchHoverColor", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 3
		, description: ["\t#SetSwitchHoverColor=R:G:B"
			, "\t#SetSwitchHoverColor=#FFFFFF"
			, "指定鼠标悬浮选项的颜色"
			, "该指令对所有选项生效，请在`#CreateSwitch`前调用"]
		, type: [ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["SetSwitchNegativeColor", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 3
		, description: ["\t#SetSwitchNegativeColor=R:G:B"
			, "\t#SetSwitchNegativeColor=#FFFFFF"
			, "指定不可用选项的颜色"
			, "该指令对所有选项生效，请在`#CreateSwitch`前调用"]
		, type: [ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["SetSwitchShader", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 2, maxParam: 4
		, description: ["\t#SetSwitchShader=Outline:R:G:B"
			, "\t#SetSwitchShader=Outline:#FFFFFF"
			, "指定通常选项的描边效果"
			, "该指令对所有选项生效，请在`#CreateSwitch`前调用"]
		, type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.OutlinePixel, InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],

	["CreateSwitch", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#CreateSwitch=SwitchNum"
			, "选项分支创建的入口指令，用于创建`SwitchNum`个分支"
			, "该指令会记录当前扫描指针位置，用于保存/读取"
			, "同时转义为`#Wait`来执行该指令前的其他带叠化指令的演出"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.SwitchNum]
		, outlineKeyword: true
		, emptyLineBefore: true
	}],
	["Switch", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 4, maxParam: 4
		, description: ["\t#Switch=X:Y:Text:Label"
			, "控制创建的分支选项，指定其X/Y坐标，选项文本与跳转标签"
			, "如果跳转标签定义为`Negative`，则该选项设定为灰色，无效"]
		, type: [ParamType.Number, ParamType.Number, ParamType.String, ParamType.String]
		, inlayHintType: [InlayHintType.X, InlayHintType.Y, InlayHintType.Text, InlayHintType.Label]
	}],

	["RichPresence", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 1
		, description: ["\t#RichPresence=Message"
			, "更新`chapter`，并更新`steam_display`为`#ChapterStates`，即`当前章节: %chapter%`"
			, "若当前章节名在鉴赏定义中不存在对应项，则使用原始名称。若`Message`不为空，则会将其附加至章节名后方"
			, "在读取脚本时会自动调用`#RichPresence`将丰富状态更新为当前章节名。在非对话页面中，则会将丰富状态更新为当前页面名"
		]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.RichPresence]
	}],
	["ScreenShot", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["\t调用Steam Overlay截取屏幕，并将标记地点Tag",
			"标记场景名需要在`Appreciation_Definition`的CG/BG/Video对应映射部分标记名称。角色名根据现存图像演出对象的ID查找，定义在`Appreciation_Mapping_Character`一节中"
		]
		, type: []
	}],

	["UnlockAch", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#UnlockAch=Steam_AchName"
			, "解锁成就`Steam_AchName`"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.AchName]
	}],
	["AddToStat", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 2
		, description: ["\t#AddToStat=Steam_StatName:Steam_StatAdd"
			, "更新统计`Steam_StatName`，增加`Steam_StatAdd`"
			, "若`Steam_StatAdd`留空，默认为统计量+1"]
		, type: [ParamType.String, ParamType.Number]
		, inlayHintType: [InlayHintType.StatName, InlayHintType.StatAdd]
	}],
	["UnlockAppreciation", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 3
		, description: ["\t#UnlockAppreciation=ContentName:Page:Pos"
			, "解锁位于`Page`页第`Pos`个指向`ContentName`的鉴赏，`Page`与`Pos`参数从零开始。留空`Page`与`Pos`参数时，若启用了映射且映射定义合法，则依照定义解锁；若未启用映射，则依照记录数值依此解锁"
			, "该指令需要内部参数`AppreciationType`，因此不能直接调用，而是由下列指令转译后执行："]
		, type: [ParamType.String, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ContentName, InlayHintType.Page, InlayHintType.Pos]
		, internal: true
	}],
	["UnlockAppreciation_Chapter", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 3
		, description: ["\t#UnlockAppreciation_Chapter=ChapterName:Page:Pos"
			, "于场景回想中解锁位于`Page`页第`Pos`个指向`ChapterName`的鉴赏"
			, "含转译指令在内，解析到`#JMPFra`或`#JMPCha`指令后，会自动执行留空`Page`与`Pos`参数的指令"]
		, type: [ParamType.File, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.Chapter, InlayHintType.Page, InlayHintType.Pos]
	}],
	["UnlockAppreciation_Graphic", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 3
		, description: ["\t#UnlockAppreciation_Graphic=GraphicName:Page:Pos"
			, "于场景回想中解锁位于`Page`页第`Pos`个指向`GraphicName`的鉴赏。`ChapterName`应为`Characters`的相对路径，CG文件夹下的文件的完整`ChapterName`为`..CG\Graphic.png`"
			, "该指令会自动忽略非CG文件夹下的文件，同时会根据`Appreciation_Definition`中`Graphic_SeparateBG`的启用情况，根据`Appreciation_CGToBGList`决定当前文件是否作为背景进行鉴赏映射处理"
			, "含转译指令在内，解析到`@Char`或`@CharChange`指令后，会自动执行留空`Page`与`Pos`参数的指令"]
		, type: [ParamType.File, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.CGFileName, InlayHintType.Page, InlayHintType.Pos]
	}],
	["UnlockAppreciation_Audio", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 3
		, description: ["\t#UnlockAppreciation_Audio=AudioName:Page:Pos"
			, "于场景回想中解锁位于`Page`页第`Pos`个指向`AudioName`的鉴赏"
			, "含转译指令在内，解析到`@BGM`或`@BGMPre`指令后，会自动执行留空`Page`与`Pos`参数的指令"]
		, type: [ParamType.File, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.BGMFileName, InlayHintType.Page, InlayHintType.Pos]
	}],
	["UnlockAppreciation_Video", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 3
		, description: ["\t#UnlockAppreciation_Video=VideoName:Page:Pos"
			, "于场景回想中解锁位于`Page`页第`Pos`个指向`VideoName`的鉴赏"
			, "含转译指令在内，解析到`@PlayVideo`、`@OpenVideo`或`@ChangeVideo`指令后，会自动执行留空`Page`与`Pos`参数的指令"]
		, type: [ParamType.File, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.VideoFileName, InlayHintType.Page, InlayHintType.Pos]
	}],

	["VNMode_Newline", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["在文本间插入一个空行。建议在对白文本前后使用，以示区分"]
		, type: []
		, VNModeOnly: true
	}],
	["VNMode_ChangePage", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 0, maxParam: 0
		, description: ["切换页面"
			, "由于VN模式允许一个页面内显示多句文本，因此程序无法自动处理，需要手动指定翻页点。不进行翻页会导致文本显示出界"]
		, type: []
		, VNModeOnly: true
	}],

	["SetCapture", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#SetCapture=ID"
			, "强制更新捕获ID为`ID`"
			, "在执行到下一个指定了ID的指令时，ID会被覆盖"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.CaptureID]
	}],
	["CaptureSys", {
		prefix: "#"
		, keywordType: KeywordType.System
		, minParam: 1, maxParam: 1
		, description: ["\t#CaptureSys=On"
			, "是否捕获系统对象的ID，默认关闭"]
		, type: [ParamType.Boolean]
		, inlayHintType: [InlayHintType.Boolean]
	}],

	//-----------------
	// keywords_values
	//-----------------

	["SV", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#SV=ValueID:Value"
			, "\t#SetValue=ValueID:Value"
			, "令`ValueID`=`Value`，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则为数值赋值，否则为字符串赋值"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.Value]
	}],
	["SetValue", undefined],
	["SVV", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#SVV=ValueIDA:ValueIDB"
			, "\t#SetValueValue=ValueIDA:ValueIDB"
			, "\t#SVAB=ValueIDA:ValueIDB"
			, "\t#SetValueAB=ValueIDA:ValueIDB"
			, "`ValueIDA`=`ValueIDB`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.ValueID]
	}],
	["SetValueValue", undefined],
	["SVAB", undefined],
	["SetValueAB", undefined],
	["SSS", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#SSS=ValueIDA:ValueIDB"
			, "\t#SetStringString=ValueIDA:ValueIDB"
			, "\t#SSAB=ValueIDA:ValueIDB"
			, "\t#SetStringAB=ValueIDA:ValueIDB"
			, "`ValueIDA`=`ValueIDB`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.ValueID]
	}],
	["SetStringString", undefined],
	["SSAB", undefined],
	["SetStringAB", undefined],
	["VA", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#VA=ValueID:Value"
			, "\t#ValueAdd=ValueID:Value"
			, "`ValueID`=`ValueID`+`Value`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.Value]
	}],
	["ValueAdd", undefined],
	["VAV", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#VA=ValueID:Value"
			, "\t#ValueAdd=ValueID:Value"
			, "`ValueID`=`ValueID`+`Value`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.ValueID]
	}],
	["ValueAddValue", undefined],
	["VS", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#VS=ValueID"
			, "\t#ValueSub=ValueID:Value"
			, "`ValueID`=`ValueID`-`Value`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.Value]
	}],
	["ValueSub", undefined],
	["VSV", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#VS=ValueID"
			, "\t#ValueSub=ValueID:Value"
			, "`ValueID`=`ValueID`-`Value`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.ValueID]
	}],
	["ValueSubValue", undefined],
	["VM", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#VM=ValueID"
			, "\t#ValueMul=ValueID:Value"
			, "`ValueID`=`ValueID`*`Value`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.Value]
	}],
	["ValueMul", undefined],
	["VMV", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#VMV=ValueIDA:ValueIDB"
			, "\t#ValueMulValue=ValueIDA:ValueIDB"
			, "`ValueIDA`=`ValueIDA`*`ValueIDB`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.ValueID]
	}],
	["ValueMulValue", undefined],
	["VD", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#VD=ValueID"
			, "\t#ValueDiv=ValueID:Value"
			, "`ValueID`=`ValueID`/`Value`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.Value]
	}],
	["ValueDiv", undefined],
	["VDV", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#VDV=ValueIDA:ValueIDB"
			, "\t#ValueDivValue=ValueIDA:ValueIDB"
			, "`ValueIDA`=`ValueIDA`/`ValueIDB`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.ValueID]
	}],
	["ValueDivValue", undefined],

	["CMP", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#CMP=ValueID:Value"
			, "\t#CMPV=ValueID:Value"
			, "\t#CMPValue=ValueID:Value"
			, "比较`ValueID`与`Value`的大小，若`Value`为数值(匹配`\+[0-9]+(.[0-9]+)?\|-[0-9]+(.[0-9]+)?\|[0-9]+(.[0-9]+)?`)，则与数值比较，否则与字符串比较"]
		, type: [ParamType.Number, ParamType.Any]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.Value]
		, outlineKeyword: true
	}],
	["CMPV", undefined],
	["CMPValue", undefined],
	["CMPGeneral", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#CMPGeneral=Value:Value"
			, "不引用变量，直接比较两个值，规则与`#CMP`相同"]
		, type: [ParamType.Any, ParamType.Any]
		, inlayHintType: [InlayHintType.Value, InlayHintType.Value]
	}],
	["CMPAB", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#CMPAB=ValueIDA:ValueIDB"
			, "\t#CMPVAB=ValueIDA:ValueIDB"
			, "\t#CMPValueAB=ValueIDA:ValueIDB"
			, "\t#CMPVV=ValueIDA:ValueIDB"
			, "\t#CMPValueValue=ValueIDA:ValueIDB"
			, "比较`ValueIDA`与`ValueIDB`的大小"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.ValueID]
	}],
	["CMPVAB", undefined],
	["CMPValueAB", undefined],
	["CMPVV", undefined],
	["CMPValueValue", undefined],
	["CMPSAB", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 2, maxParam: 2
		, description: ["\t#CMPSAB=ValueIDA:ValueIDB"
			, "\t#CMPStringAB=ValueIDA:ValueIDB"
			, "\t#CMPSS=ValueIDA:ValueIDB"
			, "\t#CMPStringString=ValueIDA:ValueIDB"
			, "比较`ValueIDA`与`ValueIDB`的大小"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ValueID, InlayHintType.ValueID]
	}],
	["CMPStringAB", undefined],
	["CMPSS", undefined],
	["CMPStringString", undefined],

	["JE", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 1, maxParam: 1
		, description: ["\t#JE=Label"
			, "比较结果等于时，跳转至`Label`"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.Label]
	}],
	["JA", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 1, maxParam: 1
		, description: ["\t#JE=Label"
			, "比较结果大于时，跳转至`Label`"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.Label]
	}],
	["JB", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 1, maxParam: 1
		, description: ["\t#JE=Label"
			, "比较结果小于时，跳转至`Label`"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.Label]
	}],
	["JNE", {
		prefix: "#"
		, keywordType: KeywordType.Values
		, minParam: 1, maxParam: 1
		, description: ["\t#JE=Label"
			, "比较结果不等于时，跳转至`Label`"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.Label]
	}],

	//-----------------
	// keywords_dialogue
	//-----------------

	["TextAlign", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 2, maxParam: 3
		, description: ["\t#TextAlign=Align:Type:ID"
			, "设定对齐方式"
			, "`Type`为`Str`时，要求`ID`参数，作用于该`ID`对应的字符串对象"]
		, type: [ParamType.String, ParamType.String, ParamType.Number]
		, required: [
			[
				"Left",
				"Center",
				"Right",
				"Top",
				"VCenter",
				"Bottom",
			],
			align_objectType,
			undefined]
		, inlayHintType: [InlayHintType.Align, InlayHintType.Type, InlayHintType.ID]
		, inlayHintAddition: [
			new Map<string, string>([
				["Left", "左对齐"],
				["Center", "水平居中"],
				["Right", "右对齐"],
				["Top", "顶端对齐"],
				["VCenter", "垂直居中"],
				["Bottom", "底端对齐"]
			]),
			align_objectTypeMap,
			undefined]
	}],
	["TextSpace", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 3, maxParam: 4
		, description: ["\tTextSpace=SpaceType:Space:Type:ID"
			, "设置行/列间距"
			, "`Type`为`Str`时，要求`ID`参数，作用于该`ID`对应的字符串对象"]
		, type: [ParamType.String, ParamType.Number, ParamType.String, ParamType.Number]
		, required: [
			[
				"Row",
				"Col"
			],
			undefined,
			align_objectType,
			undefined]
		, inlayHintType: [InlayHintType.SpaceType, InlayHintType.Space, InlayHintType.Type, InlayHintType.ID]
		, inlayHintAddition: [
			new Map<string, string>([
				["Row", "行间距"],
				["Col", "列间距"]
			]),
			undefined,
			align_objectTypeMap,
			undefined]
	}],

	["TextColor", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 2, maxParam: 4
		, description: ["\t#TextColor=Fixed:R:G:B"
			, "\t#TextColor=Fixed:#FFFFFF"
			, "内部指令，更新文本颜色"]
		, type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.FixedValue, InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
		, internal: true
	}],
	["TextSize", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 2, maxParam: 2
		, description: ["\t#TextSize=Fixed:Size"
			, "内部指令，更新文本大小"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.FixedValue, InlayHintType.Size]
		, internal: true
	}],
	["TextFont", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 2, maxParam: 2
		, description: ["\t#TextFont=Fixed:Size"
			, "内部指令，更新文本字体"]
		, type: [ParamType.Number, ParamType.String]
		, inlayHintType: [InlayHintType.FixedValue, InlayHintType.Font]
		, internal: true
	}],

	["TextShaderOn", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 3, maxParam: 5
		, description: ["\t#TextShaderOn=Fixed:OutlinePixel:R:G:B"
			, "\t#TextShaderOn=Fixed:OutlinePixel:#FFFFFF"
			, "内部指令，更新文本Shader"]
		, type: [ParamType.Number, ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.FixedValue, InlayHintType.OutlinePixel, InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
		, internal: true
	}],
	["TextShaderOff", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["\t#TextShaderOff=Fixed"
			, "内部指令，更新文本Shader"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.FixedValue]
		, internal: true
	}],

	["TextOutColor", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 2, maxParam: 4
		, description: ["\t#TextOutColor=Fixed:R:G:B"
			, "\t#TextOutColor=Fixed:#FFFFFF"
			, "内部指令，更新文本Shader"]
		, type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.FixedValue, InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
		, internal: true
	}],
	["TextOutPixel", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 2, maxParam: 2
		, description: ["\t#TextOutPixel=Fixed:OutlinePixel"
			, "内部指令，更新文本Shader"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.FixedValue, InlayHintType.OutlinePixel]
		, internal: true
	}],
	["TextShadow", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 2, maxParam: 2
		, description: ["\t#TextShadow=Fixed:On/Off"
			, "内部指令，更新文本Shader"]
		, type: [ParamType.Number, ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.FixedValue, InlayHintType.ShadowMode]
		, internal: true
	}],
	["TextDefault", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 2, maxParam: 2
		, description: ["\t#TextDefault=Fixed:Prefix"
			, "内部指令，根据配置文件更新文本外观"]
		, type: [ParamType.Number, ParamType.String]
		, inlayHintType: [InlayHintType.FixedValue, InlayHintType.LayoutPrefix]
		, internal: true
	}],


	["DiaColor", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 3
		, description: ["\t#DiaColor=R:G:B"
			, "\t#DiaColor=#FFFFFF"
			, "定义对白文字的RGB值，`R:G:B/#FFFFFF`"
			, "字体颜色无法设置为`(255,255,255)/#FFFFFF`，否则会导致勾边错误"]
		, type: [ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["DiaSize", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["t#DiaSize=size"
			, "定义对白文字的大小，AVG模式下默认大小为17，VN模式下默认大小为18"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.Size]
	}],
	["DiaFont", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["\t#DiaFont=font"
			, "定义对白文字的字体"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.Font]
	}],

	["DiaShaderOn", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 2, maxParam: 4
		, description: ["\t#DiaShaderOn=OutlinePixel:R:G:B"
			, "\t#DiaShaderOn=OutlinePixel:#FFFFFF"
			, "启用对白勾边，勾边颜色为`RGB/#FFFFFF`，勾边像素数为`OutlinePixel`"]
		, type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.OutlinePixel, InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["DiaShaderOff", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 0, maxParam: 0
		, description: ["关闭对白勾边效果"]
		, type: []
	}],

	["DiaOutColor", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 3
		, description: ["\t#DiaOutColor=R:G:B"
			, "\t#DiaOutColor=#FFFFFF"
			, "启用勾边时，更改对白勾边颜色为`RGB/#FFFFFF`"]
		, type: [ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["DiaOutPixel", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["\t#DiaOutPixel=OutlinePixel"
			, "启用勾边时，更改对白勾边像素数为`OutlinePixel`"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.OutlinePixel]
	}],
	["DiaShadow", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["\t#DiaShadow=On/Off"
			, "打开或关闭阴影模式，该模式仅在描边启用时有效"]
		, type: [ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.ShadowMode]
	}],

	["NameColor", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 3
		, description: ["\t#NameColor=R:G:B"
			, "\t#NameColor=#FFFFFF"
			, "定义姓名文字的RGB值，`R:G:B/#FFFFFF`"
			, "字体颜色无法设置为`(255,255,255)/#FFFFFF`，否则会导致勾边错误"]
		, type: [ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
		, NonVNModeOnly: true
	}],
	["NameSize", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["\t#NameSize=size"
			, "定义姓名文字的大小，默认大小为18"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.Size]
		, NonVNModeOnly: true
	}],
	["NameFont", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["\t#NameFont=font"
			, "定义姓名文字的字体"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.Font]
		, NonVNModeOnly: true
	}],

	["NameShaderOn", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 2, maxParam: 4
		, description: ["\t#NameShaderOn=OutlinePixel:R:G:B"
			, "\t#NameShaderOn=OutlinePixel:#FFFFFF"
			, "启用姓名勾边，勾边颜色为`RGB/#FFFFFF`，勾边像素数为`OutlinePixel`"]
		, type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.OutlinePixel, InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
		, NonVNModeOnly: true
	}],
	["NameShaderOff", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 0, maxParam: 0
		, description: ["关闭姓名勾边效果"]
		, type: []
		, NonVNModeOnly: true
	}],

	["NameOutColor", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 3
		, description: ["\t#NameOutColor=R:G:B"
			, "\t#NameOutColor=#FFFFFF"
			, "启用勾边时，更改姓名勾边颜色为`RGB/#FFFFFF`"]
		, type: [ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
		, NonVNModeOnly: true
	}],
	["NameOutPixel", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["\t#NameOutPixel=OutlinePixel"
			, "启用勾边时，更改对白勾边像素数为`OutlinePixel`"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.OutlinePixel]
		, NonVNModeOnly: true
	}],
	["NameShadow", {
		prefix: "#"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["\t#NameShadow=On/Off"
			, "打开或关闭阴影模式，该模式仅在描边启用时有效"]
		, type: [ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.ShadowMode]
		, NonVNModeOnly: true
	}],

	//--------------------
	// At
	//--------------------

	["Dia", {
		prefix: "@"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["\t@Dia=filename.png"
			, "\t@DiaChange=filename.png"
			, "切换对话框，解析到文本后进行，调用指令`@DiaTrans`"]
		, type: [ParamType.File]
		, inlayHintType: [InlayHintType.DiaFileName]
	}],
	["DiaChange", undefined],
	["DiaTrans", {
		prefix: "@"
		, keywordType: KeywordType.Dialogue
		, minParam: 0, maxParam: 1
		, description: ["\t@DiaTrans=force"
			, "内部转译指令，判定并更新对话框"
			, "`force` = `1`时，强制执行叠化"]
		, type: [ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.Force]
		, internal: true
	}],
	["Name", {
		prefix: "@"
		, keywordType: KeywordType.Dialogue
		, minParam: 1, maxParam: 1
		, description: ["\t@Name=filename.png"
			, "\t@NameChange=filename.png"
			, "切换姓名栏，解析到文本后进行，调用指令`@NameTrans`"]
		, type: [ParamType.File]
		, inlayHintType: [InlayHintType.NameFileName]
		, NonVNModeOnly: true
	}],
	["NameChange", undefined],
	["NameTrans", {
		prefix: "@"
		, keywordType: KeywordType.Dialogue
		, minParam: 0, maxParam: 1
		, description: ["\t@NameTrans=force"
			, "内部转译指令，判定并更新姓名栏"
			, "`force` = `1`时，强制执行叠化"]
		, type: [ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.Force]
		, internal: true
		, NonVNModeOnly: true
	}],
	["StashUIGraphic", {
		prefix: "@"
		, keywordType: KeywordType.Dialogue
		, minParam: 0, maxParam: 0
		, description: ["保存UI图像，用于在`@TextFadeOut`后还原"]
		, type: []
	}],
	["RestoreUIGraphic", {
		prefix: "@"
		, keywordType: KeywordType.Dialogue
		, minParam: 0, maxParam: 0
		, description: ["还原`@StashUIGraphic`保存的信息"]
		, type: []
	}],
	["TextFadeOut", {
		prefix: "@"
		, keywordType: KeywordType.Dialogue
		, minParam: 0, maxParam: 0
		, description: ["该指令会自动转译为"
			, "\t@Name=NameNull.png"
			, "\t@NameTrans"
			, "\t@Dia=DiaNull.png"
			, "\t@DiaTrans"]
		, type: []
	}],

	//-----------------
	// keywords_media
	//-----------------

	["P", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 3, maxParam: 5
		, description: ["\t@P=filename.mp3:volume:channel:channelType:FadeIn"
			, "\t@Play=filename.mp3:volume:channel:channelType:FadeIn"
			, "在指定的频道内以指定的音量播放一次`Audio`文件夹下指定的音频文件"
			, "其中`volume`可以直接接受`BGM`、`BGS`、`SE`、`DUB`作为参数来返回对应通道的音量"]
		, type: [ParamType.File, ParamType.String, ParamType.Number, ParamType.ZeroOne, ParamType.Number]
		, inlayHintType: [InlayHintType.AudioFileName, InlayHintType.Volume, InlayHintType.Channel, InlayHintType.ChannelType, InlayHintType.FadeTime]
		, inlayHintAddition: [
			undefined,
			undefined,
			undefined,
			audio_inlayHintAddition_ChannelTypeMap,
			undefined,
		]
	}],
	["Play", undefined],

	["Stop", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 1
		, description: ["\t@Stop=channel:channelType:FadeOut"
			, "停止特定通道的音频播放"]
		, type: [ParamType.Number, ParamType.ZeroOne, ParamType.Number]
		, inlayHintType: [InlayHintType.Channel, InlayHintType.ChannelType, InlayHintType.FadeTime]
		, inlayHintAddition: [
			undefined,
			undefined,
			audio_inlayHintAddition_ChannelTypeMap,
		]
	}],

	["SE", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 1
		, description: ["\t@SE=filename.MP3"
			, "播放SE"]
		, type: [ParamType.File]
		, inlayHintType: [InlayHintType.SEFileName]
	}],

	["Bgm", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 4
		, description: ["\t@Bgm=filename.MP3:fadeSpeed:StartPoint:endpoint"
			, "\t@BgmLoop=filename.MP3:fadeSpeed:StartPoint:endpoint"
			, "定义BGM的A-B循环，从起点开始循环播放到终点，淡入速度为淡入持续秒数，等待淡入淡出属于强制等待"
			, "淡入淡出速度为持续毫秒数，等待淡入淡出属于强制等待"
			, "循环起始点/循环终止点参数设定为零，引擎会进行整曲循环"]
		, type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.BGMFileName, InlayHintType.FadeSpeed, InlayHintType.StartPoint, InlayHintType.EndPoint]
	}],
	["BgmLoop", undefined],

	["BgmPre", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 5
		, description: ["\t@BgmPre=filename.MP3:fadeSpeed:StartPoint:endpoint:PreludePoint"
			, "\t@BgmPreludeLoop=filename.MP3:fadeSpeed:StartPoint:endpoint:PreludePoint"
			, "定义BGM有前奏的A-B循环，从前奏点开始播放，播放至循环终点后，在循环起点和循环终点间循环播放"
			, "淡入淡出速度为持续毫秒数，等待淡入淡出属于强制等待"
			, "循环起始点/循环终止点/前奏点参数设定为零，效果与上条指令一致"]
		, type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.BGMFileName, InlayHintType.FadeSpeed, InlayHintType.StartPoint, InlayHintType.EndPoint, InlayHintType.PreludePoint]
	}],
	["BgmPreludeLoop", undefined],

	["BgmPause", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 0
		, description: ["暂停BGM"]
		, type: []
	}],
	["BgmResume", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 0
		, description: ["恢复BGM"]
		, type: []
	}],

	["BgmFadeOut", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 1
		, description: ["\t@BgmFadeOut=fadeSpeed"
			, "淡出BGM"
			, "淡入淡出速度为持续毫秒数，等待淡入淡出属于强制等待"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.FadeSpeed]
	}],

	["Bgs", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 2
		, description: ["\t@Bgs=filename.MP3:fadeSpeed"
			, "\t@BgsLoop=filename.MP3:fadeSpeed"
			, "定义BGS，BGS默认循环播放，请确认BGS素材可无缝循环"
			, "淡入淡出速度为持续毫秒数，等待淡入淡出属于强制等待"]
		, type: [ParamType.File, ParamType.Number]
		, inlayHintType: [InlayHintType.BGSFileName, InlayHintType.FadeSpeed]
	}],
	["BgsLoop", undefined],

	["BgsPause", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 0
		, description: ["暂停BGS"]
		, type: []
	}],
	["BgsResume", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 0
		, description: ["恢复BGS"]
		, type: []
	}],

	["BgsFadeOut", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 1
		, description: ["\t@BgsFadeOut=fadeSpeed"
			, "淡出BGS"
			, "淡入淡出速度为持续毫秒数，等待淡入淡出属于强制等待"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.FadeSpeed]
	}],

	["Dub", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 3
		, description: ["\t@Dub=FileName:KeepSeq:KeepNTK"
			, "\t@DubPlay=FileName:KeepSeq:KeepNTK"
			, "更新语音内容，该语音会在显示下一句文本时播放。`KeepSeq`为真时，不会自动禁用语音序列，`KeepNTK`为真时，不会递增指针"]
		, type: [ParamType.File, ParamType.Boolean, ParamType.Boolean]
		, inlayHintType: [InlayHintType.DubFileName, InlayHintType.KeepSeq, InlayHintType.KeepNTK]
	}],
	["DubPlay", undefined],

	["DubSeque", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 0
		, description: ["启用语音序列，默认启用"
			, "变更`NowTalking`后会自动启用语音序列"
			, "使用`DubPlay`指令后会自动禁用语音序列"]
		, type: []
	}],
	["DubSequeOff", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 0
		, description: ["禁用语音序列，默认启用"
			, "变更`NowTalking`后会自动启用语音序列"
			, "使用`DubPlay`指令后会自动禁用语音序列"]
		, type: []
	}],
	["DubSequePrefix", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 1
		, description: ["\t@DubSequePrefix=Prefix"
			, "更新`DubSequePrefix`，将会更新`语音文件名`为`DubSequePrefix_NowTalking`"
			, "若`DubSequePrefix`为空，则`语音文件名`为`NowTalking`，无下划线"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.DubSequePrefix]
	}],
	["DubChapter", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 1
		, description: ["\t@DubChapter=ChapterName"
			, "更新`DubChapter`，默认为当前章节名"
			, "在调试外部文件时，可以使用该指令调用正确的语音文件"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.DubChapterName]
	}],
	["Ntk", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 2
		, description: ["\t@NTK=NowTalking:KeepSeq"
			, "\t@NTKChange=NowTalking:KeepSeq"
			, "变更`NowTalking`的值，并且在下一句语音开始播放对应的语音文件，`NowTalking`默认从0开始。`KeepSeq`为真时，不会自动启用语音序列"]
		, type: [ParamType.Number, ParamType.Boolean]
		, inlayHintType: [InlayHintType.NowTalking, InlayHintType.KeepSeq]
	}],
	["NtkChange", undefined],

	["SeparateNTKChange", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 2, maxParam: 3
		, description: ["\t@SeparateNTKChange=CharName:NowTalking:KeepSeq"
			, "变更角色`NowTalking`的值，并且在下一句语音开始播放对应的语音文件，`NowTalking`默认从0开始。`KeepSeq`为真时，不会自动启用语音序列"
			, "未启用`SeparateDubID`时，该指令依旧有效，但向未记录过登场角色的变更不会被保存。为下一行文本中的首次登场角色使用该指令是安全的"]
		, type: [ParamType.String, ParamType.Number, ParamType.Boolean]
		, inlayHintType: [InlayHintType.CharName, InlayHintType.NowTalking, InlayHintType.KeepSeq]
	}],

	["PV", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 2
		, description: ["\t@PV=FileName.AVI:StartPos"
			, "\t@PlayVideo=FileName.AVI:StartPos"
			, "最基本的也是最简单的指令，从`StartPos`开始播放`FileName.AVI`，单位毫秒，等价于以下指令组合"
			, "\t@OpenVideo=FileName.AVI:StartPos"
			, "\t@VideoResume"]
		, type: [ParamType.File, ParamType.Number]
		, inlayHintType: [InlayHintType.VideoFileName, InlayHintType.StartPoint]
	}],
	["PlayVideo", undefined],
	["ChangeVideo", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 1
		, description: ["\t@ChangeVideo=FileName.AVI"
			, "切换视频，新打开的视频会自动切换至当前视频的进度，用于无缝切换差分视频"
			, "若当前正在播放视频，则该指令转义为:"
			, "\t@PlayVideo=FileName.AVI:CurrentVideoPosition"
			, "否则转义为:"
			, "\t@OpenVideo=FileName.AVI:CurrentVideoPosition"
			, "视频的循环状态和循环叠化会被保留"]
		, type: [ParamType.File]
		, inlayHintType: [InlayHintType.VideoFileName]
	}],
	["OV", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 2
		, description: ["\t@OV=FileName.AVI:StartPos"
			, "\t@OpenVideo=FileName.AVI:StartPos"
			, "打开视频至`StartPos`，但并不播放，需要播放时请使用`@VideoResume`"
			, "若已经打开了视频，会抓取旧视频的当前帧作为CG进行过渡，否则则抓取新视频的首帧作为CG进行过渡"]
		, type: [ParamType.File, ParamType.Number]
		, inlayHintType: [InlayHintType.VideoFileName, InlayHintType.StartPoint]
	}],
	["OpenVideo", undefined],
	["CV", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 0
		, description: ["抓取当前帧作为CG，并关闭视频"]
		, type: []
	}],
	["CloseVideo", undefined],
	["CloseVideo_Core", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 0
		, description: ["不考虑当前情况与过渡直接关闭视频，用于历史记录跳转等场合"]
		, type: []
		, internal: true
	}],
	["VideoCodec", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 2
		, description: ["\t`@VideoCodec=Video:Audio`"
			, "指定视频文件所使用的编解码器，例如使用`libvpx-vp9`以支持`webm`视频的透明通道"
			, "若指定的解码器无法打开视频，会自动尝试使用默认参数打开"
			, "参数留空则重置为默认"]
		, type: [ParamType.String, ParamType.String]
		, required: [
			[
				"aasc",
				"aic",
				"alias_pix",
				"agm",
				"amv",
				"anm",
				"ansi",
				"apng",
				"arbc",
				"argo",
				"asv1",
				"asv2",
				"aura",
				"aura2",
				"avrp",
				"avrn",
				"avs",
				"avui",
				"ayuv",
				"bethsoftvid",
				"bfi",
				"binkvideo",
				"bitpacked",
				"bmp",
				"bmv_video",
				"brender_pix",
				"c93",
				"cavs",
				"cdgraphics",
				"cdtoons",
				"cdxl",
				"cfhd",
				"cinepak",
				"clearvideo",
				"cljr",
				"cllc",
				"cpia",
				"cri",
				"camstudio",
				"cyuv",
				"dds",
				"dfa",
				"dirac",
				"dnxhd",
				"dpx",
				"dsicinvideo",
				"dvvideo",
				"dxa",
				"dxtory",
				"dxv",
				"eacmv",
				"eamad",
				"eatgq",
				"eatgv",
				"eatqi",
				"8bps",
				"escape124",
				"escape130",
				"exr",
				"ffv1",
				"ffvhuff",
				"fic",
				"fits",
				"flashsv",
				"flashsv2",
				"flic",
				"flv",
				"fmvc",
				"4xm",
				"fraps",
				"frwu",
				"g2m",
				"gdv",
				"gem",
				"gif",
				"h261",
				"h263",
				"h263i",
				"h263p",
				"h264",
				"h264_qsv",
				"hap",
				"hevc",
				"hevc_qsv",
				"hnm4video",
				"hq_hqa",
				"hqx",
				"huffyuv",
				"hymt",
				"idcinvideo",
				"iff",
				"imm4",
				"imm5",
				"indeo2",
				"indeo3",
				"indeo4",
				"indeo5",
				"interplayvideo",
				"ipu",
				"jpeg2000",
				"jpegls",
				"jv",
				"kgv1",
				"kmvc",
				"lagarith",
				"loco",
				"lscr",
				"m101",
				"magicyuv",
				"mdec",
				"mimic",
				"mjpeg",
				"mjpegb",
				"mmvideo",
				"mobiclip",
				"motionpixels",
				"mpeg1video",
				"mpeg2video",
				"mpeg4",
				"mpegvideo",
				"mpeg2_qsv",
				"msa1",
				"mscc",
				"msmpeg4v1",
				"msmpeg4v2",
				"msmpeg4",
				"msp2",
				"msrle",
				"mss1",
				"mss2",
				"msvideo1",
				"mszh",
				"mts2",
				"mv30",
				"mvc1",
				"mvc2",
				"mvdv",
				"mvha",
				"mwsc",
				"mxpeg",
				"notchlc",
				"nuv",
				"paf_video",
				"pam",
				"pbm",
				"pcx",
				"pfm",
				"pgm",
				"pgmyuv",
				"pgx",
				"phm",
				"photocd",
				"pictor",
				"pixlet",
				"png",
				"ppm",
				"prores",
				"prosumer",
				"psd",
				"ptx",
				"qdraw",
				"qoi",
				"qpeg",
				"qtrle",
				"r10k",
				"r210",
				"rasc",
				"rawvideo",
				"rl2",
				"roqvideo",
				"rpza",
				"rscc",
				"rv10",
				"rv20",
				"rv30",
				"rv40",
				"sanm",
				"scpr",
				"screenpresso",
				"sga",
				"sgi",
				"sgirle",
				"sheervideo",
				"simbiosis_imx",
				"smackvid",
				"smc",
				"smvjpeg",
				"snow",
				"sp5x",
				"speedhq",
				"srgc",
				"sunrast",
				"svq1",
				"svq3",
				"targa",
				"targa_y216",
				"tdsc",
				"theora",
				"thp",
				"tiertexseqvideo",
				"tiff",
				"tmv",
				"truemotion1",
				"truemotion2",
				"truemotion2rt",
				"camtasia",
				"tscc2",
				"txd",
				"ultimotion",
				"utvideo",
				"v210",
				"v210x",
				"v308",
				"v408",
				"v410",
				"vb",
				"vbn",
				"vble",
				"vc1",
				"vc1image",
				"vc1_qsv",
				"vcr1",
				"vmdvideo",
				"vmnc",
				"vp3",
				"vp4",
				"vp5",
				"vp6",
				"vp6a",
				"vp6f",
				"vp7",
				"vp8",
				"vp9",
				"vqavideo",
				"webp",
				"wcmv",
				"wrapped_avframe",
				"wmv1",
				"wmv2",
				"wmv3",
				"wmv3image",
				"wnv1",
				"xan_wc3",
				"xan_wc4",
				"xbm",
				"xface",
				"xl",
				"xpm",
				"xwd",
				"y41p",
				"ylc",
				"yop",
				"yuv4",
				"012v",
				"zerocodec",
				"zlib",
				"zmbv",
				"libdav1d",
				"libjxl",
				"libopenjpeg",
				"libvpx",
				"libvpx-vp9",
				"bintext",
				"xbin",
				"idf",
				"libaom-av1",
				"av1",
				"av1_cuvid",
				"av1_qsv",
				"libopenh264",
				"h264_cuvid",
				"hevc_cuvid",
				"mjpeg_cuvid",
				"mjpeg_qsv",
				"mpeg1_cuvid",
				"mpeg2_cuvid",
				"mpeg4_cuvid",
				"vc1_cuvid",
				"vp8_cuvid",
				"vp8_qsv",
				"vp9_cuvid",
				"vp9_qsv",
			],
			[
				"comfortnoise",
				"dvaudio",
				"8svx_exp",
				"8svx_fib",
				"s302m",
				"speex",
				"aac",
				"aac_fixed",
				"aac_latm",
				"ac3",
				"ac3_fixed",
				"acelp.kelvin",
				"alac",
				"als",
				"amrnb",
				"amrwb",
				"ape",
				"aptx",
				"aptx_hd",
				"atrac1",
				"atrac3",
				"atrac3al",
				"atrac3plus",
				"atrac3plusal",
				"atrac9",
				"binkaudio_dct",
				"binkaudio_rdft",
				"bmv_audio",
				"cook",
				"dca",
				"dfpwm",
				"dolby_e",
				"dsd_lsbf",
				"dsd_msbf",
				"dsd_lsbf_planar",
				"dsd_msbf_planar",
				"dsicinaudio",
				"dss_sp",
				"dst",
				"eac3",
				"evrc",
				"fastaudio",
				"wavesynth",
				"flac",
				"g723_1",
				"g729",
				"gsm",
				"gsm_ms",
				"hca",
				"hcom",
				"iac",
				"ilbc",
				"imc",
				"interplayacm",
				"mace3",
				"mace6",
				"metasound",
				"mlp",
				"mp1",
				"mp1float",
				"mp2",
				"mp2float",
				"mp3float",
				"mp3",
				"mp3adufloat",
				"mp3adu",
				"mp3on4float",
				"mp3on4",
				"mpc7",
				"mpc8",
				"msnsiren",
				"nellymoser",
				"on2avc",
				"opus",
				"paf_audio",
				"qcelp",
				"qdm2",
				"qdmc",
				"real_144",
				"real_288",
				"ralf",
				"sbc",
				"shorten",
				"sipr",
				"siren",
				"smackaud",
				"sonic",
				"tak",
				"truehd",
				"truespeech",
				"tta",
				"twinvq",
				"vmdaudio",
				"vorbis",
				"wavpack",
				"wmalossless",
				"wmapro",
				"wmav1",
				"wmav2",
				"wmavoice",
				"ws_snd1",
				"xma1",
				"xma2",
				"pcm_alaw",
				"pcm_bluray",
				"pcm_dvd",
				"pcm_f16le",
				"pcm_f24le",
				"pcm_f32be",
				"pcm_f32le",
				"pcm_f64be",
				"pcm_f64le",
				"pcm_lxf",
				"pcm_mulaw",
				"pcm_s8",
				"pcm_s8_planar",
				"pcm_s16be",
				"pcm_s16be_planar",
				"pcm_s16le",
				"pcm_s16le_planar",
				"pcm_s24be",
				"pcm_s24daud",
				"pcm_s24le",
				"pcm_s24le_planar",
				"pcm_s32be",
				"pcm_s32le",
				"pcm_s32le_planar",
				"pcm_s64be",
				"pcm_s64le",
				"pcm_sga",
				"pcm_u8",
				"pcm_u16be",
				"pcm_u16le",
				"pcm_u24be",
				"pcm_u24le",
				"pcm_u32be",
				"pcm_u32le",
				"pcm_vidc",
				"derf_dpcm",
				"gremlin_dpcm",
				"interplay_dpcm",
				"roq_dpcm",
				"sdx2_dpcm",
				"sol_dpcm",
				"xan_dpcm",
				"adpcm_4xm",
				"adpcm_adx",
				"adpcm_afc",
				"adpcm_agm",
				"adpcm_aica",
				"adpcm_argo",
				"adpcm_ct",
				"adpcm_dtk",
				"adpcm_ea",
				"adpcm_ea_maxis_xa",
				"adpcm_ea_r1",
				"adpcm_ea_r2",
				"adpcm_ea_r3",
				"adpcm_ea_xas",
				"g722",
				"g726",
				"g726le",
				"adpcm_ima_acorn",
				"adpcm_ima_amv",
				"adpcm_ima_alp",
				"adpcm_ima_apc",
				"adpcm_ima_apm",
				"adpcm_ima_cunning",
				"adpcm_ima_dat4",
				"adpcm_ima_dk3",
				"adpcm_ima_dk4",
				"adpcm_ima_ea_eacs",
				"adpcm_ima_ea_sead",
				"adpcm_ima_iss",
				"adpcm_ima_moflex",
				"adpcm_ima_mtf",
				"adpcm_ima_oki",
				"adpcm_ima_qt",
				"adpcm_ima_rad",
				"adpcm_ima_ssi",
				"adpcm_ima_smjpeg",
				"adpcm_ima_wav",
				"adpcm_ima_ws",
				"adpcm_ms",
				"adpcm_mtaf",
				"adpcm_psx",
				"adpcm_sbpro_2",
				"adpcm_sbpro_3",
				"adpcm_sbpro_4",
				"adpcm_swf",
				"adpcm_thp",
				"adpcm_thp_le",
				"adpcm_vima",
				"adpcm_xa",
				"adpcm_yamaha",
				"adpcm_zork",
				"libopencore_amrnb",
				"libopencore_amrwb",
				"libopus",
				"libvorbis",
			]
		]
		, inlayHintType: [InlayHintType.VideoCodec, InlayHintType.AudioCodec]
	}],
	["VR", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 0
		, description: ["继续播放视频"]
		, type: []
	}],
	["VideoResume", undefined],
	["VP", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 0
		, description: ["暂停视频"]
		, type: []
	}],
	["VideoPause", undefined],
	["VW", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 1
		, description: ["\t@VideoWait=AllowSkip"
			, "当前视频播放结束后才会进入下一阶段"
			, "若`AllowSkip=1`，则允许在视频播放中按任意键跳过"]
		, type: [ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.LoopTransition]
	}],
	["VideoWait", undefined],
	["VL", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 1
		, description: ["\t@VL=LoopTransition"
			, "\t@VideoLoop=LoopTransition"
			, "设定当前视频循环播放，若`LoopTransition = 1`，则会在循环结束时叠化至视频开头，适用于视频本身非无缝循环的场合"]
		, type: [ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.LoopTransition]
	}],
	["VideoLoop", undefined],
	["VideoFinish", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 1
		, description: ["\t@VideoFinish=CommandToExecute"
			, "在视频播放结束后调用`#Eval=CommandToExecute`以执行特定命令"]
		, type: [ParamType.String]
		, inlayHintType: [InlayHintType.CommandToEval]
		, treatAsOneParam: true
	}],
	["SVP", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 1
		, description: ["\t@SVP=StartPos"
			, "\t@SetVideoPos=StartPos"
			, "设置视频位置"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.StartPoint]
	}],
	["SetVideoPos", undefined],
	["IgnoreStaticVideo", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 1
		, description: ["\t@IgnoreStaticVideo=On/Off"
			, "忽略设置中的`StaticVideo`"
			, "不影响使用替换表达式获取设置中`StaticVideo`的值"]
		, type: [ParamType.Boolean]
		, inlayHintType: [InlayHintType.Boolean]
	}],
	["VideoCache", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 1, maxParam: 1
		, description: ["\t@VideoCache=FilePath"
			, "缓存视频，用于节省读取加密视频的用时。非加密视频会直接读取磁盘，因此无需缓存"
			, "若运行于非加密模式或若视频已被缓存，则不会执行任何操作"]
		, type: [ParamType.File]
		, inlayHintType: [InlayHintType.VideoFileName]
	}],
	["VideoErase", {
		prefix: "@"
		, keywordType: KeywordType.Media
		, minParam: 0, maxParam: 1
		, description: ["\t@VideoErase=FilePath"
			, "清除已缓存的视频，若不指定`FilePath`，则会清除所有缓存的视频"
			, "当前正在被使用的视频不会被清除"]
		, type: [ParamType.File]
		, inlayHintType: [InlayHintType.VideoFileName]
	}],

	//-----------------
	// keywords_effect
	//-----------------

	["CreateBlur", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["创建带有背景模糊的景深对象，对象保存至景深堆栈，默认ID从`-100`开始递减"
			, "该指令创建的景深对象位于演出对象最下方"]
		, type: []
	}],
	["AddBlur", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@AddBlur=Num"
			, "`@AddBlur`会转译为`Num`个`@CreateBlur`指令，创建结束的景深对象默认位于演出对象最下方。`Num`数值越大，模糊效果越强，留空默认为1"
			, "可使用`@Order`指令控制景深对象次序，使用`@CharAllDispose`指令不会销毁景深对象。请勿使用`@CharDispose`指令销毁，该方法会破坏景深堆栈指针"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.Num]
	}],
	["RemoveBlur", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@RemoveBlur=Num"
			, "`@RemoveBlur`会转译为`Num`个`@DestroyBlur`指令，欲销毁全部景深对象，请将`Num`设定为一个较大的数，如`255`，实际指令转译最大只会进行当前景深对象数(即景深堆栈深度)次"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.Num]
	}],
	["DestroyBlur", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["移除景深堆栈最上方的景深对象"]
		, type: []
	}],
	["BackZoomParam", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 2, maxParam: 2
		, description: ["\t@BackZoomParam=Easing_FuncA:Easing_FuncB"
			, "指定进行缩放时的Easing参数"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.Easing_FuncA, InlayHintType.Easing_FuncB]
	}],
	["BackZoomReset", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 3
		, description: ["\t@BackZoomReset=Speed:Instant:ForceWait"
			, "按当前参数重置缩放，转译为指令`@BackZoom=0:0:ResolutionX:ResolutionY:Speed:Instant:ForceWait`，在真实坐标模式下执行"]
		, type: [ParamType.Number, ParamType.ZeroOne, ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.Speed, InlayHintType.Instant, InlayHintType.CrossState]
	}],
	["BackZoom", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 5, maxParam: 7
		, description: ["\t@BackZoom=X:Y:width:height:Speed:Instant:ForceWait"
			, "缩放到大小为`(width,height)`，区域中心坐标`(x,y)`指定缩放速度以及是否立即缩放"
			, "`ForceWait`参数为`0/1`，`0`表示默认在阶段二进行变化，`1`表示跨阶段变化"]
		, type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.ZeroOne, ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.X, InlayHintType.Y, InlayHintType.Width, InlayHintType.Height, InlayHintType.Speed, InlayHintType.Instant, InlayHintType.CrossState]
	}],
	["ShakeDir", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@ShakeDir=Dir"
			, "设置震动方向，`X=0`，`Y=1`"]
		, type: [ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.Dir]
	}],
	["ShakeCoef", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@ShakeCoef=Strength"
			, "设置震动强度"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.Strength]
	}],
	["ShakeAttenuation", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@ShakeAttenuation=On"
			, "设置震动幅度衰减，仅适用于模式0"]
		, type: [ParamType.Boolean]
		, inlayHintType: [InlayHintType.Boolean]
	}],
	["ShakeAttenuationParam", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 2, maxParam: 2
		, description: ["\t@ShakeAttenuationParam=FuncA:FuncB"
			, "设置震动衰减Easing参数"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.Easing_FuncA, InlayHintType.Easing_FuncA]
	}],
	["Shake", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["震动一定时长后停止震动，单位为帧，通常情况下设定为60代表震动一秒"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.Duration]
	}],
	["KeepShake", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["持续震动"]
		, type: []
	}],
	["KeepShakeOff", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["停止震动"]
		, type: []
	}],
	["Fade", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["创建淡入淡出叠化效果，会被转译为`@PatternFade`"]
		, type: []
	}],
	["DestroyFade", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["消除之前创建的所有叠化效果，会被转译为`@PatternFadeOut`"]
		, type: []
	}],

	["PF", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 2
		, description: ["\t@PF=PicName:Orderable"
			, "\t@PatternFade=PicName:Orderable"
			, "创建`Pattern`过渡元件，使用`pattern fade`读取`PicName`图像叠化进入"]
		, type: [ParamType.File, ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.PatternFadeFileName, InlayHintType.Orderable]
	}],
	["PatternFade", undefined],
	["PFO", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 2
		, description: ["\t@PFO=PicName"
			, "\t@PatternFadeOut=PicName:Orderable"
			, "使用`PatternFade`读取`PicName`图像叠化退出使用`PatternFade`创建的对象，具有`Orderable`属性的对象可参与排序"
			, "该指令运行结束后会自动销毁该Pattern过渡元件"]
		, type: [ParamType.File, ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.PatternFadeFileName, InlayHintType.Orderable]
	}],
	["PatternFadeOut", undefined],

	["Rain", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["立即创建下雨效果，允许连续使用"]
		, type: []
	}],
	["Snow", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["立即创建下雪效果，允许连续使用"]
		, type: []
	}],
	["Normal", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["立即取消天气效果，允许连续使用"]
		, type: []
	}],
	["ToRain", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["逐渐创建下雨效果，不会在过渡状态2等待，不受到强制等待指令控制"]
		, type: []
	}],
	["ToSnow", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["逐渐创建下雪效果，不会在过渡状态2等待，不受到强制等待指令控制"]
		, type: []
	}],
	["ToNormal", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 0
		, description: ["逐渐取消天气效果，不会在过渡状态2等待，不受到强制等待指令控制"]
		, type: []
	}],

	["CrossFade", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@CrossFade=ID"
			, "为该对象下次叠化启用交错模式"
			, "ID留空，程序会尝试捕获最新调用叠化指令的对象，在叠化完成后，CrossFade会自动禁用"
			, "在叠化阶段开始指令前(等待/强制等待/文本)使用指令均有效，但从可读性角度建议写于相应叠化指令后"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.ID]
	}],

	["KeepRes", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@KeepRes=ID"
			, "\t@KeepResolution=ID"
			, "该ID对应的对象会在叠化时保持当前设定的分辨率"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.ID]
	}],
	["KeepResolution", undefined],

	["KeepResOff", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@KeepResOff=ID"
			, "\t@KeepResolutionOff=ID"
			, "该ID对应的对象会在叠化时重设分辨率为新图像的分辨率"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.ID]
	}],
	["KeepResolutionOff", undefined],

	["Sepia", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 0, maxParam: 3
		, description: ["\t@Sepia=Strength:NoiseMotion:Period"
			, "\t@SepiaToning=Strength:NoiseMotion:Period"
			, "创建强度为`Strength`的`Sepia Toning`对象，对象默认ID为`-5`。其中`Strength`应为一个`[0,1]`的浮点数，默认值为`0.5`，`NoiseMotion`参数控制噪声运动的开启与关闭，当设定为`1`或`On`的时候会启用噪声运动，运动周期为`Period`，单位毫秒，默认值为`-1`，即每帧更新。已经创建了`Sepia Toning`对象后调用该指令，该指令无效"]
		, type: [ParamType.Number, ParamType.Boolean, ParamType.Number]
		, inlayHintType: [InlayHintType.Strength, InlayHintType.Boolean, InlayHintType.Period]
	}],
	["SepiaToning", undefined],
	["ChangeSepiaStrength", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@ChangeSepiaStrength=Strength"
			, "在演出执行阶段改变`Sepia Toning`对象的`Strength`，参数留空会将`Strength`设定为默认值`0.5`"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.Strength]
	}],
	["SetSepiaNoiseMotion", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@SetSepiaNoiseMotion=On/Off"
			, "控制噪声运动的开启与关闭，设定为`1`或`On`时启用噪声运动，设定为`0`或`Off`时禁用噪声运动，参数为空会Toggle当前启用状态"]
		, type: [ParamType.Boolean]
		, inlayHintType: [InlayHintType.Boolean]
	}],
	["ChangeSepiaNoiseMotionPeriod", {
		prefix: "@"
		, keywordType: KeywordType.Effect
		, minParam: 1, maxParam: 1
		, description: ["\t@ChangeSepiaNoiseMotionPeriod=Period"
			, "将噪声运动的运动周期设定为`Period`，单位毫秒，参数为空会将`Period`设定为默认值`-1`，一个典型的参考值为`300`毫秒"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.Period]
	}],

	//-----------------
	// keywords_preobj
	//-----------------

	["StrCenter", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 0, maxParam: 0
		, description: ["定义坐标参数留空时字符串的默认位置，该指令后创建的字符串默认居中"]
		, type: []
	}],
	["StrBottom", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 0, maxParam: 0
		, description: ["定义坐标参数留空时字符串的默认位置，该指令后创建的字符串默认底部居中"]
		, type: []
	}],
	["Str", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 11
		, description: ["\t@Str=string:ID:TypeEffect:Alpha:x:y:size:font:R:G:B"
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
		, inlayHintType: [InlayHintType.String, InlayHintType.ID, InlayHintType.TypeEffect, InlayHintType.Alpha, InlayHintType.X, InlayHintType.Y, InlayHintType.Size, InlayHintType.Font, InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["String", undefined],
	["CreateStr", undefined],
	["CreateString", undefined],

	["StrS", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@StrS=ID:Size"
			, "\t@StrSize=ID:Size"
			, "无叠化，更改字符串字号"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Size]
	}],
	["StrSize", undefined],
	["StrF", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@StrF=ID:Font"
			, "\t@StrFont=ID:Font"
			, "无叠化，更改字符串字体"]
		, type: [ParamType.Number, ParamType.String]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Font]
	}],
	["StrFont", undefined],
	["StrA", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@StrA=ID:120"
			, "\t@StrAlpha=ID:120"
			, "切换对象到指定的不透明度"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Alpha]
	}],
	["StrAlpha", undefined],

	["StrC", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 4
		, description: ["\t@StrC=ID:R:G:B"
			, "\t@StrC=ID:#FFFFFF"
			, "\t@StrColor=ID:R:G:B"
			, "\t@StrColor=ID:#FFFFFF"
			, "无叠化，更改字符串颜色"]
		, type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ID, InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["StrColor", undefined],

	["StrShaderOn", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 3, maxParam: 5
		, description: ["\t@StrShaderOn=ID:OutlinePixel:R:G:B"
			, "\t@StrShaderOn=ID:OutlinePixel:#FFFFFF"
			, "启用字符串勾边，勾边颜色为`RGB/#FFFFFF`，勾边像素数为`OutlinePixel`"]
		, type: [ParamType.Number, ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ID, InlayHintType.OutlinePixel, InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["StrShaderOff", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["关闭字符串勾边效果"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.ID]
	}],

	["StrOutColor", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 4
		, description: ["\t@StrOutColor=ID:R:G:B"
			, "\t@StrOutColor=ID:#FFFFFF"
			, "启用勾边时，更改字符串勾边颜色为`RGB/#FFFFFF`"]
		, type: [ParamType.Number, ParamType.Color, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ID, InlayHintType.ColorHex, InlayHintType.ColorRGB_G, InlayHintType.ColorRGB_B]
	}],
	["StrOutPixel", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@StrOutPixel=ID:OutlinePixel"
			, "启用勾边时，更改字符串勾边像素数为`OutlinePixel`"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ID, InlayHintType.OutlinePixel]
	}],
	["StrShadow", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["\t@StrShadow=ID:On/Off"
			, "打开或关闭阴影模式，该模式仅在描边启用时有效"]
		, type: [ParamType.Number, ParamType.ZeroOne]
		, inlayHintType: [InlayHintType.ID, InlayHintType.ShadowMode]
	}],

	["MS", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 3, maxParam: 7
		, description: ["\t@MS=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
			, "\t@MoveStr=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
			, "移动字符串对象，具体参数说明请参见`@MoveObj`一节，坐标受`@StrCenter`参数影响"]
		, type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
		, required: [
			undefined,
			undefined,
			undefined,
			undefined,
			easing_inlayHintAddition_funcName,
			easing_inlayHintAddition_funcName,
			easing_inlayHintAddition_modeName
		]
		, inlayHintType: [InlayHintType.ID, InlayHintType.X, InlayHintType.Y, InlayHintType.Time, InlayHintType.Easing_FuncA, InlayHintType.Easing_FuncB, InlayHintType.Mode]
		, inlayHintAddition: [
			undefined,
			undefined,
			undefined,
			undefined,
			easing_inlayHintAddition_funcNameMap,
			easing_inlayHintAddition_funcNameMap,
			easing_inlayHintAddition_modeNameMap,
		]
	}],
	["MoveStr", undefined],
	["DestroyStr", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["\t@DestroyStr=ID"
			, "\t@DestroyString=ID"
			, "销毁字符串"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.ID]
	}],
	["DestroyString", undefined],

	["DestroyAllStr", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 0, maxParam: 0
		, description: ["销毁全部字符串对象"]
		, type: []
	}],
	["DestroyAllString", undefined],

	["Spe", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["该指令在调用前会在引擎内部更新`CoefStr`、`FolderStr`参数，定义转译后指令的文件路径、参数。**该指令为内部指令，请避免在脚本中使用。**"
			, "以使用内部指令`@Spe=dialog2.png`创建对话框为例"
			, "指令会被转译为`@Char=FolderStr+dialog2.png+CoefStr`，执行后更新相应参数"]
		, type: [ParamType.File]
		, inlayHintType: [InlayHintType.FileName]
		, internal: true
	}],

	["MO", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 3, maxParam: 7
		, description: ["\t@MO=FixedValue:TarX:TarY:Time:FuncA:FuncB:Mode"
			, "\t@MoveObj=FixedValue:TarX:TarY:Time:FuncA:FuncB:Mode"
			, "内部指令，`@MoveChar`与@`MoveStr`会被引擎转译为该指令执行"]
		, type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
		, required: [
			undefined,
			undefined,
			undefined,
			undefined,
			easing_inlayHintAddition_funcName,
			easing_inlayHintAddition_funcName,
			easing_inlayHintAddition_modeName
		]
		, inlayHintType: [InlayHintType.FixedValue, InlayHintType.X, InlayHintType.Y, InlayHintType.Time, InlayHintType.Easing_FuncA, InlayHintType.Easing_FuncB, InlayHintType.Mode]
		, inlayHintAddition: [
			undefined,
			undefined,
			undefined,
			undefined,
			easing_inlayHintAddition_funcNameMap,
			easing_inlayHintAddition_funcNameMap,
			easing_inlayHintAddition_modeNameMap,
		]
		, internal: true
	}],
	["MoveObj", undefined],

	["Bottom", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["\t@Bottom=filename.png"
			, "切换底板，叠化阶段进行"
		]
		, type: [ParamType.File]
		, inlayHintType: [InlayHintType.CGFileName]
	}],
	["CG", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["\t@CG=filename.png"
			, "\t@CGChange=filename.png"
			, "切换CG，叠化阶段进行"
			, "由于视频指令会在特定时刻更新CG，故该指令会在视频打开时调用`@CloseVideo_Core`关闭视频，避免两者冲突"]
		, type: [ParamType.File]
		, inlayHintType: [InlayHintType.CGFileName]
	}],
	["CGChange", undefined],

	["CPF", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 3, maxParam: 3
		, description: ["\t@CPF=PicName:PatternName:ID"
			, "\t@CPatternFade=PicName:PatternName:ID"
			, "\t@CharPF=PicName:PatternName:ID"
			, "\t@CharPatternFade=PicName:PatternName:ID"
			, "读取贴图，前景背景同时叠化"
			, "不建议进行差分和不同对象的切换，而是将当前图像切换至透明图像来实现进场和退场效果"]
		, type: [ParamType.File, ParamType.File, ParamType.Number]
		, inlayHintType: [InlayHintType.CharacterFileName, InlayHintType.PatternFadeFileName, InlayHintType.ID]
	}],
	["CPatternFade", undefined],
	["CharPF", undefined],
	["CharPatternFade", undefined],
	["CPFI", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 3, maxParam: 3
		, description: ["\t@CPFI=PicName:PatternName:ID"
			, "\t@CPatternFadeIn=PicName:PatternName:ID"
			, "读取贴图，叠化至前景图像"]
		, type: [ParamType.File, ParamType.File, ParamType.Number]
		, inlayHintType: [InlayHintType.CharacterFileName, InlayHintType.PatternFadeFileName, InlayHintType.ID]
	}],
	["CPatternFadeIn", undefined],
	["CPFO", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 3, maxParam: 3
		, description: ["\t@CPFO=PicName:PatternName:ID"
			, "\t@CPatternFadeOut=PicName:PatternName:ID"
			, "读取贴图，叠化至背景图像"]
		, type: [ParamType.File, ParamType.File, ParamType.Number]
		, inlayHintType: [InlayHintType.CharacterFileName, InlayHintType.PatternFadeFileName, InlayHintType.ID]
	}],
	["CPatternFadeOut", undefined],
	["CGPFI", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@CGPFI=PicName:PatternName"
			, "\t@CGPatternFadeIn=PicName:PatternName"
			, "转译`@CPFI`，读取贴图，CG叠化至前景图像"]
		, type: [ParamType.File, ParamType.File]
		, inlayHintType: [InlayHintType.CGFileName, InlayHintType.PatternFadeFileName, InlayHintType.ID]
	}],
	["CGPatternFadeIn", undefined],

	["CGPFO", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@CGPFO=PicName:PatternName"
			, "\t@CGPatternFadeOut=PicName:PatternName"
			, "转译`@CPFO`，读取贴图，CG叠化至背景图像"]
		, type: [ParamType.File, ParamType.File]
		, inlayHintType: [InlayHintType.CGFileName, InlayHintType.PatternFadeFileName, InlayHintType.ID]
	}],
	["CGPatternFadeOut", undefined],

	["Char", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 7
		, description: ["\t@Char=filename.png:ID:Alpha:X:Y:Width:Height"
			, "\t@Character=filename.png:ID:Alpha:X:Y:Width:Height"
			, "该指令用于创建图像：留空文件后缀名时，会默认图片格式为PNG；不透明度范围为0~255；文件名支持使用../返回上级路径；坐标系以画面中央底部为原点；坐标以图像中央底部为热点；长宽默认为图片原始尺寸，使用+/-指定增量时，会以原始尺寸为基础进行计算"]
		, type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.CharacterFileName, InlayHintType.ID, InlayHintType.Alpha, InlayHintType.X, InlayHintType.Y, InlayHintType.Width, InlayHintType.Height]
	}],
	["Character", undefined],

	["CC", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 5
		, description: ["\t@CC=filename:ID:alpha:width:height"
			, "\t@CharChange=filename:ID:alpha:width:height"
			, "该指令用于切换为其他角色或动作：留空文件后缀名时，会默认图片格式为PNG；不透明度范围为0~255，该指令会重置`@CharAlpha`设定的不透明度；文件名支持使用../返回上级路径"
			, "交错模式：通常来说，切换角色时应启用交错模式，更改长宽比时，会自动切换为交错模式"
			, "长宽：默认为新图片原始尺寸，使用+/-指定增量时，会以原始尺寸为基础进行计算"]
		, type: [ParamType.File, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.CharacterFileName, InlayHintType.ID, InlayHintType.Alpha, InlayHintType.Width, InlayHintType.Height]
	}],
	["CharChange", undefined],

	["CA", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@CA=ID:Alpha"
			, "\t@CharAlpha=ID:Alpha"
			, "切换对象到指定的不透明度"]
		, type: [ParamType.Number, ParamType.Number,]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Alpha]
	}],
	["CharAlpha", undefined],
	["HideChar", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["\t@HideChar=ID"
			, "若`PreviousAlpha = -1`，记忆当前的目标不透明度，并执行"
			, "\t@CharAlpha=ID:255"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.ID]
	}],
	["HideAllChar", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 0, maxParam: 0
		, description: ["为所有未隐藏的图像对象执行"
			, "\t@HideChar=ID"]
		, type: []
		, inlayHintType: []
	}],
	["ShowChar", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["@ShowChar=ID"
			, "执行"
			, "\t@CharAlpha=ID:PreviousAlpha"
			, "还原已隐藏的图像对象的目标不透明度，并重置`PreviousAlpha = -1`"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.ID]
	}],
	["ShowAllChar", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 0, maxParam: 0
		, description: ["为所有隐藏的图像对象执行"
			, "\t@ShowChar=ID"]
		, type: []
		, inlayHintType: []
	}],
	["CharRotate", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 4, maxParam: 4
		, description: ["\t@CharRotate=ID:angle:clockwise:CircleCount"
			, "旋转对象至目标角度与预定圈数，`clockwise = 1`为顺时针，`clockwise = -1`为逆时针"
			, "若目标角度设定为360度，旋转0圈，将持续旋转"
			, "该指令不可与立绘叠化同时使用"]
		, type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Angle, InlayHintType.Clockwise, InlayHintType.CircleCount]
	}],
	["AttachShader", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 34
		, description: ["\t@AttachShader=ID:ShaderName:Param1:Param2:..."
			, "为非特效图像附加Shader，依照类型顺序指定参数"]
		, type: [ParamType.Number, ParamType.String
			, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
			, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
			, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
			, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
			, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
			, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
			, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any
			, ParamType.Any, ParamType.Any, ParamType.Any, ParamType.Any]
		, inlayHintType: [InlayHintType.ID, InlayHintType.ShaderName
			, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam
			, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam
			, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam
			, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam
			, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam
			, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam
			, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam
			, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam, InlayHintType.ShaderParam]
	}],
	["PeriodicAnimation", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 5, maxParam: 5
		, description: ["\t@PeriodicAnimation=ID:Name:Enable:Delta:Period"
			, "为图像对象启用周期动画，依照类型更新参数"
			, "每经过`Period`则为类型对应的参数增加`Delta`，`Period`为`-1`时每帧更新"]
		, type: [ParamType.Number, ParamType.String, ParamType.ZeroOne, ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ID, InlayHintType.PeriodicAnimationName, InlayHintType.PeriodicAnimation, InlayHintType.PeriodicAnimationDelta, InlayHintType.PeriodicAnimationPeriod]
	}],
	["GraphicErase", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["\t#GraphicErase=MemLimit"
			, "尝试清理未引用的缓存，直到当前内存占用低于`MemLimit`或无可清理缓存。`MemLimit = -1`将按照默认设置清理，`MemLimit = 0`将清理全部未引用缓存"
			, "注意:内存的分配与释放非常耗时，清理100MB内存大约需要10ms，可在黑屏淡出时进行清理，以避免可感知的卡顿，同时请尽量避免频繁清理"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.MemLimit]
	}],

	["CharBlur", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 3
		, description: ["\t@CharBlur=ID:Radius:Accumulate"
			, "为角色创建模糊效果，无法与透视同时使用"
			, "会在库中缓存访问文件名为`RelativePath_Blur_Radius`的文件"
			, "`Accumulate`决定是否累计模糊"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ID, InlayHintType.BlurRadius]
	}],
	["CharPerspective", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@CharPerspective=ID:Matrix"
			, "为角色创建透视效果，无法与模糊同时使用"
			, "会在库中缓存访问文件名为`RelativePath_Perspective_Matrix`的文件"
			, "`Matrix`为变换用到的矩阵"
			, "参考矩阵"
			, "保持原样: `{ {1,0,0}, {0,1,0}, {0,0,1} }`"
			, "缩放: `{ {2,0,0}, {0,2,0}, {0,0,1} }`"
			, "旋转: `{ {1.732 / 2,-0.5,0}, {0.5,1.732 / 2,0}, {0,0,1} }`"
			, "剪切: `{ {1,0.5,0}, {0.5,1,0}, {0,0,1} }`"]
		, type: [ParamType.Number, ParamType.Any]
		, inlayHintType: [InlayHintType.ID, InlayHintType.PerspectiveMatrix]
	}],

	["CharAnimation", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@CharAnimation=ID:Animation"
			, "指定角色动画"
			, "使用其他指令更新图像或参数的，会自动禁用动画"]
		, type: [ParamType.Number, ParamType.File]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Animation]
	}],
	["CharAnimationSpeed", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@CharAnimationSpeed=ID:AnimationSpeed"
			, "指定角色动画速度"]
		, type: [ParamType.Number, ParamType.Number]
		, inlayHintType: [InlayHintType.ID, InlayHintType.AnimationSpeed]
	}],
	["CharAnimationFrame", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 3, maxParam: 3
		, description: ["\t`@CharAnimationFrame=ID:Type:AnimationFrame"
			, "指定角色动画帧"
			, "`Type`为`Step`时，为当前帧到下一帧的`[ 0, 1 ]`插值"
			, "`Type`为`FrameID`时，为计算插值帧在内的总帧数 "
			, "`Type`为`FrameIndex`时，为动画文件中定义的帧"]
		, type: [ParamType.Number, ParamType.String, ParamType.Number]
		, required: [
			undefined,
			[
				"Step",
				"FrameID",
				"FrameIndex",
			],
			undefined]
		, inlayHintType: [InlayHintType.ID, InlayHintType.AnimationFrameType, InlayHintType.AnimationFrame]
		, inlayHintAddition: [
			undefined,
			new Map<string, string>([
				["Step", "插值"],
				["FrameID", "插值帧"],
				["FrameIndex", "帧定义"],
			]),
			undefined]
	}],


	["SetAutoArrange", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["\t@SetAutoArrange=On/Off"
			, "控制自动间距功能的开启与关闭，设定为1或On时启用自动间距，设定为0或Off时禁用自动间距，参数为空会Toggle当前启用状态"
			, "启用自动间距后，新建/销毁立绘时会自动调整间距，最大支持处理六张立绘的间距"]
		, type: [ParamType.Boolean]
		, inlayHintType: [InlayHintType.Boolean]
	}],
	["CD", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 1, maxParam: 1
		, description: ["\t@CD=ID"
			, "\t@CharDispose=ID"
			, "销毁并释放该ID对应的图像对象的本体和遮罩，会转译为`@CharAlpha:ID:255`并启用`Destroy`Flag"]
		, type: [ParamType.Number]
		, inlayHintType: [InlayHintType.ID,]
	}],
	["CharDispose", undefined],

	["CAD", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 0, maxParam: 0
		, description: ["销毁全部的图像对象，并释放其对应的本体和遮罩"
			, "CG/UI不会被销毁"]
		, type: []
	}],
	["CharAllDispose", undefined],
	["MC", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 3, maxParam: 7
		, description: ["\t@MC=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
			, "\t@MoveChar=ID:TarX:TarY:Time:FuncA:FuncB:Mode"
			, "移动图片对象，具体参数说明请参见`@MoveObj`一节"]
		, type: [ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number, ParamType.Number]
		, required: [
			undefined,
			undefined,
			undefined,
			undefined,
			easing_inlayHintAddition_funcName,
			easing_inlayHintAddition_funcName,
			easing_inlayHintAddition_modeName
		]
		, inlayHintType: [InlayHintType.ID, InlayHintType.X, InlayHintType.Y, InlayHintType.Time, InlayHintType.Easing_FuncA, InlayHintType.Easing_FuncB, InlayHintType.Mode]
		, inlayHintAddition: [
			undefined,
			undefined,
			undefined,
			undefined,
			easing_inlayHintAddition_funcNameMap,
			easing_inlayHintAddition_funcNameMap,
			easing_inlayHintAddition_modeNameMap,
		]
	}],
	["MoveChar", undefined],

	["Order", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 3, maxParam: 3
		, description: ["\t@Order=ID:Order:Type"
			, "无叠化，调整ID指定对象的层级，通过`Type`指定不同的对象类型"
			, "`Type`为`Pic`则移动`ID`对应的图像对象，`Type`为`Str`则移动`ID`对应的字符串对象"]
		, type: [ParamType.Number, ParamType.Order, ParamType.ObjType]
		, required: [
			undefined,
			undefined,
			object_objectType
		]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Order, InlayHintType.Type]
		, inlayHintAddition: [
			undefined,
			undefined,
			object_objectTypeMap
		]
	}],
	["Front", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@Front=ID:Type"
			, "无叠化，将`ID`指定的`Type`对象移至顶层"]
		, type: [ParamType.Number, ParamType.ObjType]
		, required: [
			undefined,
			object_objectType
		]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Type]
		, inlayHintAddition: [
			undefined,
			object_objectTypeMap
		]
	}],
	["Back", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 2
		, description: ["\t@Back=ID:Type"
			, "无叠化，将`ID`指定的`Type`对象移至底层"]
		, type: [ParamType.Number, ParamType.ObjType]
		, required: [
			undefined,
			object_objectType
		]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Type]
		, inlayHintAddition: [
			undefined,
			object_objectTypeMap
		]
	}],
	["Forward", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 3
		, description: ["\t@Forward=ID:Type:Num"
			, "无叠化，将`ID`指定的`Type`对象上移`Num`层，参数留空默认上移一层"]
		, type: [ParamType.Number, ParamType.ObjType, ParamType.Number]
		, required: [
			undefined,
			object_objectType,
			undefined
		]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Type, InlayHintType.Num]
		, inlayHintAddition: [
			undefined,
			object_objectTypeMap,
			undefined
		]
	}],
	["Backward", {
		prefix: "@"
		, keywordType: KeywordType.Preobj
		, minParam: 2, maxParam: 3
		, description: ["\t@Backward=ID:Type:Num"
			, "无叠化，将`ID`指定的`Type`对象下移`Num`层，参数留空默认下移一层"]
		, type: [ParamType.Number, ParamType.ObjType, ParamType.Number]
		, required: [
			undefined,
			object_objectType,
			undefined
		]
		, inlayHintType: [InlayHintType.ID, InlayHintType.Type, InlayHintType.Num]
		, inlayHintAddition: [
			undefined,
			object_objectTypeMap,
			undefined
		]
	}],
]);

// the actual list appended commandInfoBaseList with extensions
export let commandInfoList = new Map<string, ParamInfo>();

// state
export let commandListInitialized = false;

export async function waitForCommandListInit() {
	if (!commandListInitialized) {
		vscode.window.showInformationMessage('Waiting for command list update complete');
	}

	do {
		await sleep(50);
	} while (!commandListInitialized);
}

export function resetList() {
	commandInfoList.clear();

	let previousInfo: ParamInfo | undefined = undefined;

	commandInfoBaseList.forEach((value: ParamInfo | undefined, key: string) => {
		if (value === undefined) {
			if (previousInfo !== undefined) {
				commandInfoList.set(key, previousInfo);
			}

			return;
		}

		if (value.keywordType === undefined) {
			console.log(key);
		}

		previousInfo = value;
		commandInfoList.set(key, value);
	});
}
export function generateList() {
	// reset
	commandListInitialized = false;

	sharpKeywordList = [];
	atKeywordList = [];

	keywordList = [];

	internalKeywordList = [];
	deprecatedKeywordList = [];

	commandDocList.clear();

	// generate
	commandInfoList.forEach((value: ParamInfo, key: string) => {
		// prefix
		if (value.prefix === '#') {
			sharpKeywordList.push(key);
		} else if (value.prefix === '@') {
			atKeywordList.push(key);
		}

		// internal
		if (value.internal !== undefined && value.internal === true) {
			internalKeywordList.push(key);
		}
		// deprecate
		if (value.deprecated !== undefined && value.deprecated === true) {
			internalKeywordList.push(key);
		}

		// doc
		commandDocList.set(key, value.description);
	});

	keywordList = sharpKeywordList.concat(atKeywordList);

	// settings    
	settingsParamList = [];

	settingsParamDocList.forEach((value: string[], key: string) => {
		if (!key.iCmp('Settings')) {
			settingsParamList.push(key);
		}
	});

	commandListInitialized = true;
}