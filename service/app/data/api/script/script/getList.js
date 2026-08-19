(function () {
  return function (argData, argParams) {
    var data = argData || { devices: [], executions: [] };
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: {
            devices: data.devices || [],
            executions: (data.executions || []).slice(0, 30),
          },
        },
      },
    };
  };
})();
