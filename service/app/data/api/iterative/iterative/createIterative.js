(function () {
  return function (argData, argParams) {
    const isExist = argData.iterativeList.some(
      (item) => item.name === argParams.name
    );
    if (isExist) {
      return {
        response: {
          code: 200,
          data: {
            success: false,
            message: "迭代已存在!",
          },
        },
      };
    } else {
      argParams.id = Date.now();
      argData.iterativeList.push(argParams);
      console.log("wx", argData);
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
  };
})();
