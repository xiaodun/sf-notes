(function () {
  return function (argData, argParams, external) {
    const project = argData.projectList.find(
      (item) => item.id == argParams.data.id
    );

    let snippetObj;
    for (let i = 0; i < project.snippetList.length; i++) {
      const item = project.snippetList[i];
      if (item.isGroup) {
        const index = item.children.findIndex(
          (el) => el.script == argParams.data.script
        );
        if (index !== -1) {
          snippetObj = item.children[index];
          break;
        }
      } else if (argParams.data.script == item.script) {
        snippetObj = item;
        break;
      }
    }
    snippetObj.lastOptionPath = argParams.values.writeOsPath;

    if (!argParams.values.writeOsPath) {
      //防止path.join报错
      argParams.values.writeOsPath = "";
    }
    const fs = require("fs");
    const snippetScriptPath = external.getSnippetScriptPath(
      project.name,
      argParams.data.script
    );
    const sctiptContent = fs.readFileSync(snippetScriptPath).toString();
    const execResultList = [];
    eval(sctiptContent)(argParams.values, project).fragmentList.forEach(
      (item) => {
        if (item.writeOs) {
          try {
            //防止写入多出空行
            const template = item.getTemplate
              ? (item.getTemplate() || "").trim()
              : "";
            item.writeOs(template);
            execResultList.push({ title: item.title, success: true });
          } catch (error) {
            console.error(error);
            execResultList.push({
              title: item.title,
              success: false,
              errorMsg: error.toString(),
            });
          }
        } else {
          execResultList.push({
            title: item.title,
            success: false,
            errorMsg: "不支持写入",
          });
        }
      }
    );
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          list: execResultList,
        },
      },
    };
  };
})();
