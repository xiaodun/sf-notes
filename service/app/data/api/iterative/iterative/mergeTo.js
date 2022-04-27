(function () {
  return function (argData, argParams, external) {
    const iterative = argData.iterativeList.find(
      (item) => item.id == argParams.id
    );
    const envInfos = argData.envConfig.list.reduce((total, cur) => {
      total[cur.id] = cur;
      return total;
    }, {});

    iterative.lastOperationEnvId = argParams.envId;

    const { branch } = envInfos[argParams.envId];
    const execResultList = [];

    argParams.projectList.forEach((item) => {
      let argList = [];

      argList.push(
        ...[
          `checkout  ${branch}`, //切换到特性分支
          `merge ${item.branchName}`, //混合master代码
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
