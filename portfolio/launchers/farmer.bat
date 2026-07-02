@echo off
title Farmer Services
echo Starting Farmer Services...
cd /d "C:\projects\farmer\login"
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
start http://localhost:3001
node server.js
