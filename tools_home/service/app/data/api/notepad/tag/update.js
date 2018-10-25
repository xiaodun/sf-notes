(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    let value = argParams.content.trim ().toLowerCase ();
    let isExists = argData.some ((el, index, arr) => {
      return (
        argParams.id !== el.id && value === el.content.trim ().toLowerCase ()
      );
    });
    let responseData = {};
    if (isExists) {
      responseData = {
        isWrite: false,
        response: {
          code: 200,
          data: {
            isFailed: true,
            message: '已存在该标签',
          },
        },
      };
    } else {
      argData.some ((el, index, arr) => {
        if (el.id === argParams.id) {
          el.content = argParams.content.trim ();
          return true;
        }
      });
      responseData = {
        isWrite: true,
        data: argData,
        response: {
          code: 200,
          data: {},
        },
      };
    }
    return responseData;
  };
}) ();
