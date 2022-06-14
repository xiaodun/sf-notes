(function () {
  return function (argData, argParams, external) {
    const projectNameList = argParams.projectList.map((item) => item.name);
    const request = require("sync-request");
    const rsp = request(
      "GET",
      argData.config.devopsAjaxPrefx + "/getProjectTree",
      {
        headers: {
          Authorization: encodeURIComponent(argData.config.devopsToken),
        },
      }
    );

    const list = JSON.parse(
      external.decrypt(JSON.parse(rsp.body.toString("utf8")).result)
    ).projectTree;
    argData.projectInfos = {};
    list.forEach((sub) => {
      if (sub.children) {
        sub.children.forEach((item) => {
          if (projectNameList.includes(item.title)) {
            argData.projectInfos[item.title] = {
              id: item.key.split("-")[1],
            };
          }
        });
      }
    });
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
