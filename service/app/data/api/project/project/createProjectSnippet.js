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
          return function (argParams) {
            const _ = require("lodash");
            const prettier = require("prettier");
            const path = require("path");
            const fs = require("fs");
            const babelParser = require("@babel/parser");
            const { default: babelTraverse } = require("@babel/traverse");
            const { baseParse: vueParse } = require("@vue/compiler-core");
        
            function getRouteFilePath() {
              return path.join(argParams.writeOsPath, "router", "index.js");
            }
            return {
              writeOs: {
                open: true,
                needFolder: true,
                basePath: "\\src\\modules",
              },
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
                {
                  name: "hasCrumb",
                  label: "面包屑",
                  type: "switch",
                  defaultValue: true,
                },
              ],
              fragmentList: [
                {
                  title: "单文件",
                  getTemplate() {
                    return "";
                  },
                  writeOs(template) {},
                },
              ],
            };
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
