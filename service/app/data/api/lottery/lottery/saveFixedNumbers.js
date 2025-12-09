(function () {
  return function (argData, argParams, external) {
    argData = argData || {};
    argData.lotteryList = argData.lotteryList || [];
    // 只更新 fixedNumbers，保留 lotteryList 不变
    // argParams 是请求体中的 data 字段
    argData.fixedNumbers = argParams || [];
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

