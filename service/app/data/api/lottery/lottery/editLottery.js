(function () {
  return function (argData, argParams, external) {
    argData = argData || {};
    argData.lotteryList = argData.lotteryList || [];
    const index = argData.lotteryList.findIndex(
      (item) => item.id === argParams.id
    );
    if (index !== -1) {
      argData.lotteryList[index] = {
        ...argData.lotteryList[index],
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

