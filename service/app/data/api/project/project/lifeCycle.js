(function () {
  return function () {
    const commonList = ["c://sf-mobile-web", "/player", "/movie"];
    let pathList = [...commonList];
    pathList.splice(3, 0, "/system");
    let userPathList = [...commonList];
    userPathList.splice(3, 0, "/user");

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
            };
          }

          return argData;
        };
      },
    };
  };
})();
