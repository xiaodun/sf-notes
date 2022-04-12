(function () {
  return function (argData, argParams) {
    const roleTagInfos = argData.roleConfig.list.reduce((total, cur) => {
      total[cur.value] = cur;
      return total;
    }, {});
    return {
      response: {
        code: 200,
        data: {
          success: true,
          list: argData.roleList.map((item) => {
            const { role, ...restParams } = item;
            return {
              ...restParams,
              role: roleTagInfos[role].label,
            };
          }),
        },
      },
    };
  };
})();
