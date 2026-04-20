(function () {
  var path = require('path');
  var fs = require('fs');
  var _cacheStoragePath = path.join(process.cwd(), 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  if (!fs.existsSync(_cacheStoragePath)) {
    _cacheStoragePath = path.join(process.cwd(), 'service', 'app', 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  }
  var storage = require(_cacheStoragePath);

  return function (argData, argParams) {
    var item = argParams.item;
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

    storage.writeMainDataWithRetry(argData);

    return {
      isWrite: false,
      response: { code: 200, data: { success: true, item: item } },
    };
  };
})();
