(function () {
  return function (argData, argParams, external) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const { exec } = require('child_process');
    const { projectId, projectName } = argParams;

    if (!projectId || !projectName) {
      return { isWrite: false, response: { code: 200, data: { success: false, message: '参数错误' } } };
    }

    const projectIndex = argData.projectList.findIndex((item) => item.id === projectId);
    if (projectIndex === -1) {
      return { isWrite: false, response: { code: 200, data: { success: false, message: '项目不存在' } } };
    }

    try {
      const project = argData.projectList[projectIndex];
      const projectRootPath = String(project.rootPath || '').trim();
      const runtimeCommandItems = ((project.startConfig || {}).commands || [])
        .map((item) => ({ name: String((item || {}).name || '').trim(), command: String((item || {}).command || '').trim() }))
        .filter((item) => item.command);
      if (!projectRootPath || !runtimeCommandItems.length) {
        return { isWrite: false, response: { code: 200, data: { success: false, message: '项目未配置启动命令' } } };
      }

      const platform = os.platform();

      if (platform === 'darwin') {
        // macOS: use iTerm via AppleScript
        const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "'\\''");
        const safePath = esc(projectRootPath);

        runtimeCommandItems.forEach((item, index) => {
          const itemName = item.name;
          const tabTitle = (itemName || `${projectName}-${index}`);
          const writeTextCmd = item.command
            ? `cd '${safePath}' && echo '=== ${tabTitle} ===' && ${item.command}`
            : `cd '${safePath}'`;

          const scriptLines = [
            'tell application "iTerm"',
            '  activate',
            '  if (count of windows) = 0 then',
            '    create window with default profile',
            '  end if',
            '  tell current window',
            '    set t to (create tab with default profile)',
            '    tell current session of t',
            `      write text "${writeTextCmd}"`,
            `      set name to "${tabTitle}"`,
            '    end tell',
            '  end tell',
            'end tell',
          ];
          const tmpPath = path.join(os.tmpdir(), `sf-notes-start-${projectId}-${Date.now()}-${index}.scpt`);
          fs.writeFileSync(tmpPath, scriptLines.join('\n'), 'utf-8');
          exec(`osascript "${tmpPath}"`, () => {
            setTimeout(() => { try { fs.unlinkSync(tmpPath); } catch (_) {} }, 3000);
          });
        });
      } else {
        // Windows: use Windows Terminal
        const baseTs = Date.now();
        runtimeCommandItems.forEach((item, index) => {
          const tempBatPath = path.join("./data/api/project/project", `sf-notes-start-${projectId}-${baseTs}-${index}-${Math.random().toString(16).slice(2, 8)}.bat`);
          const driveLetter = projectRootPath.match(/^([A-Za-z]:)/);
          const batLines = [];
          if (driveLetter) batLines.push(driveLetter[1]);
          batLines.push(`cd ${projectRootPath}`, item.command);
          const batContent = batLines.join('\r\n');
          fs.writeFileSync(tempBatPath, batContent, 'utf-8');
          const tabTitle = item.name || `${projectName}-${index}`;
          exec(`wt -w 0 new-tab --title "${tabTitle}" cmd /k "\\"${path.resolve(tempBatPath)}\\""`, { windowsHide: true });
          delBat(tempBatPath);
        });
        function delBat(filePath) {
          setTimeout(() => { try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (error) { console.error('删除临时 BAT 文件失败:', error); } }, 3000);
        }
      }

      return { isWrite: false, response: { code: 200, data: { success: true, data: true } } };
    } catch (error) {
      return { isWrite: false, response: { code: 200, data: { success: false, message: '启动失败: ' + error.message } } };
    }
  };
})();
