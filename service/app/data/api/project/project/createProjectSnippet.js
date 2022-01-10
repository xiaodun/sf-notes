(function () {
  return function (argData, argParams, external) {
    const project = argData.projectList.find((item) => item.id == argParams.id);
    const fs = require("fs");
    let success = true,
      message = "";
    if (project.snippetList.find((item) => item.name === argParams.name)) {
      success = false;
      message = "片段名重复";
    }

    if (project.snippetList.find((item) => item.script === argParams.script)) {
      success = false;
      message = "脚本文件名重复";
    }

    if (success) {
      const snippetScriptPath = external.getSnippetScriptPath(
        project.name,
        argParams.script
      );
      project.snippetList.push({
        name: argParams.name,
        script: argParams.script,
      });
      fs.writeFileSync(
        snippetScriptPath,
        `
        (function () {
          return function (argParams,peoject) {
            const _ = require("lodash");
            const prettier = require("prettier");
            const path = require("path");
            const fs = require("fs");
            const results = {
              config: {
                globalParamList: [
                  {
                    name: "fileName",
                    label: "文件名",
                    type: "input",
                    style: {
                      width: 300,
                    },
                    require: true,
                  },
                ],
                fragmentList: [
                  {
                    title: "单文件",
                    previewAbleName: "previewSingleFile",
                    supportWriteOs: true,
                  },
                  
                ],
                writeOs: {
                  open: true,
                  needFolder: true,
                  basePath: "\\src\\modules",
                },
              },
              ables: {
                previewSingleFile() {},
              },
            };
            results.ables.writeOs = function () {
              const execResultList = [];
              const execFragmentList = results.config.fragmentList
                .filter((item) => item.supportWriteOs)
                .forEach((frgment) => {
                  try {
                    if (frgment.previewAbleName == "previewSingleFile") {

                    }
        
                    execResultList.push({
                      title: frgment.title,
                      success: true,
                    });
                  } catch (error) {
                    console.error(error);
                    execResultList.push({
                      title: frgment.title,
                      success: false,
                    });
                  }
                });
        
              return execResultList;
            };
            return results;
          };
        })();
        
        `
      );
    }

    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success,
          message,
        },
      },
    };
  };
})();
