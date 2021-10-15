(function () {
  return function (argData, argParams, external) {
    const path_os = require("path");
    const fs_os = require("fs");
    argData = external.getBaseStructure(argData);
    const isExist = argData.projectList.some(
      (item) => item.rootPath === argParams.rootPath
    );
    if (isExist) {
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

        argData.projectList.forEach((item) => {
          const mockConfig = programConfigObj[item.name];

          if (
            mockConfig.WindowsTerminal &&
            mockConfig.WindowsTerminal.tabList
          ) {
            const tabList = mockConfig.WindowsTerminal.tabList;
            const selfStartConfig = tabList.find((item) => item.isSelf);
            if (selfStartConfig) {
              item.isSfMock = false;
              item.sfMock = {
                programUrl: mockConfig.programUrl,
                startBatPath: path_os.join(
                  argParams.rootPath,
                  "bat",
                  `${item.name}.bat`
                ),
              };
            }
          }
        });
        argParams.isSfMock = true;
        argParams.sfMock = {
          programUrl: `http://localhost:${serviceConfigObj.startPort}`,
          startBatPath: path_os.join(argParams.rootPath, "bat", "sf-mock.bat"),
        };
      } else {
        const sfMockPrject = argData.projectList.find(
          (item) => item.name == "sf-mock"
        );
        if (sfMockPrject) {
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
            if (
              mockConfig.WindowsTerminal &&
              mockConfig.WindowsTerminal.tabList
            ) {
              const tabList = mockConfig.WindowsTerminal.tabList;
              const selfStartConfig = tabList.find((item) => item.isSelf);

              if (selfStartConfig) {
                argParams.isSfMock = false;
                argParams.sfMock = {
                  programUrl: mockConfig.programUrl,
                  startBatPath: path_os.join(
                    sfMockPrject.rootPath,
                    "bat",
                    `${argParams.name}.bat`
                  ),
                };
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
