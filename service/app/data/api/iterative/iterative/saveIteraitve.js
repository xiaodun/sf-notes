(function () {
  return function (argData, argParams) {
    const index = argData.iterativeList.findIndex(
      (item) => item.id === argParams.iterative.id
    );
    argData.iterativeList[index] = argParams.iterative;
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
