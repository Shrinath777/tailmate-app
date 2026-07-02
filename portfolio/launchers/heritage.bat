@echo off
title Heritage Sentinel
echo Starting Heritage Sentinel...
cd /d "C:\projects\heritage\website\backend"
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
start http://localhost:4000
node server.js
