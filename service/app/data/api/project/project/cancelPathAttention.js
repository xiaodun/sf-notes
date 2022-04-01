(function () {
  return function (argData, argParams, external) {
    const lodash = require("lodash");
    argData = external.getBaseStructure(argData);
    argParams.forEach((menuCheckbox) => {
      delete menuCheckbox.data;
      const index = argData.attentionPathList.findIndex((item) =>
        lodash.isEqual(item, menuCheckbox)
      );
      if (index != -1) {
        argData.attentionPathList.splice(index, 1);
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
