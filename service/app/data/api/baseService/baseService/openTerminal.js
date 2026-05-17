(function () {
  return function (argData, argParams) {
    const fs = require("fs");
    const path = require("path");
    const { exec } = require("child_process");
    const os = require("os");

    const filePath = String(argParams.filePath || "").trim();
    const absPath = path.resolve(filePath);

    if (!filePath || !fs.existsSync(absPath)) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "路径不存在",
          },
        },
      };
    }

    const platform = os.platform(); // 'win32', 'darwin', 'linux'
    const terminalCommand = String(argParams.terminalCommand || "").trim();

    // Tab title: strip first "-" segment from project name, prepend "DP-"
    // e.g., "sf-notes" → "DP-notes", "affluence-lottery-client" → "DP-lottery-client"
    const projectName = path.basename(absPath);
    const dashIdx = projectName.indexOf("-");
    const shortName = dashIdx !== -1 ? projectName.slice(dashIdx + 1) : projectName;
    const tabTitle = `DP-${shortName}`;

    try {
      if (platform === "win32") {
        // Resolve the full path of the command BEFORE launching wt.
        // This avoids PATH issues: the terminal spawned by wt inherits
        // a limited environment, but a full path works regardless.
        let runCmd = "";
        if (terminalCommand) {
          try {
            const { execSync } = require("child_process");
            const found = execSync(`where "${terminalCommand}" 2>nul`, {
              encoding: "utf8",
              timeout: 5000,
              windowsHide: true,
            })
              .trim()
              .split(/\r?\n/)[0];
            if (found && fs.existsSync(found)) {
              runCmd = found; // full path, e.g. C:\nvm4w\nodejs\deepcode.cmd
            }
          } catch (_) {
            // where failed; fall back to raw command
          }
          if (!runCmd) {
            runCmd = terminalCommand;
          }
        }

        if (runCmd) {
          // Write temp bat with drive switch + full-path command
          const driveLetter = absPath.match(/^([A-Za-z]:)/);
          const batLines = ["@echo off"];
          if (driveLetter) batLines.push(driveLetter[1]);
          batLines.push(`cd /d "${absPath}"`);
          batLines.push(`"${runCmd}"`);
          const batContent = batLines.join("\r\n");
          const tempBatPath = path.join(
            os.tmpdir(),
            `sf-notes-term-${Date.now()}-${Math.random().toString(16).slice(2, 8)}.bat`
          );
          fs.writeFileSync(tempBatPath, batContent, "utf-8");
          exec(
            `wt -w 0 new-tab -d "${absPath}" --title "${tabTitle}" cmd /k ${tempBatPath}`,
            { windowsHide: true }
          );
          setTimeout(() => {
            try { if (fs.existsSync(tempBatPath)) fs.unlinkSync(tempBatPath); } catch (_) {}
          }, 5000);
        } else {
          exec(`wt -w 0 new-tab -d "${absPath}" --title "${tabTitle}"`, { windowsHide: true });
        }
      } else if (platform === "darwin") {
        // macOS: resolve full path first, then open iTerm2 via AppleScript
        let runCmd = "";
        if (terminalCommand) {
          try {
            const { execSync } = require("child_process");
            const found = execSync(`command -v "${terminalCommand}" 2>/dev/null`, {
              encoding: "utf8",
              timeout: 5000,
            })
              .trim();
            if (found) {
              runCmd = found; // full path, e.g. /usr/local/bin/deepcode
            }
          } catch (_) {}
          if (!runCmd) runCmd = terminalCommand;
        }

        const escForAppleScript = (s) =>
          String(s).replace(/\\\\/g, "\\\\\\\\").replace(/"/g, '\\"');
        const safePath = escForAppleScript(absPath);
        const writeTextCmd = runCmd
          ? `cd "${safePath}" && ${runCmd}`
          : `cd "${safePath}"`;

        const scriptLines = [
          'tell application "iTerm"',
          '  if (count of windows) = 0 then',
          '    create window with default profile',
          '  end if',
          '  tell current session of current window',
          `    write text "${writeTextCmd}"`,
          '  end tell',
          '  activate',
          'end tell',
        ];
        const tmpPath = path.join(
          os.tmpdir(),
          `sf-notes-iterm-${Date.now()}.scpt`
        );
        fs.writeFileSync(tmpPath, scriptLines.join("\n"), "utf-8");
        exec(`osascript "${tmpPath}"`, () => {
          setTimeout(() => {
            try { fs.unlinkSync(tmpPath); } catch (_) {}
          }, 2000);
        });
      } else {
        // Linux or other: try x-terminal-emulator / gnome-terminal
        const shellCmd = terminalCommand
          ? `cd "${absPath}" && ${terminalCommand}; exec $SHELL`
          : `cd "${absPath}"; exec $SHELL`;
        exec(`x-terminal-emulator -e bash -c '${shellCmd}'`);
      }

      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
          },
        },
      };
    } catch (error) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "打开终端失败: " + error.message,
          },
        },
      };
    }
  };
})();
