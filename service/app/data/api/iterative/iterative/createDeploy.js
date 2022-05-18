(function () {
  return function (argData, argParams, external) {
    const iterative = argData.iterativeList.find(
      (item) => item.id == argParams.id
    );

    // 在迭代李记录上次操作信息
    iterative.lastOperationEnvId = argParams.envId;
    iterative.lastOperationReleasePersonIdList = argParams.releasePersonIdList;
    iterative.lastOperationDeployPersonIdList = argParams.deployPersonIdList;
    //在发版配置李记录上次操作

    argData.releaseConfig.lastOperationSystemId = argParams.systemId;
    argData.releaseConfig.lastOperationBuildAccountId =
      argParams.buildAccount.id;
    argData.releaseConfig.lastOperationDeployAccountId =
      argParams.deployAccount?.id;

    //组合发给构建工具的数据

    const helperParams = {
      buildAccount: {
        userName: argParams.buildAccount.userName,
        password: argParams.buildAccount.password,
      },
      systemUrl: argData.systemConfig.list.find(
        (item) => item.id === argParams.systemId
      ).url,

      projectList: argParams.projectList,
    };
    if (argParams.deployAccount) {
      helperParams.deployAccount = {
        userName: argParams.deployAccount.userName,
        password: argParams.deployAccount.password,
      };
    }

    //记录构建信息,用于更新状态
    return {
      async: true,
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          data: iterative,
        },
      },
    };
  };
})();
