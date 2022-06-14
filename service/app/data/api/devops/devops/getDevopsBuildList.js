(function () {
  return function (argData, argParams, external) {
    const projectNameList = argParams.projectList.map((item) => item.name);
    let projectData = {};
    argParams.projectList.forEach((item) => (projectData[item.name] = {}));
    const request = require("sync-request");
    const rsp = request(
      "GET",
      argData.config.devopsAjaxPrefx + "/getBuildList",
      {
        headers: {
          Authorization: encodeURIComponent(argData.config.devopsToken),
        },
      }
    );

    const data = rsp.body.toString("utf8");

    if (data.includes("Unauthorized")) {
      return {
        response: {
          code: 200,
          data: {
            success: false,
            data: {
              needLogin: true,
            },
          },
        },
      };
    } else {
      let list = JSON.parse(external.decrypt(JSON.parse(data).result))
        .Builds.filter((item) => projectNameList.includes(item.projectname))
        .map((item) => {
          const statusName = item.status;
          let status = item.status;
          if (statusName === "等待构建") {
            status = "wait";
          } else if (statusName === "构建中") {
            status = "building";
          } else if (statusName === "构建成功") {
            status = "success";
          } else if (statusName === "构建失败") {
            status = "fail";
          }

          if (!projectData[item.projectname][item.branch]) {
            projectData[item.projectname][item.branch] = {};
          }
          if (
            item.image &&
            !projectData[item.projectname][item.branch].isNewImage
          ) {
            //存在镜像则要判断是否为最新的
            projectData[item.projectname][item.branch].isNewImage = true;
            item.isNewImage = true;
          }

          return {
            ...item,
            status,
            statusName,
          };
        });
      return {
        response: {
          code: 200,
          data: {
            success: true,
            data: {
              list,
            },
          },
        },
      };
    }
  };
})();
