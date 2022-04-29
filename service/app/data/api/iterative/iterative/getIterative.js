(function () {
  return function (argData, argParams) {
    const iterative = argData.iterativeList.find(
      (item) => item.id == argParams.id
    );
    return {
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
