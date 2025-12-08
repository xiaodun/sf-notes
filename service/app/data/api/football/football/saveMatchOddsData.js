
(function () {
  return function (argData, argParams, external) {
    const { id, matchOddsData } = argParams;

    // 找到对应的预测
    const predict = argData.predictList.find((item) => item.id == id);
    if (!predict) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "未找到对应的预测",
          },
        },
      };
    }

    // 读取现有的比赛结果数据（如果存在）
    let existingMatchOddsData = predict.matchOddsData || {};

    // 合并新数据
    const updatedMatchOddsData = {
      ...existingMatchOddsData,
      ...matchOddsData,
    };

    // 保存到 predict 的 matchOddsData 字段
    predict.matchOddsData = updatedMatchOddsData;

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
      