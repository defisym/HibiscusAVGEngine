@echo off

rem Init
Set ScriptPath=F:\DEV\_Steamworks_SDK\tools\ContentBuilder\scripts\app_build_1315620.vdf
Set ContentPath=F:\DEV\_Steamworks_SDK\tools\ContentBuilder\content\EndlessShinyBlues\
Set SteamCMDPath=F:\DEV\_Steamworks_SDK\tools\ContentBuilder\builder\steamcmd.exe

@echo delete old content...

rem Clean Content Path
for /r "%ContentPath%" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\"
rmdir /s /q "%ContentPath%\savings\"
rmdir /s /q "%ContentPath%\settings\"

@echo Generate New Content...

rem Update Content
xcopy "%CD%\data\*.*" "%ContentPath%\data\" /s /e
xcopy "%CD%\settings\*.*" "%ContentPath%\settings\" /s /e
xcopy "%CD%\savings\_Sys\*.*" "%ContentPath%\savings\_Sys\" /s /e
echo f | xcopy "%CD%\savings\_Global\_GlobalProgress_Template" "%ContentPath%\savings\_Global\_GlobalProgress" /s /e


xcopy "%CD%\EndlessShinyBlues.exe" "%ContentPath%" /s /e
xcopy "%CD%\steam_api.dll" "%ContentPath%" /s /e
xcopy "%CD%\steam_api64.dll" "%ContentPath%" /s /e

REM Delete Temp Files
del "%ContentPath%\CrashLog.Log" /f /s /q
del "%ContentPath%\ContentGenerator.bat" /f /s /q

for /r "%ContentPath%" %%F in (*.file) do (
	del "%%F" /f /s /q	
)

for /r "%ContentPath%" %%F in (*.mfa) do (
	del "%%F" /f /s /q	
)

for /r "%ContentPath%" %%F in (*.001) do (
	del "%%F" /f /s /q	
)

for /r "%ContentPath%\_Docs" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\_Docs\"

for /r "%ContentPath%\data\dialogue\_External" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\dialogue\_External\"

for /r "%ContentPath%\data\dialogue\_Tests" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\dialogue\_Tests\"

for /r "%ContentPath%\data\dialogue\_Template" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\dialogue\_Template\"

for /r "%ContentPath%\data\dialogue\labels" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rem Steam Init
Set SteamUser=defisym
REM Set SteamPassword=your Password
Set /p SteamPassword=Please input SteamPassword : 
Set /p SteamGuard=Please input SteamGuard : 

@echo Building New Content...

rem Build Content
%SteamCMDPath% +login %SteamUser% %SteamPassword% %SteamGuard% +run_app_build %ScriptPath% +quit

exit
