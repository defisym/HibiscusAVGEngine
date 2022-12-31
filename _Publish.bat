Set CompressPath="C:\Program Files\7-Zip\7z.exe"
Set ReleasePath = %~dp0

@echo Make Release Package

set Date=%date:~2,8%

set Date=%Date:/=%

%CompressPath% a -tzip %ReleasePath%Hibiscus_B%Date%.zip "%~dp0Document\Hibiscus AVG Engine V6.0.md"
%CompressPath% a -tzip %ReleasePath%Hibiscus_B%Date%.zip "%~dp0Document\Media*"
%CompressPath% a -tzip %ReleasePath%Hibiscus_B%Date%.zip "%~dp0AvgScript\avgscript-0.0.0.vsix"

pause