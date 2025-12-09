(function () {
  return function (argData, argParams, external) {
    argData = argData || {};
    argData.lotteryList = argData.lotteryList || [];
    // 保存配置
    if (argParams.includeFixedNumbers !== undefined) {
      argData.includeFixedNumbers = argParams.includeFixedNumbers;
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

