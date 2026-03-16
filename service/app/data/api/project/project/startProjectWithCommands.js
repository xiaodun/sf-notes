(function () {
  return function (argData, argParams, external) {
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
    
    const { projectId, projectName, commands } = argParams;
    
    if (!projectId || !projectName || !commands || !Array.isArray(commands)) {
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
    
    try {
      // 生成 bat 文件内容
      const batContent = commands.map(cmd => cmd.trim()).filter(cmd => cmd).join('\n');
      
      if (!batContent) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: {
              success: false,
              message: '请至少填写一个启动命令'
            }
          }
        };
      }
      
      // 生成持久的启动脚本路径
      const batDir = path.join(__dirname, 'start_scripts');
      if (!fs.existsSync(batDir)) {
        fs.mkdirSync(batDir);
      }
      const batPath = path.join(batDir, `start_${projectId}.bat`);
      
      // 写入 bat 文件
      fs.writeFileSync(batPath, batContent);
      
      // 执行 bat 文件
      execSync(`start "${projectName}" "${batPath}"`, { windowsHide: true });
      
      // 保存配置到项目
      const projectIndex = argData.projectList.findIndex(item => item.id === projectId);
      if (projectIndex !== -1) {
        argData.projectList[projectIndex].sfMock = {
          ...argData.projectList[projectIndex].sfMock,
          startCommands: commands,
          startBatPath: batPath,
          programUrl: 'http://localhost:3000' // 临时值，实际应该根据项目配置
        };
      }
      
      return {
        isWrite: true,
        data: argData,
        response: {
          code: 200,
          data: {
            success: true,
            data: true
          }
        }
      };
    } catch (error) {
      console.error('启动项目失败:', error);
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
