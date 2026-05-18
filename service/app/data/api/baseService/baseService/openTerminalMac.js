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

    const terminalCommand = String(argParams.terminalCommand || "").trim();

    try {
      // Resolve full path first
      let runCmd = "";
      if (terminalCommand) {
        try {
          const found = execSync(`command -v "${terminalCommand}" 2>/dev/null`, {
            encoding: "utf8",
            timeout: 5000,
          }).trim();
          if (found) runCmd = found;
        } catch (_) {}
        if (!runCmd) runCmd = terminalCommand;
      }

      // iTerm2 AppleScript
      const esc = (s) =>
        String(s).replace(/\\\\/g, "\\\\\\\\").replace(/"/g, '\\"');
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

      return {
        isWrite: false,
        response: { code: 200, data: { success: true } },
      };
    } catch (error) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "打开终端失败: " + error.message },
        },
      };
    }
  };
})();
