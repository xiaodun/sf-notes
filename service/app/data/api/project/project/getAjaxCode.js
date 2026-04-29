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

    argParams.checkedPathList.forEach((pathInfos) => {
      if (!pathInfos.data) {
        const paths =
          swaggerInfos[pathInfos.domain][pathInfos.groupName].tags[
            pathInfos.tagName
          ].paths;
        pathInfos.data = pickPathData(paths, pathInfos);
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
