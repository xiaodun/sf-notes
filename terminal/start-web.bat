@echo off
wt --window 0 new-tab --title "notes-web" --startingDirectory "%~dp0.." cmd /k npm run dev
