(function () {
  return function (argData, argParams) {
    const fs = require("fs");
    const path = require("path");
    const { exec, execSync } = require("child_process");
    const os = require("os");

    const filePath = String(argParams.filePath || "").trim();
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

    if (platform === "darwin") {
      return openTerminalMac();
    }
    return openTerminalWin();

    // ── Windows ──
    function openTerminalWin() {
      // Tab title: strip first "-" segment, prepend "DP-"
      const projectName = path.basename(absPath);
      const dashIdx = projectName.indexOf("-");
      const shortName = dashIdx !== -1 ? projectName.slice(dashIdx + 1) : projectName;
      const tabTitle = `DP-${shortName}`;

      try {
        let runCmd = "";
        if (terminalCommand) {
          try {
            const found = execSync(`where "${terminalCommand}" 2>nul`, {
              encoding: "utf8", timeout: 5000, windowsHide: true,
            }).trim().split(/\r?\n/)[0];
            if (found && fs.existsSync(found)) runCmd = found;
          } catch (_) {}
          if (!runCmd) runCmd = terminalCommand;
        }

        if (runCmd) {
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
          exec(
            `wt -w 0 new-tab -d "${absPath}" --title "${tabTitle}"`,
            { windowsHide: true }
          );
        }
        return { isWrite: false, response: { code: 200, data: { success: true } } };
      } catch (err) {
        return { isWrite: false, response: { code: 200, data: { success: false, message: "打开终端失败: " + err.message } } };
      }
    }

    // ── macOS ──
    function openTerminalMac() {
      try {
        let runCmd = "";
        if (terminalCommand) {
          try {
            const found = execSync(`command -v "${terminalCommand}" 2>/dev/null`, {
              encoding: "utf8", timeout: 5000,
            }).trim();
            if (found) runCmd = found;
          } catch (_) {}
          if (!runCmd) runCmd = terminalCommand;
        }

        const esc = (s) => String(s).replace(/\\\\/g, "\\\\\\\\").replace(/"/g, '\\"');
        const safePath = esc(absPath);
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
        const tmpPath = path.join(os.tmpdir(), `sf-notes-iterm-${Date.now()}.scpt`);
        fs.writeFileSync(tmpPath, scriptLines.join("\n"), "utf-8");
        exec(`osascript "${tmpPath}"`, () => {
          setTimeout(() => {
            try { fs.unlinkSync(tmpPath); } catch (_) {}
          }, 2000);
        });
        return { isWrite: false, response: { code: 200, data: { success: true } } };
      } catch (err) {
        return { isWrite: false, response: { code: 200, data: { success: false, message: "打开终端失败: " + err.message } } };
      }
    }
  };
})();
