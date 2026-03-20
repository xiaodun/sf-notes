@echo off
wt --window 0 new-tab --title "notes-service" cmd /k "cd /d "%~dp0..\service\app" && node service.js"