(function () {
  return function (argData, argParams) {
    return {
      isWrite: false, 
      response: {
        code: 200,
        data: {
          success: true,
          list: (argData || []).filter((item) => !item.deleted),
        },
      },
    };
  };
})();

