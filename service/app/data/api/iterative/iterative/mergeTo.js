(function () {
  return function (argData, argParams, external) {
    const envInfos = argData.envConfig.list.reduce((total, cur) => {
      total[cur.id] = cur;
      return total;
    }, {});

    const { branch } = envInfos[argParams.envId];
    const execResultList = [];

    argParams.projectList.forEach((item) => {
      let argList = [];

      argList.push(
        ...[
          `checkout  ${branch}`, //切换到合并分支
          `pull`,
          `merge ${item.branchName}`, //混合代码
          `push`,
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
