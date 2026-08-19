(function () {
  return function (argData, argParams) {
    var data = argData || { customScripts: [], devices: [], executions: [] };
    var device = argParams.device || {};
    var name = String(device.name || "").trim();
    var address = String(device.address || "").trim();

    if (!name) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "设备名称不能为空" },
        },
      };
    }
    if (!address) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: "设备地址不能为空" },
        },
      };
    }

    var now = Date.now();
    var item = {
      id: device.id || String(now),
      name: name,
      address: address,
      pairPort: device.pairPort || "",
      connectPort: device.connectPort || "",
      updateTime: new Date().toISOString(),
    };

    var list = data.devices || [];
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
