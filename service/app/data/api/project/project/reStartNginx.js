(function () {
  return function (argData, argParams, external) {
    const path = require("path");
    const file_os = require("fs");
    const child_process = require("child_process");
    const projectList = (argData && argData.projectList) || [];
    const sfMockConfig = projectList.find((item) => item.isSfMock);
    function fail(message, extra) {
      const detail = {
        tag: "reStartNginx",
        message,
        rootPath: sfMockConfig && sfMockConfig.rootPath,
        extra: extra || {},
      };
      console.error("[reStartNginx] failed", JSON.stringify(detail, null, 2));
      return {
        response: {
          code: 200,
          data: {
            success: false,
            message,
          },
        },
      };
    }
    if (!sfMockConfig || !sfMockConfig.rootPath) {
      return fail("未找到 sf-mock 项目路径");
    }
    const generateFolderPath = path.join(sfMockConfig.rootPath, "generate");
    const nginxFolderPath = path.join(sfMockConfig.rootPath, "nginx-1.19.6");
    const writeConfigPath = path.join(generateFolderPath, "writeNginxConfig.js");
    const nginxExePath = path.join(nginxFolderPath, "nginx.exe");
    if (!file_os.existsSync(writeConfigPath)) {
      return fail("writeNginxConfig.js 不存在", { writeConfigPath });
    }
    if (!file_os.existsSync(nginxExePath)) {
      return fail("nginx.exe 不存在", { nginxExePath });
    }
    let restartWarningMessage = "";
    try {
      const killRsp = child_process.spawnSync("taskkill", ["/f", "/t", "/im", "nginx.exe"], {
        windowsHide: true,
        stdio: "pipe",
        encoding: "utf8",
      });
      function runWriteConfig(extraEnv) {
        return child_process.spawnSync("node", ["writeNginxConfig.js"], {
          cwd: generateFolderPath,
          windowsHide: true,
          stdio: "pipe",
          encoding: "utf8",
          env: Object.assign({}, process.env, extraEnv || {}),
        });
      }
      let writeConfigRsp = runWriteConfig();
      if (writeConfigRsp.status !== 0) {
        const errText = String(writeConfigRsp.stderr || writeConfigRsp.stdout || "");
        const isHostsPermissionError =
          errText.indexOf("EPERM") !== -1 &&
          errText.toLowerCase().indexOf("\\windows\\system32\\drivers\\etc\\hosts") !== -1;
        if (isHostsPermissionError) {
          const retryRsp = runWriteConfig({ SF_MOCK_SKIP_HOSTS_WRITE: "1" });
          if (retryRsp.status === 0) {
            restartWarningMessage = "hosts 写入无权限，已跳过 hosts 更新并完成 nginx 重启";
            console.warn("[reStartNginx] hosts write skipped", JSON.stringify({
              rootPath: sfMockConfig.rootPath,
              generateFolderPath,
            }));
            writeConfigRsp = retryRsp;
          } else {
            writeConfigRsp = retryRsp;
          }
        }
      }
      if (writeConfigRsp.status !== 0) {
        return fail(
          writeConfigRsp.stderr || writeConfigRsp.stdout || "写入 nginx 配置失败",
          {
            command: "node writeNginxConfig.js",
            cwd: generateFolderPath,
            status: writeConfigRsp.status,
            stderr: writeConfigRsp.stderr,
            stdout: writeConfigRsp.stdout,
            killStatus: killRsp.status,
            killStderr: killRsp.stderr,
            killStdout: killRsp.stdout,
          }
        );
      }
      const nginxProcess = child_process.spawn(nginxExePath, [], {
        cwd: nginxFolderPath,
        windowsHide: true,
        detached: true,
        stdio: "ignore",
      });
      nginxProcess.unref();
      child_process.spawnSync("powershell", ["-NoProfile", "-Command", "Start-Sleep -Milliseconds 600"], {
        windowsHide: true,
        stdio: "ignore",
      });
      const tasklistRsp = child_process.spawnSync(
        "tasklist",
        ["/fi", "imagename eq nginx.exe", "/fo", "csv", "/nh"],
        {
          windowsHide: true,
          stdio: "pipe",
          encoding: "utf8",
        }
      );
      const output = String(tasklistRsp.stdout || "").toLowerCase();
      if (tasklistRsp.status !== 0 || output.indexOf("nginx.exe") === -1) {
        return fail("nginx 未成功启动", {
          command: "nginx.exe",
          cwd: nginxFolderPath,
          tasklistStatus: tasklistRsp.status,
          tasklistStderr: tasklistRsp.stderr,
          tasklistStdout: tasklistRsp.stdout,
          killStatus: killRsp.status,
          killStderr: killRsp.stderr,
          killStdout: killRsp.stdout,
        });
      }
    } catch (error) {
      return fail(error.message || "重启 nginx 失败", {
        stack: error.stack,
      });
    }
    console.log("[reStartNginx] success", JSON.stringify({
      rootPath: sfMockConfig.rootPath,
      nginxFolderPath,
      generateFolderPath,
    }));
    return {
      response: {
        code: 200,
        data: {
          success: true,
          message: restartWarningMessage || "",
        },
      },
    };
  };
})();
