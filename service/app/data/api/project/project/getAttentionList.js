(function () {
  return function (argData, argParams, external) {
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
      if (!pathInfos.data) {
        pathInfos.data = {
          notFound: true,
        };
      }
    });
    let tagInfos = {};
    let hasMoreTag = false;
    // 如果关注列表涉及到多个分组则进行归类
    if (argData.attentionPathList.length > 1) {
      const firstTagName = argData.attentionPathList[0].tagName;
      const hasDifferentName = argData.attentionPathList.some(
        (item) => item.tagName !== firstTagName
      );
      if (hasDifferentName) {
        hasMoreTag = true;
        argData.attentionPathList.forEach((item) => {
          if (!tagInfos[item.tagName]) {
            tagInfos[item.tagName] = [];
          }
          tagInfos[item.tagName].push(item);
        });
      }
    }
    return {
      response: {
        code: 200,
        data: {
          success: true,
          data: {
            hasMoreTag,
            list: argData.attentionPathList,
            tagInfos,
          },
        },
      },
    };
  };
})();
