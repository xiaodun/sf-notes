@echo off
wt --window 0 new-tab --title "notes-web" cmd /k "cd /d "%~dp0.." && npm run dev"