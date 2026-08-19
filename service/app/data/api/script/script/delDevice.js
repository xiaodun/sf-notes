(function () {
  return function (argData, argParams) {
    var data = argData || { customScripts: [], devices: [], executions: [] };
    var id = String(argParams.id || "").trim();
    if (!id) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "缺少设备 ID" },
        },
      };
    }

    var list = data.devices || [];
    var index = list.findIndex(function (d) {
      return d.id === id;
    });
    if (index === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "设备不存在" },
        },
      };
    }
    list.splice(index, 1);
    data.devices = list;

    return {
      isWrite: true,
      data: data,
      response: {
        code: 200,
        data: { success: true },
      },
    };
  };
})();
