@echo off
title RFID Dashboard
echo Starting RFID Dashboard...
cd /d "C:\projects\RFID-dashboard\backend"
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
start http://localhost:4001
node server.js
