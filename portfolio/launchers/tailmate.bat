@echo off
title TailMate
echo Starting TailMate Backend...
cd /d "C:\projects\tailmate-app\tailmate-backend"
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
start http://localhost:5000
node server.js
