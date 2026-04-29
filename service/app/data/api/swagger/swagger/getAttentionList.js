(function () {
  return function (argData, argParams, external) {
    external.createSwaggerFolder();
    const fs = require("fs");
    const path = require("path");
    const HTTP_ORDER = [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "head",
      "trace",
    ];
    function pickPathData(paths, pathInfos) {
      if (!paths || typeof paths !== "object") return null;
      if (pathInfos.pathKey && paths[pathInfos.pathKey]) {
        return paths[pathInfos.pathKey];
      }
      const pu = pathInfos.pathUrl;
      if (pu && paths[pu]) return paths[pu];
      const keys = Object.keys(paths);
      const matches = keys.filter((k) => paths[k] && paths[k].pathUrl === pu);
      if (matches.length === 1) return paths[matches[0]];
      if (matches.length > 1 && pathInfos.method) {
        const want = String(pathInfos.method).toLowerCase() + ":" + pu;
        if (paths[want]) return paths[want];
      }
      if (matches.length > 1) {
        for (const m of HTTP_ORDER) {
          const k = m + ":" + pu;
          if (paths[k]) return paths[k];
        }
      }
      return null;
    }
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
        const paths =
          swaggerInfos[pathInfos.domain][pathInfos.groupName].tags[
            pathInfos.tagName
          ].paths;
        pathInfos.data = pickPathData(paths, pathInfos);
      } catch (error) {
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
