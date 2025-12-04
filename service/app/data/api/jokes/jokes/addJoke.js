(function () {
  return function (argData, argParams) {
    const { joke, index = 0 } = argParams;
    const newJoke = {
      ...joke,
      id: Date.now() + "",
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
      deleted: false,
    };
    argData = argData || [];
    argData.splice(index, 0, newJoke);
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          ...newJoke,
        },
      },
    };
  };
})();
