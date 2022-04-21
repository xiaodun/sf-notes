(function () {
  return function (argData, argParams) {
    const roles = argData.personList.find((item) => item.id === argParams.id);
    argParams.account.id = Date.now();
    roles.accountList.push(argParams.account);
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
