(function () {
  return function (argData, argParams) {
    const iterative = argData.iterativeList.find(
      (item) => item.id === argParams.iterativeId
    );
    const index = iterative.projectList.findIndex(
      (item) => item.name === argParams.name
    );
    iterative.projectList.splice(index, 1);
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
