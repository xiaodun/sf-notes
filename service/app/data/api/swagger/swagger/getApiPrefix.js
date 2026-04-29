(function () {
  return function (argData, argParams, external) {
    const _ = require("lodash");

    let apiPrefixs = _.cloneDeep(argData.apiPrefixs);
    Object.keys(argData.apiPrefixs).forEach((domain) => {
      Object.keys(argData.apiPrefixs[domain]).forEach((group) => {
        apiPrefixs[domain][group] = {};
        Object.keys(argData.apiPrefixs[domain][group]).forEach((prefix) => {
          argData.apiPrefixs[domain][group][prefix].forEach((item) => {
            apiPrefixs[domain][group][item] = { prefix };
          });
        });
      });
    });
    return {
      isWrite: false,

      response: {
        code: 200,
        data: {
          success: true,
          data: apiPrefixs,
        },
      },
    };
  };
})();
