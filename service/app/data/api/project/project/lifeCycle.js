const path = require("path");

(function () {
  return function () {
    const commonList = ["c://sf-mobile-web", "/player", "/movie"];
    let pathList = [...commonList];
    pathList.splice(3, 0, "/system");
    let userPathList = [...commonList];
    userPathList.splice(3, 0, "/user");
    const fs = require("fs");
    const swaggerFolderPath = "./data/api/project/project/swagger";
    const publicFolderPath = "./data/api/project/project/public";
    const generateMockDataWithProjectPath = `${publicFolderPath}/generateMockDataWithProject.js`;
    const generateAjaxCodeFolderpath =
      "./data/api/project/project/generateAjaxCode";
    return {
      createFloder: function (createFloder, external) {
        external.getBaseStructure = (argData) => {
          let baseData = {
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
          return swaggerFolderPath;
        };
        external.createSwaggerFolder = () => {
          if (!fs.existsSync(swaggerFolderPath)) {
            fs.mkdirSync(swaggerFolderPath);
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
        external.getPathPrefix = (checkedPathInfo, apiPrefixs) => {
          let str = "";
          Object.keys(apiPrefixs).some((domain) => {
            if (new RegExp(domain).test(checkedPathInfo.domain)) {
              return Object.keys(apiPrefixs[domain]).some((group) => {
                return Object.keys(apiPrefixs[domain][group]).some((prefix) => {
                  const hasPrefix = apiPrefixs[domain][group][prefix].find(
                    (item) => checkedPathInfo.pathUrl.startsWith(item)
                  );
                  if (hasPrefix) {
                    str = prefix;
                    return true;
                  }
                });
              });
            }
          });
          return str;
        };
        external.createGenerateAjaxCodeJs = (projectName) => {
          if (!fs.existsSync(generateAjaxCodeFolderpath)) {
            fs.mkdirSync(generateAjaxCodeFolderpath);
          }
          const projecGenerateAjaxCodePath =
            external.getProjecGenerateAjaxCodePath(projectName);
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

        external.getPublicFolderPath = () => {
          return publicFolderPath;
        };
        external.getCopySwaggerJsPath = () => {
          return generateMockDataWithProjectPath;
        };

        external.createPublicFolder = () => {
          if (!fs.existsSync(publicFolderPath)) {
            fs.mkdirSync(publicFolderPath);
          }
        };
        external.createCopySwaggerJs = () => {
          external.createPublicFolder();
          if (!fs.existsSync(generateMockDataWithProjectPath)) {
            fs.writeFileSync(
              generateMockDataWithProjectPath,
              `
            (function () {
              const moment = require("moment");
              const _ = require("lodash");
              return function (argParams) {
                const { rspItemList, isRsp } = argParams;
                function able(dataLit, wrap = {}) {
                  dataLit.forEach((item) => {
                    if (item.type === "array") {
                      wrap[item.name] = [];
            
                      if (item.children.length) {
                        wrap[item.name].push(able(item.children));
                      }
                    }
                    if (item.type === "object") {
                      wrap[item.name] = {};
            
                      if (item.children.length) {
                        wrap[item.name] = {
                          ...able(item.children, {}),
                        };
                      }
                    } else if (item.type === "boolean") {
                      wrap[item.name] = Math.random() > 0.5 ? true : false;
                    } else if (item.type === "integer") {
                      wrap[item.name] = 0;
                    } else if (item.type === "string") {
                      if (isRsp) {
                        if (item.enum) {
                          wrap[item.name] = item.enum[_.random(item.enum.length - 1)];
                        } else if (item.format === "date-time") {
                          wrap[item.name] = moment().format("YYYY-MM-DD HH:mm:ss");
                        } else {
                          wrap[item.name] = item.name;
                        }
                      } else {
                        wrap[item.name] = "";
                      }
                    }
                  });
            
                  return wrap;
                }
                let data = {};
            
                able(rspItemList, data);
                if (!isRsp) {
                  if (Object.keys(data).length === 1) {
                    const innerObj = data[Object.keys(data)[0]];
                    if (typeof innerObj === "object") {
                      data = innerObj;
                    }
                  }
                } else {
                  data = data.rsp;
                }
                return JSON.stringify(data);
              };
            })();
            
            
            
            
            `
            );
          }
        };
      },
    };
  };
})();
