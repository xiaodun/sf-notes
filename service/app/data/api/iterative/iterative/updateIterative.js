(function () {
  return function (argData, argParams, external) {
    const iterative = argData.iterativeList.find(
      (item) => item.id == argParams.id
    );
    for (const key in argParams.values) {
      iterative[key] = argParams.values[key];
    }

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
