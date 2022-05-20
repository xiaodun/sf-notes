(function () {
  return function (argData, argParams, external) {
    const axios = require("axios");
    axios.default
      .post(argParams.url, argParams.data)
      .then(() => {
        external.response.end(
          JSON.stringify({
            success: true,
          })
        );
      })
      .catch((error) => {
        external.response.end(
          JSON.stringify({
            success: false,
            message: error,
          })
        );
      });
    return {
      async: true,
      response: {
        code: 200,
      },
    };
  };
})();
