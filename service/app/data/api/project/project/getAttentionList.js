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

    argData.attentionPathList.forEach((pathInfos) => {
      pathInfos.data =
        swaggerInfos[pathInfos.domain][pathInfos.groupName].tags[
          pathInfos.tagName
        ].paths[pathInfos.pathUrl];
    });
    return {
      isWrite: false, //是否覆盖数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          list: argData.attentionPathList,
        },
      },
    };
  };
})();
