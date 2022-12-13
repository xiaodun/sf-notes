(function () {
  return function (argData, argParams, external) {
    const iterative = argData.iterativeList.find(
      (item) => item.id == argParams.iterativeId
    );
    console.log("wx", iterative);
    const index = iterative.markTags.envIdList.findIndex(
      (envId) => envId === argParams.envId
    );
    iterative.markTags.envIdList.splice(index, 1);
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
