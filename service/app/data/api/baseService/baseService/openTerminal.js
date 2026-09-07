;(function () {
  return function (argData, argParams) {
    const fs = require("fs");
    const path = require("path");
    const { exec, execSync } = require("child_process");
    const os = require("os");

    let filePath = String(argParams.filePath || "").trim();
    // 支持 ~ 开头：展开为用户主目录（如 ~/Documents → Windows「文档」/ Mac「文稿」）
    if (filePath === "~" || /^~[\\/]/.test(filePath)) {
      filePath = path.join(os.homedir(), filePath.slice(1));
    }
    const absPath = path.resolve(filePath);

    if (!filePath || !fs.existsSync(absPath)) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "路径不存在" },
        },
      };
    }

    const platform = os.platform();
    const terminalCommand = String(argParams.terminalCommand || "").trim();
    const commandLine = String(argParams.commandLine || "").trim();
    const titlePrefix = String(argParams.titlePrefix || "DP").trim() || "DP";
    const customTabTitle = String(argParams.tabTitle || "").trim();

    if (platform === "darwin") {
      return openTerminalMac();
    }
    return openTerminalWin();

    function buildTabTitle() {
      if (customTabTitle) return customTabTitle;
      const projectName = path.basename(absPath);
      const dashIdx = projectName.indexOf("-");
      const shortName =
        dashIdx !== -1 ? projectName.slice(dashIdx + 1) : projectName;
      return `${titlePrefix}-${shortName}`;
    }

    /** 解析 commandLine：Windows 下把开头的 agent 换成绝对路径，避免 cmd 找不到 */
    function resolveCommandLine(raw) {
      const cmd = String(raw || "").trim();
      if (!cmd) return "";
      const m = cmd.match(/^agent(\s+.*)?$/i);
      if (!m) return cmd;
      const args = m[1] || "";

      const candidates = [];
      if (process.env.LOCALAPPDATA) {
        candidates.push(
          path.join(process.env.LOCALAPPDATA, "cursor-agent", "agent.cmd")
        );
      }
      if (process.env.USERPROFILE) {
        candidates.push(
          path.join(
            process.env.USERPROFILE,
            "AppData",
            "Local",
            "cursor-agent",
            "agent.cmd"
          )
        );
      }
      try {
        const found = execSync("where agent 2>nul", {
          encoding: "utf8",
          timeout: 5000,
          windowsHide: true,
        })
          .trim()
          .split(/\r?\n/)[0];
        if (found) candidates.unshift(found);
      } catch (_) {}

      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i] && fs.existsSync(candidates[i])) {
          return '"' + candidates[i] + '"' + args;
        }
      }
      return cmd;
    }

    function resolveRunCmd() {
      if (!terminalCommand) return "";
      try {
        if (platform === "win32") {
          const found = execSync(`where "${terminalCommand}" 2>nul`, {
            encoding: "utf8",
            timeout: 5000,
            windowsHide: true,
          })
            .trim()
            .split(/\r?\n/)[0];
          if (found && fs.existsSync(found)) return found;
        } else {
          const found = execSync(
            `command -v "${terminalCommand}" 2>/dev/null`,
            { encoding: "utf8", timeout: 5000 }
          ).trim();
          if (found) return found;
        }
      } catch (_) {}
      return terminalCommand;
    }

    // ── Windows ──
    function openTerminalWin() {
      const tabTitle = buildTabTitle();

      try {
        const runCmd = resolveRunCmd();

        if (commandLine || runCmd) {
          const driveLetter = absPath.match(/^([A-Za-z]:)/);
          const batLines = ["@echo off"];
          if (driveLetter) batLines.push(driveLetter[1]);
          batLines.push(`cd /d "${absPath}"`);
          if (commandLine) {
            batLines.push(resolveCommandLine(commandLine));
          } else {
            batLines.push(`"${runCmd}"`);
          }
          const batContent = batLines.join("\r\n");
          const tempBatPath = path.join(
            os.tmpdir(),
            `sf-notes-term-${Date.now()}-${Math.random()
              .toString(16)
              .slice(2, 8)}.bat`
          );
          fs.writeFileSync(tempBatPath, batContent, "utf-8");
          exec(
            `wt -w 0 new-tab -d "${absPath}" --title "${tabTitle}" cmd /k ${tempBatPath}`,
            { windowsHide: true }
          );
          setTimeout(() => {
            try {
              if (fs.existsSync(tempBatPath)) fs.unlinkSync(tempBatPath);
            } catch (_) {}
          }, 5000);
        } else {
          exec(
            `wt -w 0 new-tab -d "${absPath}" --title "${tabTitle}"`,
            { windowsHide: true }
          );
        }
        return {
          isWrite: false,
          response: { code: 200, data: { success: true } },
        };
      } catch (err) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: {
              success: false,
              message: "打开终端失败: " + err.message,
            },
          },
        };
      }
    }

    // ── macOS ──
    function openTerminalMac() {
      try {
        const runCmd = resolveRunCmd();
        const esc = (s) =>
          String(s).replace(/\\\\/g, "\\\\\\\\").replace(/'/g, "'\\\\''");
        const safePath = esc(absPath);
        let writeTextCmd = `cd '${safePath}'`;
        if (commandLine) {
          writeTextCmd += ` && ${commandLine}`;
        } else if (runCmd) {
          writeTextCmd += ` && ${runCmd}`;
        }

        const scriptLines = [
          'tell application "iTerm"',
          "  activate",
          "  if (count of windows) = 0 then",
          "    create window with default profile",
          "  end if",
          "  tell current window",
          "    set t to (create tab with default profile)",
          "    tell current session of t",
          `      write text "${writeTextCmd}"`,
          "    end tell",
          "  end tell",
          "end tell",
        ];
        const tmpPath = path.join(
          os.tmpdir(),
          `sf-notes-iterm-${Date.now()}.scpt`
        );
        fs.writeFileSync(tmpPath, scriptLines.join("\n"), "utf-8");
        exec(`osascript "${tmpPath}"`, () => {
          setTimeout(() => {
            try {
              fs.unlinkSync(tmpPath);
            } catch (_) {}
          }, 2000);
        });
        return {
          isWrite: false,
          response: { code: 200, data: { success: true } },
        };
      } catch (err) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: {
              success: false,
              message: "打开终端失败: " + err.message,
            },
          },
        };
      }
    }
  };
})();
