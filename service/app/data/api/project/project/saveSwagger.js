(function () {
  return function (argData, argParams, external) {
    const fs = require("fs");
    const path = require("path");
    argData = external.getBaseStructure(argData);
    const index = argData.swaggerList.findIndex(
      (item) => item.domain === argParams.domain
    );
    let swaggerInfo;
    if (index !== -1) {
      swaggerInfo = argData.swaggerList[index];
      swaggerInfo.updateTime = Date.now();
    } else {
      swaggerInfo = {
        domain: argParams.domain,
        id: Date.now(),
        crateTime: Date.now(),
      };
      argData.swaggerList.push(swaggerInfo);
    }
    fs.writeFileSync(
      path.join(external.getSwaggerFolderPath(), swaggerInfo.id + ".json"),
      JSON.stringify(argParams, null, 2)
    );
    return {
      isWrite: true, //是否覆盖数据
      data: argData, //需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
