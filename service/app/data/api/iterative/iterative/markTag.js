(function () {
  return function (argData, argParams) {
    const iterative = argData.iterativeList.find(
      (item) => item.id == argParams.id
    );
    iterative.markTags = argParams.markTags;
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          data: iterative,
        },
      },
    };
  };
})();
