(function () {
  return function (argData, argParams) {
    const id = argParams.id;
    const newData = argData.filter(item => item.id !== id);
    return {
      isWrite: true,
      data: newData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();