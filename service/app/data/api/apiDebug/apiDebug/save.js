(function () {
  return function (argData, argParams) {
    var item = argParams.item;
    // lastQuery/lastBody/lastResponse 由独立缓存文件管理，不进主 JSON
    delete item.lastQuery;
    delete item.lastBody;
    delete item.lastResponse;
    if (item.id) {
      var idx = argData.apis.findIndex(function (a) { return a.id === item.id; });
      if (idx !== -1) argData.apis[idx] = Object.assign({}, argData.apis[idx], item);
    } else {
      var dup = argData.apis.find(function (a) {
        return a.url === item.url && a.method === item.method;
      });
      if (dup) {
        return {
          isWrite: false,
          response: { code: 200, data: { success: false, message: '已存在相同方法和路径的 API' } },
        };
      }
      item.id = Date.now();
      item.savedParams = [];
      argData.apis.push(item);
    }
    return {
      isWrite: true,
      data: argData,
      response: { code: 200, data: { success: true, item: item } },
    };
  };
})();
