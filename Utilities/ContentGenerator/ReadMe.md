# ContentGenerator

## 简介

完成路径配置后，将本工具放置于主程序根目录，双击运行，即可一键生成并上传Steam Content，需要配合Steamworkds SDK使用。

## 处理流程

- 删除ContentPath中的内容
- 将当前路径下的全部内容复制至ContentPath
- 删除开发过程中与调试过程中生成的临时文件，删除逻辑与.gitignore一致
- 调用Steam CMD打包上传

## 变量说明

|变量|说明|
|:---|:---|
|SteamUser|用户名|
|SteamPassword|账户密码，默认要求输入，可配置于批处理内|
|SteamGuard|手机令牌，默认要求输入|
|ScriptPath|脚本路径|
|ContentPath|Content路径|
|SteamCMDPath|SteamCMD路径|
