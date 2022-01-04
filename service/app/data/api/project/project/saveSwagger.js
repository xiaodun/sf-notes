(function () {
  return function (argData, argParams, external) {
    const fs = require("fs");
    const path = require("path");
    argData = external.getBaseStructure(argData);

    let swaggerInfo;
    if (argParams.way === "add") {
      const index = argData.swaggerList.findIndex(
        (item) => item.domain === argParams.domain
      );
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
    } else if (argParams.way === "update") {
      const index = argData.swaggerList.findIndex(
        (item) => item.domain === argParams.oldDomainName
      );
      swaggerInfo = argData.swaggerList[index];
      swaggerInfo.updateTime = Date.now();
      fs.writeFileSync(
        path.join(external.getSwaggerFolderPath(), swaggerInfo.id + ".json"),
        JSON.stringify(
          { data: argParams.data, domain: argParams.domain },
          null,
          2
        )
      );
      if (swaggerInfo.domain !== argParams.domain) {
        //覆盖的是另一个域名
        swaggerInfo.domain = argParams.domain;
        //处理关注列表

        argData.attentionPathList
          .filter((item) => item.domain === argParams.oldDomainName)
          .forEach((item) => {
            item.domain = argParams.domain;
          });
      }
    }

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
