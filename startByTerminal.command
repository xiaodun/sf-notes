#!/bin/bash
# ============================================================
# sf-notes 一键启动（macOS / iTerm）
# 双击启动，或: bash startByTerminal.command
# ============================================================

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ---- 检查环境 ----
command -v node &>/dev/null || { echo "[错误] 缺少 Node.js"; exit 1; }
command -v npm  &>/dev/null || { echo "[错误] 缺少 npm"; exit 1; }

# ---- 安装依赖 ----
if [ ! -d "$ROOT/node_modules" ]; then
    echo "📦 首次运行，安装依赖..."
    cd "$ROOT" && npm install --legacy-peer-deps
    echo "✅ 安装完成"
fi

# ---- 清理旧端口 ----
lsof -ti:8881 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:8000 2>/dev/null | xargs kill -9 2>/dev/null

echo "启动 iTerm..."

osascript <<END_OSA
tell application "iTerm"
    activate
    -- 复用已有窗口则开新 Tab，没有则新建窗口
    if (count of windows) = 0 then
        set w to (create window with default profile)
        tell w
            tell current session
                write text "cd '$ROOT/service/app' && echo '=== notes-service ===' && node service.js"
            end tell
        end tell
    else
        set w to current window
        tell w
            set t1 to (create tab with default profile)
            tell current session of t1
                write text "cd '$ROOT/service/app' && echo '=== notes-service ===' && node service.js"
            end tell
        end tell
    end if
    -- Tab 2: 前端
    tell w
        set t2 to (create tab with default profile)
        tell current session of t2
            write text "cd '$ROOT' && echo '=== sf-notes ===' && npm run dev"
        end tell
    end tell
end tell
END_OSA
