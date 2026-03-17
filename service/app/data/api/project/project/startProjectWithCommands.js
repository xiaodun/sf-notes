(function () {
  return function (argData, argParams, external) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const { exec } = require('child_process');
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
      const runtimeCommands = ((project.startConfig || {}).commands || []).map((cmd) => String(cmd || '').trim()).filter(Boolean);
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

      const baseTs = Date.now();
      runtimeCommands.forEach((cmd, index) => {
        const tempBatPath = path.join(
          "./data/api/project/project",
          `sf-notes-start-${projectId}-${baseTs}-${index}-${Math.random()
            .toString(16)
            .slice(2, 8)}.bat`
        );
        const batContent = [`cd ${projectRootPath}`, cmd].join('\r\n');
        fs.writeFileSync(tempBatPath, batContent, 'utf-8');
        exec(`wt -w 0 new-tab --title "${projectName}-${index + 1}" cmd /k "${ path.resolve(tempBatPath)}"`, { windowsHide: true });
        delBat(tempBatPath);
      });

      function delBat(filePath){
        console.log('wx',filePath)
        setTimeout(() => {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (error) {
            console.error('删除临时 BAT 文件失败:', error);
          }
        }, 3000);
      }

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
