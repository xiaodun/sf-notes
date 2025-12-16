(function () {
  return function (argData, argParams, external) {
    argData = argData || {};
    return {
      response: {
        code: 200,
        data: {
          success: true,
          data: {
            includeFixedNumbers:
              argData.includeFixedNumbers !== undefined
                ? argData.includeFixedNumbers
                : true,
          },
        },
      },
    };
  };
})();

