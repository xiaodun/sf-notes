(function () {
  return function (argData, argParams) {
    var data = argData || { customScripts: [], devices: [], executions: [] };
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: {
            customScripts: data.customScripts || [],
            devices: data.devices || [],
            executions: (data.executions || []).slice(0, 30),
          },
        },
      },
    };
  };
})();
