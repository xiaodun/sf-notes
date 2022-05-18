(function () {
  return function (argData, argParams, external) {
    const execResultList = [];

    argParams.projectList.forEach((item) => {
      const currentBranceName = external.getCurrentBranchName(item.dir);
      let argList = [];
      if (currentBranceName !== "master") {
        //缓存当前分支代码 并且换到master分支
        argList = ["checkout master"];
      }

      argList.push(
        ...[
          "pull", // 拉取主分支
          `checkout  ${item.branchName}`, //切换到特性分支
          "merge master", //混合master代码
          "push",
          {
            commond: "diff --name-only --diff-filter=U", //检测冲突
            isRecordStdout: true,
          },
        ]
      );
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
    });
    return {
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
