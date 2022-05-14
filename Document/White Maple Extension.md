# White Maple Extension

## 镜头

### `@MovCam=TarCharID`

同义指令

- `@MovCam=TarX: TarY`
- `@MovCamera=TarCharID`
- `@MovCamera=TarX: TarY`

将镜头移动至`TarCharID`对应单位所在处或坐标`( TarX , TarY )`，`TarX`/`TarY`为网格坐标
`TarCharID`为`CurrentChar`时，移动镜头到当前行动角色
该指令会更新相对坐标，因此与对象运动相关指令存在冲突，请在两者之间插入`#Wait`指令

### `@FollowCam=TarCharID`

镜头跟随`CharID`为`TarCharID`的单位，直至执行指令`@UnfollowCam`取消跟随镜头。该指令通常配合`@MoveCha`使用。

### `@UnfollowCam`

取消跟随镜头

## 单位

### `@CreateChar=CreateCharName:UnitType:SearchRange`

以`UnitType`创建新单位`CreateCharName`，并将镜头移动至新创建单位坐标
其中`UnitType`=`0`或`Enemy`为敌方角色，`UnitType`=`1`或`Player`为我方角色。若配置文件中给出的坐标不合法，则会以默认坐标为中心，在`SearchRange*SearchRange`区域内搜索合法位点。`SearchRange`默认为`5`，不宜设为过大的数值。

### `@DestroyChar=DestroyCharID`

无阵亡对话，直接销毁`CharID`为`DestroyCharID`的单位

### `@MoveSRPGChar=MoveSRPGCharID:TarX: TarY`

将`CharID`为`MoveCharID`的单位移动至坐标`( TarX , TarY )`，`TarX/TarY`为网格坐标。移动结束后会自动取消镜头对单位的跟随。

### `@CharDir= CharDirID:TargetDir`

将`CharID`为`CharDirID`的单位朝向更改为`TargetDir`。`TargetDir`的合法值如下：

| TargetDir | 实际朝向 |
| --------- | -------- |
| 0         | →        |
| 1         | ↓        |
| 2         | ←        |
| 3         | ↑        |

当`TargetDir`不为上述值时，会将其视为`TargetCharID`，`CharDirID`对应的单位会朝向`TargetCharID`对应的单位。

## 动画

### `@PlayAnimation=PlayCharID:TargetAnimation`

令`CharID`为`PlayCharID`的单位播放`TargetAnimation`，`TargetAnimation`支持别名与`ID`。

| 动画名称     | ID   | 别名         | 备注     |
| ------------ | ---- | ------------ | -------- |
| Stopped      | 0   | Stopped      | 通常待机 |
| Walking      | 1   | Walking      | 移动     |
| ~~Running~~      | ~~2~~   | ~~N/A~~          | ~~未采用~~   |
| ~~Appearing~~    | ~~3~~   | ~~N/A~~          | ~~未采用~~   |
| Disappearing | 4    | Disappearing | 阵亡     |
| ~~Bouncing~~     | ~~5~~    | ~~N/A~~          | ~~未采用~~   |
| ~~Launching~~    | ~~6~~    | ~~N/A~~          | ~~未采用~~   |
| ~~Jumping~~      | ~~7~~    | ~~N/A~~          | ~~未采用~~   |
| ~~Falling~~      | ~~8~~    | ~~N/A~~          | ~~未采用~~   |
| ~~Climbing~~     | ~~9~~   | ~~N/A~~          | ~~未采用~~   |
| ~~Crouch Down~~  | ~~10~~   | ~~N/A~~          | ~~未采用~~   |
| ~~Stand Up~~     | ~~11~~   | ~~N/A~~          | ~~未采用~~   |
| Healing     | 12   | Healing | 治疗     |
| Guard      | 13   | Guard | 格挡     |
| Damage       | 14   | Damage       | 受创     |
| Dodge        | 15   | Dodge        | 闪避     |
| Attack | N/A | Attack | 根据持有武器播放对应攻击动画，仅限战斗演出，大地图中不创建武器对象，请使用下列指令播放对应动画 |
| Attack_Hand | 16 | Attack_Hand | 徒手攻击 |
| Attack_Sword | 17 | Attack_Sword | 剑攻击 |
| Attack_Axe | 18 | Attack_Axe | 斧攻击 |
| Attack_Spear | 19 | Attack_Spear | 枪攻击 |
| Attack_Bow | 20 | Attack_Bow | 弓攻击 |
| Attack_Magic | 21 | Attack_Magic | 魔法攻击 |
| Attack_Special | 22 | Attack_Special | 角色特殊武器攻击 |

### `@PlayWeaponAnimation=StartCharID:TargetCharID`

以攻击发起者为`StartCharID`对应的单位，攻击承受者为`TargetCharID`对应的单位，播放武器动画。

## 触发区域

### `@CreateTriggerZone=TypeStr:Para1:Para2:Para3:……`

根据特性，创建触发区域。其中`EigenStr`建议以`Command_TypeStr_`为起始，`XPos`、`YPos`为网格坐标，若希望调用指定的对话，`UnitType`应设定为`-1`
`TypeStr`区分大小写

| TypeStr               | Para1    | Para2     | Para3  | Para4         | Para5            | Para6      |
| --------------------- | -------- | --------- | ------ | ------------- | ---------------- | ---------- |
| ScriptOnly            | EigenStr | ScriptStr | XPos   | YPos          | Visibility       |            |
| DropedItem            | EigenStr | XPos      | YPos   | ItemID        | UnitType≠-1      | DropCharID |
|                       |          |           |        |               | UnitType=-1      | ScriptStr  |
| InteractZone_Unit     | EigenStr | ScriptStr | CharID | TriggerCharID |                  |            |
| InteractZone_Switch   | EigenStr | ScriptStr | XPos   | YPos          | DestroySearchStr |            |
| InteractZone_Obstacle | EigenStr | XPos      | YPos   |               |                  |            |
| 1                     | 2        | 3         | 4      | 5             | 6                | 7          |

### `@DestroyTriggerZone=EigenStr`

销毁`EigenStr`对应的触发区域

## 检测

### 镜头位于目标点

只有镜头位于目标点时，才会判断演出结束

### 动画播放结束

只有所有动画对象均播放默认的`Stopped`动画时，才会判断演出结束
