(function () {
  return function (argData, argParams, external) {
    const { domain, crateTime } = argParams.domainItem;
    argData.swaggerList = argData.swaggerList.filter(
      (item) => item.domain !== domain
    );

    //删除关注列表中的信息
    argData.attentionPathList = argData.attentionPathList.filter(
      (item) => item.domain !== domain
    );
    //删除对应文件
    const fs = require("fs");
    const path = require("path");
    console.log(__filename, __dirname);
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
