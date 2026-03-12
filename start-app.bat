@echo off
echo Starting Auto Parts App...
cd /d "%~dp0"

echo Checking if server is already running...
netstat -ano | find "3000" >nul
if %errorlevel% equ 0 (
    echo Server seems to be running already.
) else (
    echo Starting the development server...
    start "Auto Parts Server" cmd /k "npm run dev"
    echo Waiting for server to start...
    timeout /t 5 /nobreak >nul
)

echo Opening browser...
start http://localhost:3000
exit
