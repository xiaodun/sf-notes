#!/bin/bash
# ============================================================
# sf-notes 一键启动（macOS / iTerm）
# 用法:  bash startByTerminal.sh
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

# ---- 生成后端启动脚本（设 Tab 标题 + 启动服务）----
cat > /tmp/_sf_svc.sh << 'SVC_EOF'
#!/bin/bash
printf '\033]1;notes-service\007'
cd "__ROOT__/service/app" && echo '=== notes-service ===' && node service.js
SVC_EOF

# ---- 生成前端启动脚本 ----
cat > /tmp/_sf_web.sh << 'WEB_EOF'
#!/bin/bash
printf '\033]1;sf-notes\007'
cd "__ROOT__" && echo '=== sf-notes ===' && npm run dev
WEB_EOF

chmod +x /tmp/_sf_svc.sh /tmp/_sf_web.sh
sed -i '' "s|__ROOT__|$ROOT|g" /tmp/_sf_svc.sh /tmp/_sf_web.sh

echo "启动 iTerm..."

osascript <<END_OSA
tell application "iTerm"
    activate
    if (count of windows) = 0 then
        set w to (create window with default profile)
        tell w
            tell current session
                write text "bash /tmp/_sf_svc.sh"
            end tell
        end tell
    else
        set w to current window
        tell w
            set t1 to (create tab with default profile)
            tell current session of t1
                write text "bash /tmp/_sf_svc.sh"
            end tell
        end tell
    end if
    tell w
        set t2 to (create tab with default profile)
        tell current session of t2
            write text "bash /tmp/_sf_web.sh"
        end tell
    end tell
end tell
END_OSA
