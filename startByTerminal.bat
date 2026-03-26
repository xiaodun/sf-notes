@echo off
set "ROOT=%~dp0"
wt -w new new-tab --title "notes-service" --startingDirectory "%ROOT%service\app" cmd /k node service.js ; new-tab --title "sf-notes" --startingDirectory "%ROOT%." cmd /k npm run dev
