(function () {
  return function (argData, argParams) {
    const isExist = argData.personList.some(
      (item) => item.name === argParams.name
    );
    if (isExist) {
      return {
        response: {
          code: 200,
          data: {
            success: false,
            message: "姓名重复",
          },
        },
      };
    } else {
      argData.personList.push({
        ...argParams,
        id: Date.now(),
        accountList: [],
      });
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
    }
  };
})();
