(function () {
  const url = require("url");
  return function () {
    const child_process = require("child_process");

    return {
      createFloder: function (createFloder, external) {
        external.execGitCommad = function (argList = [], cwd) {
          const list = [];
          for (let i = 0; i < argList.length; i++) {
            //统一转换为对象
            const item =
              typeof argList[i] === "string"
                ? { commond: argList[i] }
                : argList[i];
            const spawn = child_process.spawnSync(
              "git",
              item.commond.split(" ").filter(Boolean),
              {
                cwd,
              }
            );

            if (item.isRecordStdout) {
              //记录执行正确的信息
              const successMsg = spawn.stdout.toString().trim();
              if (successMsg) {
                list.push(successMsg);
              }
            } else {
              const errorMsg = spawn.stderr.toString().trim();
              if (errorMsg) {
                list.push(errorMsg);
              }
            }
          }

          return list;
        };
        external.getCurrentBranchName = function (cwd) {
          const spawn = child_process.spawnSync(
            "git",
            ["symbolic-ref", "--short", "HEAD"],
            {
              cwd,
            }
          );

          return spawn.stdout.toString().trim();
        };
        external.getEnvUrl = function (systemTagConfig, env) {
          const urlInfos = new URL(systemTagConfig.url);
          if (env !== "master") {
            const hostBodyList = urlInfos.host.split(".");
            let newHost;
            if (systemTagConfig.isAddHead) {
              hostBodyList.unshift(env);
              newHost = hostBodyList.join(".");
            } else {
              hostBodyList[0] += "-" + env;
              newHost = hostBodyList.join(".");
            }
            urlInfos.host = newHost;
          }
          systemTagConfig.address[env] = urlInfos.toString();
        };
      },
    };
  };
})();
