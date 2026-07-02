@echo off
title Shrinath Portfolio
color 0D
echo.
echo ================================================
echo    Shrinath Sureshbabu - Portfolio Website
echo ================================================
echo.

cd /d "%~dp0"

:: Check if node_modules exists
if not exist node_modules (
    echo [1/3] Installing dependencies...
    npm install
    echo.
) else (
    echo [1/3] Dependencies already installed.
)

:: Build the React app
echo [2/3] Building production bundle...
call npm run build
echo.

:: Start the server
echo [3/3] Starting portfolio server...
echo.
echo ================================================
echo   Portfolio is live at http://localhost:3000
echo   Press Ctrl+C to stop the server
echo ================================================
echo.
start http://localhost:3000
node server.js
