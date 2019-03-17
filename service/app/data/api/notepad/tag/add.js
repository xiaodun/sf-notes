(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    argData = argData || [];
    let tag = {
      id: +new Date(),
      content: argParams.content,
      color: argParams.color
    };
    //查重
    let isExists = argData.some((el, ndex) => {
      let value = argParams.content;
      return value.toLowerCase() == el.content.toLowerCase();
    });
    let responseData = {};
    if (isExists) {
      responseData = {
        isWrite: false,
        response: {
          code: 200,
          data: {
            isFailed: true,
            message: '该标签已存在',
          },
        },
      };
    } else {
      argData.unshift(tag);
      responseData = {
        isWrite: true, //是否覆盖数据
        data: argData, //需要存储的新数据
        response: {
          //返回的数据
          code: 200,
          data: {},
        },
      };
    }
    return responseData;
  };
})();
