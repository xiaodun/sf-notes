#!/bin/bash
# ============================================================
# sf-notes 一键启动（macOS 自带 Terminal.app）
# 用法:  bash startByTerminal.sh
# ============================================================

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOCK_FILE="/tmp/sf-notes-start.lock"

# 短时间内重复调用直接退出，避免无限开窗口
if [ -f "$LOCK_FILE" ]; then
  lock_age=$(( $(date +%s) - $(stat -f %m "$LOCK_FILE" 2>/dev/null || echo 0) ))
  if [ "$lock_age" -lt 15 ]; then
    echo "已在启动中，忽略重复调用"
    exit 0
  fi
fi
date +%s > "$LOCK_FILE"

command -v node &>/dev/null || { echo "[错误] 缺少 Node.js"; exit 1; }
command -v npm  &>/dev/null || { echo "[错误] 缺少 npm"; exit 1; }

if [ ! -d "$ROOT/node_modules" ]; then
    echo "首次运行，安装依赖..."
    cd "$ROOT" && npm install --legacy-peer-deps
fi

lsof -ti:8880,8881,8000 2>/dev/null | xargs kill -9 2>/dev/null

osascript <<END_OSA
tell application "Terminal"
    activate
    do script "cd '$ROOT/service/app' && echo '=== notes-service ===' && node service.js"
    do script "cd '$ROOT' && echo '=== sf-notes ===' && npm run dev"
end tell
END_OSA
