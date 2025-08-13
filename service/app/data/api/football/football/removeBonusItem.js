(function () {
  return function (argData, argParams, external) {
    // 查找对应的 predict 对象
    const predictInfo = argData.predictList.find(
      (item) => item.id == argParams.id
    );

    delete predictInfo.bonusItems[argParams.itemKey];

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
