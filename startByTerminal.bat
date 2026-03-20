@echo off
set "ROOT=%~dp0"
wt --window 0 new-tab --title "notes-service" cmd /k "cd /d "%ROOT%service\app" && node service.js" ; new-tab --title "sf-notes" cmd /k "cd /d %ROOT% && npm run dev"