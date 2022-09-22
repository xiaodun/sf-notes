(function () {
  return function (argData, argParams, external) {
    const path_os = require("path");
    const fs_os = require("fs");
    const isExist = argData.projectList.some(
      (item) => item.rootPath === argParams.rootPath
    );
    let ip = "";
    let network = os.networkInterfaces();
    for (let key in network) {
      let env = network[key];
      for (var i = 0; i < env.length; i++) {
        if (env[i].family == "IPv4" && env[i].address != "127.0.0.1") {
          ip = env[i].address;
        }
      }
    }
    //数据初始化
    argParams.sfMock = {};

    if (isExist) {
      //不能重复添加
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "项目已存在",
          },
        },
      };
    } else {
      if (!argParams.isUpdate) {
        argParams.name = argParams.rootPath.split("\\").pop();
        argParams.id = Date.now();
        argData.projectList.push(argParams);
      }

      // 更新配置
      const sfMockPrject = argData.projectList.find(
        (item) => item.name == "sf-mock"
      );
      if (sfMockPrject) {
        const programConfigPath = path_os.join(
          sfMockPrject.rootPath,
          "config",
          "programConfig.js"
        );
        const commonUtils = require(path_os.join(
          sfMockPrject.rootPath,
          "utils",
          "commonUtils.js"
        ));
        const programConfigObj = eval(
          fs_os.readFileSync(programConfigPath, "utf-8")
        );
        const serviceConfigPath = path_os.join(
          sfMockPrject.rootPath,
          "config",
          "serviceConfig.js"
        );
        const serviceConfigObj = eval(
          fs_os.readFileSync(serviceConfigPath, "utf-8")
        );
        // 对已添加的项目统一处理
        for (let i = 0; i < argData.projectList.length; i++) {
          let item = argData.projectList[i];
          if (item.name === "sf-mock") {
            //如果添加的项目是sf-mock
            item.isSfMock = true;
            item.sfMock = {
              programUrl: `http://localhost:${serviceConfigObj.startPort}`,
              startBatPath: path_os.join(item.rootPath, "bat", "sf-mock.bat"),
            };
          } else {
            const mockConfig = programConfigObj[item.name];
            if (!mockConfig) {
              return {
                response: {
                  code: 200,
                  data: {
                    success: false,
                    message: `sf-mock的programConfig.js文件缺少${item.name}的基础配置`,
                  },
                },
              };
            }

            //写入启动命令的地址
            item.sfMock.serverList = (mockConfig.serverList || []).map(
              (serverConfig) => {
                const getVisitUrl = (url) =>
                  `http://${url}:${serverConfig.port}${
                    mockConfig.addressPath || ""
                  }`;
                return {
                  ...serverConfig,
                  openUrl: getVisitUrl(ip),
                  openDomainUrl: getVisitUrl(
                    commonUtils.getProxyDomain(serverConfig, item.name)
                  ),
                };
              }
            );

            item.sfMock.serverList.push({
              name: "本地链接",
              openUrl: mockConfig.programUrl + (mockConfig.addressPath || ""),
            });
            if (
              mockConfig.WindowsTerminal &&
              mockConfig.WindowsTerminal.tabList
            ) {
              const tabList = mockConfig.WindowsTerminal.tabList;
              const selfStartConfig = tabList.find((item) => item.isSelf);

              if (selfStartConfig) {
                item.isSfMock = false;
                item.sfMock = {
                  ...item.sfMock,
                  addressPath: mockConfig.addressPath || "",
                  programUrl: mockConfig.programUrl,
                  startBatPath: path_os.join(
                    sfMockPrject.rootPath,
                    "bat",
                    `${item.name}.bat`
                  ),
                };
              }
            }
          }
        }
      }
      return {
        isWrite: true,
        data: argData,
        response: {
          code: 200,
          data: {
            success: true,
          },
        },
      };
    }
  };
})();
