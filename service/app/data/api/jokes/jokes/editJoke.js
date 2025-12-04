(function () {
  return function (argData, argParams) {
    const joke = argParams;
    argData = argData || [];
    const index = argData.findIndex((item) => item.id === joke.id);
    if (index !== -1) {
      argData[index] = {
        ...argData[index],
        ...joke,
        updateTime: new Date().toISOString(),
      };
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

