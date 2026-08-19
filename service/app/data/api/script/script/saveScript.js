(function () {
  return function (argData, argParams) {
    var data = argData || { customScripts: [], devices: [], executions: [] };
    var script = argParams.script || {};
    var name = String(script.name || "").trim();
    var command = String(script.command || "").trim();

    if (!name) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "脚本名称不能为空" },
        },
      };
    }
    if (!command) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "脚本命令不能为空" },
        },
      };
    }

    var now = Date.now();
    var item = {
      id: script.id || String(now),
      name: name,
      description: String(script.description || "").trim(),
      command: command,
      params: Array.isArray(script.params) ? script.params : [],
      createTime: script.createTime || now,
      updateTime: new Date().toISOString(),
    };

    var list = data.customScripts || [];
    var index = list.findIndex(function (s) {
      return s.id === item.id;
    });
    if (index === -1) {
      list.unshift(item);
    } else {
      item.createTime = list[index].createTime || item.createTime;
      list.splice(index, 1, item);
    }
    data.customScripts = list;

    return {
      isWrite: true,
      data: data,
      response: {
        code: 200,
        data: { success: true, data: item },
      },
    };
  };
})();
