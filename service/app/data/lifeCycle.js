(function () {
  return function () {
    return {
      ajaxInterceptor: function (argData, argParams, external) {
        return {
          allowNextStep: true,
          response: {
            //返回的数据
            code: 200,
            data: {},
          },
        };
      },
    };
  };
})();
