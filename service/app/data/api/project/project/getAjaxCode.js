(function () {
  return function (argData, argParams, external) {
    argData = external.getBaseStructure(argData);
    external.createSwaggerFolder();
    const fs = require("fs");
    const path = require("path");
    const swaggerInfos = {};
    argData.swaggerList.forEach((item) => {
      swaggerInfos[item.domain] = JSON.parse(
        fs
          .readFileSync(
            path.join(external.getSwaggerFolderPath(), item.id + ".json")
          )
          .toString()
      ).data;
    });

    argParams.checkedPathList.forEach((pathInfos) => {
      if (!pathInfos.data) {
        pathInfos.data =
          swaggerInfos[pathInfos.domain][pathInfos.groupName].tags[
            pathInfos.tagName
          ].paths[pathInfos.pathUrl];
      }
    });
    external.createGenerateAjaxCodeJs(argParams.projectName);

    const ajaxCodeWrap = eval(
      fs
        .readFileSync(
          external.getProjecGenerateAjaxCodePath(argParams.projectName),
          "utf-8"
        )
        .toString()
    )(argParams.checkedPathList, argData.apiPrefixs, external);

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list: ajaxCodeWrap || [],
        },
      },
    };
  };
})();
