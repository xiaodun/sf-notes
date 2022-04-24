(function () {
  return function (argData, argParams, external) {
    const execResultList = [];

    argParams.projectList.forEach((item) => {
      let argList = [
        {
          commond: "diff --name-only --diff-filter=U", //检测冲突
          isRecordStdout: true,
        },
      ];

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
