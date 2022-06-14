(function () {
  return function (argData, argParams, external) {
    const projectNameList = argParams.projectList.map((item) => item.name);
    let projectData = {};
    argParams.projectList.forEach((item) => (projectData[item.name] = {}));
    const request = require("sync-request");
    const rsp = request(
      "GET",
      argData.config.devopsAjaxPrefx + "/getDeployList",
      {
        headers: {
          Authorization: encodeURIComponent(argData.config.devopsToken),
        },
      }
    );
    const data = rsp.body.toString("utf8");

    const list = JSON.parse(
      external.decrypt(JSON.parse(data).result)
    ).deploys.filter((item) => {
      item.projectList = JSON.parse(item.project);
      delete item.project;
      return projectNameList.some((name) =>
        item.projectList.some((child) => child.name == name)
      );
    });
    return {
      response: {
        code: 200,
        data: {
          success: false,
          data: {
            list,
          },
        },
      },
    };
  };
})();
