(function () {
  return function (argData, argParams, external) {
    const child_process = require("child_process");
    const iteratives = argData.iterativeList.find((item) => item.id);
    let sameNameList = [];
    argParams.projectList.forEach((project) => {
      if (iteratives.projectList.find((item) => item.name === project.name)) {
        sameNameList.push(project.name);
      }
    });
    if (sameNameList.length > 0) {
      return {
        response: {
          code: 200,
          data: {
            success: false,
            message: `${sameNameList.join(",")}已经添加`,
          },
        },
      };
    } else {
      iteratives.projectList.push(...argParams.projectList);
      const execResultList = [];

      for (let i = 0; i < argParams.projectList.length; i++) {
        const item = argParams.projectList[i];

        const currentBranceName = external.getCurrentBranchName(item.dir);
        let argList = [];
        if (currentBranceName !== "master") {
          //缓存当前分支代码 并且换到master分支
          argList = ["stash", "checkout master"];
        }
        // 拉取主分支 并创建新分支
        argList.push(...["pull", `checkout -b ${item.branchName}`]);
        const errorMsgList = external.execGitCommad(argList, item.dir);

        if (errorMsgList.length > 0) {
          execResultList.push({
            success: false,
            title: item.name,
            errorMsg: errorMsgList.join("\n"),
          });
        } else {
          execResultList.push({
            success: true,
            title: item.name,
          });
        }
      }

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
    }
  };
})();