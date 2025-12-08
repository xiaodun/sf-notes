
(function () {
  return function (argData, argParams, external) {
    const { id } = argParams;

    // 找到对应的预测
    const predict = argData.predictList.find((item) => item.id == id);
    if (!predict) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            data: {},
          },
        },
      };
    }

    // 返回该预测的比赛结果数据
    const matchOddsData = predict.matchOddsData || {};

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: matchOddsData,
        },
      },
    };
  };
})();
      