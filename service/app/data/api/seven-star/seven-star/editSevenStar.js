(function () {
  return function (argData, argParams, external) {
    argData = argData || {};
    argData.sevenStarList = argData.sevenStarList || [];
    const index = argData.sevenStarList.findIndex(
      (item) => item.id === argParams.id
    );
    if (index !== -1) {
      argData.sevenStarList[index] = {
        ...argData.sevenStarList[index],
        ...argParams,
        updateTime: new Date().toISOString(),
      };
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
    }
    return {
      response: {
        code: 200,
        data: {
          success: false,
          message: "未找到该预测",
        },
      },
    };
  };
})();

