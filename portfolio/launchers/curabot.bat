@echo off
title CuraBot Launcher
echo Starting CuraBot...
cd /d "C:\projects\tcs project\curabot"
if exist run_curabot.bat (
    call run_curabot.bat
) else (
    echo Starting Backend...
    start "CuraBot Backend" cmd /k "cd /d C:\projects\tcs project\curabot\backend && python main.py"
    timeout /t 5 /nobreak >nul
    echo Starting Frontend...
    start "CuraBot Frontend" cmd /k "cd /d C:\projects\tcs project\curabot\frontend && npm run dev"
    timeout /t 3 /nobreak >nul
    start http://localhost:5173
)
