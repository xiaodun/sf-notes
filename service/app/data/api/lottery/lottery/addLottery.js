(function () {
  return function (argData, argParams, external) {
    argData = argData || {};
    argData.lotteryList = argData.lotteryList || [];
    const newLottery = {
      id: String(Date.now()),
      ...argParams,
      numbersList: argParams.numbersList || [],
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };
    // 新添加的预测放在数组前面
    argData.lotteryList.unshift(newLottery);
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          data: newLottery,
        },
      },
    };
  };
})();
