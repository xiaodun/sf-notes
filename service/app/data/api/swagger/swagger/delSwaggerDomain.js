(function () {
  return function (argData, argParams, external) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
    const { domain, crateTime } = argParams.domainItem;
    argData.swaggerList = argData.swaggerList.filter(
      (item) => item.domain !== domain
    );
    argData.attentionPathList = argData.attentionPathList.filter(
      (item) => item.domain !== domain
    );
    const fs = require("fs");
    const path = require("path");
    const swaggerDocPath = path.join(
      external.getSwaggerFolderPath(),
      `${crateTime}.json`
    );
    fs.unlinkSync(swaggerDocPath);

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
