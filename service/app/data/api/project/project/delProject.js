(function () {
  return function (argData, argParams, external) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, projectList: [], inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
    const index = argData.projectList.findIndex(
      (item) => item.id == argParams.id
    );

    argData.projectList.splice(index, 1);

    const path = require("path");
    const fs = require("fs");
    const snippetFloderPath = external.getSnippetFolder(argParams.name);
    if (fs.existsSync(snippetFloderPath)) {
      fs.readdirSync(snippetFloderPath).forEach((filePath) => {
        fs.unlinkSync(path.join(snippetFloderPath, filePath));
      });

      fs.rmdirSync(snippetFloderPath);
    }
    const ajaxCodePath = external.getProjecGenerateAjaxCodePath(argParams.name);
    if (fs.existsSync(ajaxCodePath)) {
      fse.unlinkSync(ajaxCodePath);
    }
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
