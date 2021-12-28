(function () {
  return function (argData, argParams, external) {
    //argData 数据的副本
    const lodash = require("lodash");
    argData = external.getBaseStructure(argData);
    argParams.forEach((menuCheckbox) => {
      const isSaved = argData.attentionPathList.some((item) =>
        lodash.isEqual(item, menuCheckbox)
      );
      if (!isSaved) {
        argData.attentionPathList.push(menuCheckbox);
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
