(function () {
  return function (argData, argParams, external) {
    const project = argData.projectList.find(
      (item) => item.id == argParams.data.id
    );
    const fs = require("fs");
    const snippetScriptPath = external.getSnippetScriptPath(
      project.name,
      argParams.data.script
    );
    const sctiptContent = fs.readFileSync(snippetScriptPath).toString();
    const data = eval(sctiptContent)(argParams.values);
    data.fragmentList.forEach((item) => {
      if (item.getTemplate) {
        item.noTemplate = false;
      } else {
        item.noTemplate = true;
      }
    });
    data.openFileList = [];
    if (data.getOpenFileList) {
      data.openFileList = data.getOpenFileList();
    }
    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          data,
        },
      },
    };
  };
})();
