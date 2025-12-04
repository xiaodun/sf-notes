(function () {
  return function (argData, argParams) {
    const { id } = argParams;
    argData = argData || [];
    const index = argData.findIndex((item) => item.id === id);
    if (index !== -1) {
      argData[index].deleted = true;
    }
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

