(function () {
  var fs = require('fs');
  var path = require('path');
  var CACHE_DIR = 'data/api/apiDebug/apiDebug/cache';

  function delCache(apiId) {
    try {
      var p = path.join(CACHE_DIR, apiId + '.json');
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (e) {}
  }

  return function (argData, argParams) {
    var id = argParams.id;
    var toDelApiIds = argData.apis.filter(function (a) { return a.appId === id; }).map(function (a) { return a.id; });
    toDelApiIds.forEach(delCache);
    argData.apps = argData.apps.filter(function (a) { return a.id !== id; });
    argData.apis = argData.apis.filter(function (a) { return a.appId !== id; });
    return {
      isWrite: true,
      data: argData,
      response: { code: 200, data: { success: true } },
    };
  };
})();
