# ContentGenerator

## 简介

一键生成并上传Steam Content，需要配合Steamworkds SDK使用。

## 配置说明

见`Config.ini`

## 任务说明

`tasks.json`记录构建任务，key为构建任务名，value保存:

- 是否执行，`False`会跳过该任务
- AppID
- 构建脚本路径，受配置相对路径影响

## 参数说明

| 变量          | 说明                               |
|:------------|:---------------------------------|
| userName    | 上传用户名                            |
| projectPath | 主程序所在的路径                         |
| setUpCI     | 配置持续集成，要求使用密码和令牌登录，首次配置后后续无需再次配置 |
| fullBuild   | 完整构建，会删除目标路径内容，而非检测哈希增量构建        |
| uploadOnly  | 不进行构建，仅仅进行上传                     |
