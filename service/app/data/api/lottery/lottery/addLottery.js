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
    argData.lotteryList.push(newLottery);
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
