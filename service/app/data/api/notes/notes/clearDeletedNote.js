(function () {
  return function (argData, argParams) {
    const list = argData.filter((item) => !item.deleted);
    return {
      isWrite: true,
      data: list,
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
