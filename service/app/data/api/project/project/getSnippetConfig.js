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
    data.globalParamList.forEach((item) => {
      if (!item.props) {
        item.props = {};
      }
      if (item.type === "select" && item.valueList) {
        //自动改为{label:"",value:""}形式
        if (typeof item.valueList[0] != "object") {
          item.valueList = item.valueList.map((item) => ({
            label: item,
            value: item,
          }));
        }
      }
    });
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
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data,
        },
      },
    };
  };
})();
