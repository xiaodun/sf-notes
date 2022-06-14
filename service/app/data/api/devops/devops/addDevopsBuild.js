(function () {
  return function (argData, argParams, external) {
    const qs = require("qs");

    argData.config.lastOptionProjectNameList = argParams.projectNameList;
    argData.config.lastOptionEnvId = argParams.envId;
    const request = require("sync-request");
    const execResultList = [];
    let buildInfos = {};
    let hasError = false;
    argParams.projectNameList.forEach((projectName) => {
      let params = {
        branch: argParams.branch,
        projectid: argData.projectInfos[projectName].id,
        updatemsg: "{}",
        operator: argParams.operator,
      };
      const rsp = request(
        "POST",
        argData.config.devopsAjaxPrefx + "/buildProject",
        {
          headers: {
            Authorization: encodeURIComponent(argData.config.devopsToken),
          },
          body: external.encrypt(qs.stringify(params)),
        }
      );
      const res = JSON.parse(
        external.decrypt(JSON.parse(rsp.body.toString("utf8")).result)
      );

      console.log("/buildProject", res);

      if (res.code != 200) {
        hasError = true;
        execResultList.push({
          success: false,
          title: projectName,
          errorMsg: res.msg,
        });
      } else {
        execResultList.push({
          success: true,
          title: projectName,
        });
      }
      let step = "submitSuccess";
      if (res.msg.includes("请勿重复提交")) {
        step = "waitSubmit";
      }
      buildInfos[projectName] = {};
      buildInfos[projectName][argParams.branch] = {
        step,
      };
    });
    argData.buildList.push(buildInfos);

    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: !hasError,
          data: {
            execResultList,
          },
        },
      },
    };
  };
})();
