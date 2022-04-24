(function () {
  return function (argData, argParams) {
    const index = argData.iterativeList.findIndex(
      (item) => item.id === argParams.id
    );
    argData.iterativeList.splice(index, 1);
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
