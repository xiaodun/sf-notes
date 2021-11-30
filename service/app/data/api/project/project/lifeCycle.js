(function () {
  return function () {
    const commonList = ["c://sf-mobile-web", "/player", "/movie"];
    let pathList = [...commonList];
    pathList.splice(3, 0, "/system");
    let userPathList = [...commonList];
    userPathList.splice(3, 0, "/user");
    const fs = require("fs");
    const swaggerFolderpath = "./data/api/project/project/swagger";
    return {
      createFloder: function (createFloder, external) {
        external.getBaseStructure = (argData) => {
          if (!argData) {
            return {
              command: {
                menuList: [
                  {
                    name: "通用命令",
                  },
                ],
              },
              projectList: [],
              swaggerList: [],
            };
          }

          return argData;
        };
        external.getSwaggerFolderPath = () => {
          return swaggerFolderpath;
        };
        external.createSwaggerFolder = () => {
          if (!fs.existsSync(swaggerFolderpath)) {
            fs.mkdirSync(swaggerFolderpath);
          }
        };
      },
    };
  };
})();
