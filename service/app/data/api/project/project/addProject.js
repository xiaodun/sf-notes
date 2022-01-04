(function () {
  return function (argData, argParams, external) {
    const path_os = require("path");
    const fs_os = require("fs");
    argData = external.getBaseStructure(argData);
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
      argParams.name = argParams.rootPath.split("\\").pop();
      argParams.id = Date.now();
      if (argParams.name === "sf-mock") {
        //如果添加的项目是sf-mock

        // 获得相关资源

        const programConfigPath = path_os.join(
          argParams.rootPath,
          "config",
          "programConfig.js"
        );
        const programConfigObj = eval(
          fs_os.readFileSync(programConfigPath, "utf-8")
        );
        const serviceConfigPath = path_os.join(
          argParams.rootPath,
          "config",
          "serviceConfig.js"
        );
        const serviceConfigObj = eval(
          fs_os.readFileSync(serviceConfigPath, "utf-8")
        );

        // 对已添加的项目统一处理
        argData.projectList.forEach((item) => {
          const mockConfig = programConfigObj[item.name];
          //写入启动命令的地址
          if (
            mockConfig.WindowsTerminal &&
            mockConfig.WindowsTerminal.tabList
          ) {
            const tabList = mockConfig.WindowsTerminal.tabList;
            const selfStartConfig = tabList.find((item) => item.isSelf);
            let serviceObj;
            if (mockConfig.serverList) {
              serviceObj = mockConfig.serverList.find((item) => item.isMock);
            }
            if (selfStartConfig) {
              item.isSfMock = false;
              item.sfMock = {
                nginxPort: serviceObj ? serviceObj.port : "",
                addressPath: mockConfig.addressPath || "",
                programUrl: mockConfig.programUrl,
                startBatPath: path_os.join(
                  argParams.rootPath,
                  "bat",
                  `${item.name}.bat`
                ),
              };
              //计算openUrl
              let { programUrl, addressPath, nginxPort } = item.sfMock;
              if (nginxPort) {
                programUrl = `http://${ip}:${nginxPort}`;
              }
              item.sfMock.openUrl = programUrl + addressPath;
            }
          }
        });
        argParams.isSfMock = true;
        argParams.closeAjaxCode = true;
        argParams.sfMock = {
          programUrl: `http://localhost:${serviceConfigObj.startPort}`,
          startBatPath: path_os.join(argParams.rootPath, "bat", "sf-mock.bat"),
        };
      } else {
        const sfMockPrject = argData.projectList.find(
          (item) => item.name == "sf-mock"
        );
        if (sfMockPrject) {
          //sf-mock是否已被添加
          const programConfigPath = path_os.join(
            sfMockPrject.rootPath,
            "config",
            "programConfig.js"
          );

          const programConfigObj = eval(
            fs_os.readFileSync(programConfigPath, "utf-8")
          );

          const mockConfig = programConfigObj[argParams.name];

          if (mockConfig) {
            //为新添加的项目写入sf-mock涉及到的配置
            let serviceObj;
            if (mockConfig.serverList) {
              serviceObj = mockConfig.serverList.find((item) => item.isMock);
            }
            if (
              mockConfig.WindowsTerminal &&
              mockConfig.WindowsTerminal.tabList
            ) {
              const tabList = mockConfig.WindowsTerminal.tabList;
              const selfStartConfig = tabList.find((item) => item.isSelf);

              if (selfStartConfig) {
                argParams.isSfMock = false;
                argParams.sfMock = {
                  nginxPort: serviceObj ? serviceObj.port : "",
                  addressPath: mockConfig.addressPath,
                  programUrl: mockConfig.programUrl,
                  startBatPath: path_os.join(
                    sfMockPrject.rootPath,
                    "bat",
                    `${argParams.name}.bat`
                  ),
                };
                //计算openUrl
                let { programUrl, addressPath, nginxPort } = argParams.sfMock;
                if (nginxPort) {
                  programUrl = `http://${ip}:${nginxPort}`;
                }
                argParams.sfMock.openUrl = programUrl + addressPath;
              }
            }
          }
        }
      }
      argData.projectList.push(argParams);
      return {
        isWrite: true,
        data: argData,
        response: {
          code: 200,
          data: {
            success: true,
            message: "添加成功",
          },
        },
      };
    }
  };
})();
