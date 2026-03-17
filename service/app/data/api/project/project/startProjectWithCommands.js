(function () {
  return function (argData, argParams, external) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const { execSync } = require('child_process');
    const { projectId, projectName } = argParams;

    if (!projectId || !projectName) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: '参数错误'
          }
        }
      };
    }

    const projectIndex = argData.projectList.findIndex((item) => item.id === projectId);
    if (projectIndex === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: '项目不存在'
          }
        }
      };
    }

    try {
      const project = argData.projectList[projectIndex];
      const projectRootPath = String(project.rootPath || '').trim();
      const runtimeCommands = (((project.startConfig || {}).commands || []).map((cmd) => String(cmd || '').trim()).filter(Boolean);
      if (!projectRootPath || !runtimeCommands.length) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: {
              success: false,
              message: '项目未配置启动命令'
            }
          }
        };
      }

      const tempBatPath = path.join(
        os.tmpdir(),
        `sf-notes-start-${projectId}-${Date.now()}.bat`
      );
      const batContent = ['@echo off', `cd /d "${projectRootPath}"`, ...runtimeCommands].join('\r\n');
      fs.writeFileSync(tempBatPath, batContent, 'utf-8');
      execSync(`start "${projectName}" "${tempBatPath}"`, { windowsHide: true });
      setTimeout(() => {
        try {
          if (fs.existsSync(tempBatPath)) {
            fs.unlinkSync(tempBatPath);
          }
        } catch (error) {}
      }, 1000);

      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            data: true
          }
        }
      };
    } catch (error) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: '启动失败: ' + error.message
          }
        }
      };
    }
  };
})();
