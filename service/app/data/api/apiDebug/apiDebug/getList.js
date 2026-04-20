(function () {
  var fs = require('fs');
  var path = require('path');
  var CACHE_DIR = 'data/api/apiDebug/apiDebug/cache';

  function loadCache(apiId) {
    try {
      var p = path.join(CACHE_DIR, apiId + '.json');
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch (e) {}
    return null;
  }

  return function (argData) {
    var apis = (argData.apis || []).map(function (api) {
      var cache = loadCache(api.id);
      return Object.assign({}, api, {
        lastQuery: cache ? cache.lastQuery || '' : '',
        lastBody: cache ? cache.lastBody || '' : '',
        lastResponse: cache ? cache.lastResponse || null : null,
      });
    });
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          apps: argData.apps || [],
          apis: apis,
        },
      },
    };
  };
})();
