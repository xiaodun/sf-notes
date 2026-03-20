@echo off
wt --window 0 new-tab --title "notes-service" --startingDirectory "%~dp0..\service\app" cmd /k node service.js
