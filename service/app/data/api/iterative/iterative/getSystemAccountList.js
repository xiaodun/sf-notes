(function () {
  return function (argData, argParams) {
    const accountList = [];
    argData.personList.forEach((person) => {
      person.accountList.forEach((account) => {
        if (account.systemId === argParams.systemId) {
          account.personName = person.name;
          accountList.push(account);
        }
      });
    });
    return {
      response: {
        code: 200,
        data: {
          success: true,
          list: accountList,
        },
      },
    };
  };
})();
