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
      try {
        pathInfos.data =
          swaggerInfos[pathInfos.domain][pathInfos.groupName].tags[
            pathInfos.tagName
          ].paths[pathInfos.pathUrl];
      } catch (error) {
        console.error(error);
        pathInfos.data = {
          notFound: true,
        };
      }
    });
    let groupInfos = {};
    let hasMoreGroup = false;
    // 如果关注列表涉及到多个分组则进行归类
    if (argData.attentionPathList.length > 1) {
      const firstGroupName = argData.attentionPathList[0].groupName;
      const hasDifferentName = argData.attentionPathList.some(
        (item) => item.groupName !== firstGroupName
      );
      if (hasDifferentName) {
        hasMoreGroup = true;
        argData.attentionPathList.forEach((item) => {
          if (!groupInfos[item.groupName]) {
            groupInfos[item.groupName] = [];
          }
          groupInfos[item.groupName].push(item);
        });
      }
    }
    return {
      isWrite: false, //是否覆盖数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          data: {
            hasMoreGroup,
            list: argData.attentionPathList,
            groupInfos,
          },
        },
      },
    };
  };
})();
