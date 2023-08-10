(function () {
  return function (argData, argParams, external) {
    const axios = require("axios");
    axios.post(argParams.url, argParams.data, {}).then((rsp) => {
      const { errcode, errmsg } = rsp.data;
      if (errcode === 0) {
        external.response.end(
          JSON.stringify({
            success: true,
          })
        );
      } else {
        external.response.end(
          JSON.stringify({
            success: false,
            message: errmsg,
          })
        );
      }
    });
    return {
      async: true,
      response: {
        code: 200,
      },
    };
  };
})();
