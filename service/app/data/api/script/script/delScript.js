(function () {
  return function (argData, argParams) {
    var data = argData || { customScripts: [], devices: [], executions: [] };
    var id = String(argParams.id || "").trim();
    if (!id) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "缺少脚本 ID" },
        },
      };
    }

    var list = data.customScripts || [];
    var index = list.findIndex(function (s) {
      return s.id === id;
    });
    if (index === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "脚本不存在" },
        },
      };
    }
    list.splice(index, 1);
    data.customScripts = list;

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
