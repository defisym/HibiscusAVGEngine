@echo off

rem Init
Set APPID=1315620
Set AppName=EndlessShinyBlues
Set ScriptPath=F:\DEV\_Steamworks_SDK\tools\ContentBuilder\scripts\app_build_1315620.vdf
Set ContentPath=F:\DEV\_Steamworks_SDK\tools\ContentBuilder\content\%AppName%\
Set SteamCMDPath=F:\DEV\_Steamworks_SDK\tools\ContentBuilder\builder\steamcmd.exe

Set curPath=%~dp0

Set Encrypter_CLI=F:\DEV\HibiscusAVGEngine\Utilities\Encrypter_CLI\Encrypter_CLI.exe
Set Encrypter_Key=12345678ABCDEFGH

Set Settings_CLI=F:\DEV\HibiscusAVGEngine\Utilities\Settings_CLI\Settings_CLI.exe

@echo delete old content...

rem Clean Content Path
for /r "%ContentPath%" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\"
rmdir /s /q "%ContentPath%\savings\"
rmdir /s /q "%ContentPath%\settings\"
rmdir /s /q "%ContentPath%\localization\"
rmdir /s /q "%ContentPath%\Modules\"
rmdir /s /q "%ContentPath%\%AppName%_Text\"

@echo Generate New Content...

rem Update Content
xcopy "%curPath%\data\*.*" "%ContentPath%\data\" /s /e
xcopy "%curPath%\savings\_Sys\*.*" "%ContentPath%\savings\_Sys\" /s /e

echo f | xcopy "%curPath%\settings\settings_Template.ini" "%ContentPath%\settings\settings.ini" /s /e
echo f | xcopy "%curPath%\settings\settings_Template.ini" "%ContentPath%\settings\settings_Template.ini" /s /e
echo f | xcopy "%curPath%\settings\settings_Dynamic.ini" "%ContentPath%\settings\settings_Dynamic.ini" /s /e

echo f | xcopy "%curPath%\savings\_Global\_Cache_Template" "%ContentPath%\savings\_Global\_Cache" /s /e
echo f | xcopy "%curPath%\savings\_Global\_GlobalProgress_Template" "%ContentPath%\savings\_Global\_GlobalProgress" /s /e
echo f | xcopy "%curPath%\savings\_Global\Appreciation_Definition_Template" "%ContentPath%\savings\_Global\Appreciation_Definition" /s /e
echo f | xcopy "%curPath%\savings\_Global\Appreciation_Progress_Template" "%ContentPath%\savings\_Global\Appreciation_Progress" /s /e
echo f | xcopy "%curPath%\savings\_Global\Data_Template.sav" "%ContentPath%\savings\_Global\Data_Template.sav" /s /e

xcopy "%curPath%\Modules\*.*" "%ContentPath%\Modules\" /s /e
xcopy "%curPath%\localization\*.*" "%ContentPath%\localization\" /s /e

echo f | xcopy "%curPath%\%AppName%.dat" "%ContentPath%" /s /e
echo f | xcopy "%curPath%\%AppName%.exe" "%ContentPath%\%AppName%.exe" /s /e

@REM echo f | xcopy "%curPath%\%AppName%_Wrapper.exe" "%ContentPath%\%AppName%.exe" /s /e

@REM Delete Temp Files
del "%ContentPath%\.gitignore" /f /s /q

del "%ContentPath%\NOENCRYPT" /f /s /q
del "%ContentPath%\_HWDECODE" /f /s /q

del "%ContentPath%\Application resizing errors.txt" /f /s /q

del "%ContentPath%\steam_appid.txt" /f /s /q

del "%ContentPath%\ContentGenerator.bat" /f /s /q
del "%ContentPath%\Publish.bat" /f /s /q

for /r "%ContentPath%" %%F in (ReadMe.md) do (
	del "%%F" /f /s /q	
)

for /r "%ContentPath%" %%F in (*.file) do (
	del "%%F" /f /s /q	
)

for /r "%ContentPath%" %%F in (*.mfa) do (
	del "%%F" /f /s /q	
)

for /r "%ContentPath%" %%F in (*.001) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\_MFAs\"

for /r "%ContentPath%\data\Assets\__Movies" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\Assets\__Movies\"

@REM Dialogue
for /r "%ContentPath%\data\dialogue\_External" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\dialogue\_External\"

for /r "%ContentPath%\data\dialogue\_Test" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\dialogue\_Test\"

for /r "%ContentPath%\data\dialogue\_Template" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\dialogue\_Template\"

for /r "%ContentPath%\data\dialogue\__Merged" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\dialogue\__Merged\"

for /r "%ContentPath%\data\dialogue\__Old" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\dialogue\__Old\"

for /r "%ContentPath%\data\dialogue\.vscode" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\data\dialogue\.vscode\"

del "%ContentPath%\data\dialogue\_Debug_Order.asc" /f /s /q
del "%ContentPath%\data\dialogue\_initial.asc" /f /s /q
del "%ContentPath%\data\dialogue\_Ref.md" /f /s /q

@REM Text
for /r "%ContentPath%\Mobius_Text" %%F in (*.*) do (
	del "%%F" /f /s /q	
)

rmdir /s /q "%ContentPath%\Mobius_Text\"

@echo Encrypt Files...

%Encrypter_CLI% -f "%ContentPath%\settings\settings_Dynamic.ini" --encrypt --key %Encrypter_Key%

for /r "%ContentPath%\data\Assets" %%F in (*.*) do (
	%Encrypter_CLI% -f "%%F" --encrypt --key %Encrypter_Key%
)

for /r "%ContentPath%\data\audio" %%F in (*.*) do (
	%Encrypter_CLI% -f "%%F" --encrypt --key %Encrypter_Key%
)

for /r "%ContentPath%\data\dialogue" %%F in (*.*) do (
	%Encrypter_CLI% -f "%%F" --encrypt --key %Encrypter_Key%
)

for /r "%ContentPath%\data\Graphics" %%F in (*.*) do (
	%Encrypter_CLI% -f "%%F" --encrypt --key %Encrypter_Key%
)

for /r "%ContentPath%\savings\_Global" %%F in (*.*) do (
	%Encrypter_CLI% -f "%%F" --encrypt --key %Encrypter_Key%
)

for /r "%ContentPath%\savings\_Sys" %%F in (*.*) do (
	%Encrypter_CLI% -f "%%F" --encrypt --key %Encrypter_Key%
)

for /r "%ContentPath%\localization" %%F in (*.*) do (
	%Encrypter_CLI% -f "%%F" --encrypt --key %Encrypter_Key%
)

@echo Steam Init
Set SteamUser=defisym
REM Set SteamPassword=your Password
Set /p SteamPassword=Please input SteamPassword : 
@REM Set /p SteamGuard=Please input SteamGuard : 

rem Build Content
@REM %SteamCMDPath% +login %SteamUser% %SteamPassword% %SteamGuard% +run_app_build %ScriptPath% +quit
@REM %SteamCMDPath% +login %SteamUser% %SteamPassword% %SteamGuard% +drm_wrap %APPID% "%curPath%\%AppName%.exe" "%ContentPath%\%AppName%.exe" drmtoolp 0 +run_app_build %ScriptPath% +quit

@echo Login + DRM...
@REM %SteamCMDPath% +login %SteamUser% %SteamPassword% %SteamGuard% 
%SteamCMDPath% +login %SteamUser% %SteamPassword% +drm_wrap %APPID% "%ContentPath%\%AppName%.exe" "%ContentPath%\%AppName%.exe" drmtoolp 0 +quit

@REM @echo DRM...
@REM %SteamCMDPath% +drm_wrap %APPID% "%ContentPath%\%AppName%.exe" "%ContentPath%\%AppName%.exe" drmtoolp 0
@REM drm_wrap %APPID% "%ContentPath%\%AppName%.exe" "%ContentPath%\%AppName%.exe" drmtoolp 0

@echo UpdateHash

for /f "usebackq" %%a in (`%Encrypter_CLI% -f "%ContentPath%\%AppName%.exe" --hash`) do (
	Set Hash=%%a
)

@echo ExeHash
@echo %Hash%

%Settings_CLI% -f "%ContentPath%\settings\settings.ini" --unicode --section System --item ExeHash --value %Hash%
%Settings_CLI% -f "%ContentPath%\settings\settings_Template.ini" --unicode --section System --item ExeHash --value %Hash%

for /f "usebackq" %%a in (`%Encrypter_CLI% -f "%ContentPath%\%AppName%.dat" --hash`) do (
	Set Hash=%%a
)

@echo DatHash
@echo %Hash%

%Settings_CLI% -f "%ContentPath%\settings\settings.ini" --unicode --section System --item DatHash --value %Hash%
%Settings_CLI% -f "%ContentPath%\settings\settings_Template.ini" --unicode --section System --item DatHash --value %Hash%

@echo Encrypt Settings

%Encrypter_CLI% -f "%ContentPath%\settings\settings.ini" --encrypt --key %Encrypter_Key%
%Encrypter_CLI% -f "%ContentPath%\settings\settings_Template.ini" --encrypt --key %Encrypter_Key%

@REM @Pause

@echo Login + Building New Content...
@REM %SteamCMDPath% +run_app_build %ScriptPath% +quit
%SteamCMDPath% +login %SteamUser% %SteamPassword% +run_app_build %ScriptPath% +quit

exit
