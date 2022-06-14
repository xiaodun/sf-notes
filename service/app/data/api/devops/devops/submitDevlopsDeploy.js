(function () {
  return function (argData, argParams, external) {
    const qs = require("qs");

    if (argParams.noticePersonList) {
      argData.config.lastOptionNoticePersonList = argParams.noticePersonList;
    }
    const request = require("sync-request");
    let env = argParams.env;
    if (env === "develop") {
      env = "dev";
    }
    let params = {
      env,
      deployData: argParams.deployData,
      updatemsg: "{}",
      operator: argParams.operator,
    };

    const rsp = request(
      "POST",
      argData.config.devopsAjaxPrefx + "/saveDeploy",
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
    return {
      isWrite: false,
      //data:argData,
      response: {
        code: 200,
        data: {
          success: res.code == 200,
          message: res.msg,
        },
      },
    };
  };
})();
