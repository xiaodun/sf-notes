const path = require("path");

(function () {
  return function () {
    const commonList = ["c://sf-mobile-web", "/player", "/movie"];
    let pathList = [...commonList];
    pathList.splice(3, 0, "/system");
    let userPathList = [...commonList];
    userPathList.splice(3, 0, "/user");
    const fs = require("fs");
    const swaggerFolderpath = "./data/api/project/project/swagger";
    const generateAjaxCodeFolderpath =
      "./data/api/project/project/generateAjaxCode";
    return {
      createFloder: function (createFloder, external) {
        external.getBaseStructure = (argData) => {
          let baseData = {
            command: {
              menuList: [
                {
                  name: "通用命令",
                },
              ],
            },
            projectList: [],
          };
          if (!argData) {
            return baseData;
          }

          if (!argData.swaggerList) {
            argData.swaggerList = [];
          }
          if (!argData.snippetList) {
            argData.snippetList = [];
          }
          if (!argData.apiPrefixs) {
            argData.apiPrefixs = {};
          }

          if (!argData.attentionPathList) {
            argData.attentionPathList = [];
          }

          return argData;
        };
        external.getSwaggerFolderPath = () => {
          return swaggerFolderpath;
        };
        external.createSwaggerFolder = () => {
          if (!fs.existsSync(swaggerFolderpath)) {
            fs.mkdirSync(swaggerFolderpath);
          }
        };
        external.getProjecGenerateAjaxCodePath = (projectName) => {
          return (
            generateAjaxCodeFolderpath + "/" + projectName + "-ajax-code.js"
          );
        };
        external.getPathName = (pathUrl, usePreventRepeat) => {
          let pathBodyList = pathUrl.split("/").filter(Boolean);

          let lastPathBody = pathBodyList[pathBodyList.length - 1];
          let pathName = lastPathBody;
          if (usePreventRepeat) {
            const haveUppperchar = [...lastPathBody].some(
              (char) => char.charCodeAt() >= 65 && char.charCodeAt() <= 90
            );
            if (!haveUppperchar) {
              pathName =
                pathBodyList[pathBodyList.length - 2] +
                lastPathBody[0].toUpperCase() +
                lastPathBody.substr(1);
            }
          }
          return pathName;
        };
        external.getPathPrefix = (pathUrl, apiPrefixs) => {
          let str = "";
          Object.keys(apiPrefixs).some((prefix) => {
            if (apiPrefixs[prefix].some((item) => pathUrl.startsWith(item))) {
              str = prefix;
              return true;
            }
          });
          return str;
        };
        external.createGenerateAjaxCodeJs = (projectName) => {
          if (!fs.existsSync(generateAjaxCodeFolderpath)) {
            fs.mkdirSync(generateAjaxCodeFolderpath);
          }
          const projecGenerateAjaxCodePath = external.getProjecGenerateAjaxCodePath(
            projectName
          );
          if (!fs.existsSync(projecGenerateAjaxCodePath)) {
            fs.writeFileSync(
              projecGenerateAjaxCodePath,
              `(function(){

              return function(checkedPathList, apiPrefixs, external){
                
              }
            })()`
            );
          }
        };
        external.getSnippetFolder = (projectName) => {
          return `./data/api/project/project/snippet/${projectName}`;
        };
        external.getSnippetScriptPath = (projectName, script) => {
          return (
            external.getSnippetFolder(projectName) +
            "/" +
            script +
            "-" +
            projectName +
            ".js"
          );
        };
        external.createSnippetFolder = (projectName) => {
          const projectPath = external.getSnippetFolder(projectName);
          snipeetFollder = projectPath.split(`/${projectName}`)[0];
          if (!fs.existsSync(snipeetFollder)) {
            fs.mkdirSync(snipeetFollder);
          }
          if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath);
          }
        };
      },
    };
  };
})();
