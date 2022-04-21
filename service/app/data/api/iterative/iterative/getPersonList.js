(function () {
  return function (argData, argParams) {
    const roleInfos = argData.roleConfig.list.reduce((total, cur) => {
      total[cur.id] = cur;
      return total;
    }, {});
    const systemInfos = argData.systemConfig.list.reduce((total, cur) => {
      total[cur.id] = cur;
      return total;
    }, {});
    const envInfos = argData.envConfig.list.reduce((total, cur) => {
      total[cur.id] = cur;
      return total;
    }, {});

    return {
      response: {
        code: 200,
        data: {
          success: true,
          list: argData.personList.map((person) => {
            person.accountList.forEach((account) => {
              account.systemName = systemInfos[account.systemId].systemName;
              account.envNameList = account.envIdList.map(
                (id) => envInfos[id].envName
              );
            });
            return {
              roleName: roleInfos[person.roleId].roleName,
              ...person,
            };
          }),
        },
      },
    };
  };
})();
