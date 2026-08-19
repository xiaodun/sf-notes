(function () {
  return function (argData, argParams) {
    var data = argData || { devices: [], executions: [] };
    var device = argParams.device || {};
    var name = String(device.name || "").trim();
    var scriptId = String(device.scriptId || "").trim();

    if (!scriptId) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "缺少脚本" },
        },
      };
    }
    if (!name) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "设备名称不能为空" },
        },
      };
    }

    var now = Date.now();
    var item = {
      id: device.id || String(now),
      scriptId: scriptId,
      name: name,
      address: String(device.address || "").trim(),
      pairPort: device.pairPort || "",
      pairCode: device.pairCode || "",
      connectPort: device.connectPort || "",
      updateTime: new Date().toISOString(),
    };

    var list = data.devices || [];
    var dup = list.some(function (d) {
      var sameScript = (d.scriptId || "builtin:adb-wireless") === item.scriptId;
      return sameScript && d.name === item.name && d.id !== item.id;
    });
    if (dup) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "设备名称已存在" },
        },
      };
    }

    var index = list.findIndex(function (d) {
      return d.id === item.id;
    });
    if (index === -1) {
      list.unshift(item);
    } else {
      list.splice(index, 1, item);
    }
    data.devices = list;

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
