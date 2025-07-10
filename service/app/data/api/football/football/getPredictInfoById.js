(function () {
  return function (argData, argParams, external) {
    const data = argData.predictList.find((item) => item.id == argParams.id);
    return {
      isWrite: false,
      //data:argData,
      response: {
        code: 200,
        data: {
          success: true,
          data,
        },
      },
    };
  };
})();
