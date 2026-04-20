(function () {
  var fs = require('fs');
  var path = require('path');
  var CACHE_DIR = 'data/api/apiDebug/apiDebug/cache';
  /** 列表接口不内联超大 lastResponse.body，避免一次 getList 撑爆内存/前端；完整内容见 getCache */
  var MAX_INLINE_BODY_CHARS = 512 * 1024;
  var PARTIAL_PREVIEW_CHARS = 8000;

  function loadCache(apiId) {
    try {
      var p = path.join(CACHE_DIR, apiId + '.json');
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch (e) {}
    return null;
  }

  function trimLastResponseForList(lastResponse) {
    if (!lastResponse) {
      return { lastResponse: null, isPartial: false };
    }
    if (lastResponse.bodyStorage === 'file') {
      return {
        lastResponse: {
          success: lastResponse.success,
          status: lastResponse.status,
          elapsed: lastResponse.elapsed,
          error: lastResponse.error,
          bodyStorage: 'file',
          bodyCharLength: lastResponse.bodyCharLength || 0,
          bodyEnvelope: lastResponse.bodyEnvelope || undefined,
          parsedBody: null,
        },
        isPartial: true,
      };
    }
    if (typeof lastResponse.body !== 'string') {
      return { lastResponse: lastResponse, isPartial: false };
    }
    if (lastResponse.body.length <= MAX_INLINE_BODY_CHARS) {
      return { lastResponse: lastResponse, isPartial: false };
    }
    return {
      lastResponse: {
        success: lastResponse.success,
        status: lastResponse.status,
        elapsed: lastResponse.elapsed,
        error: lastResponse.error,
        bodyCharLength: lastResponse.body.length,
        body: lastResponse.body.slice(0, PARTIAL_PREVIEW_CHARS),
        parsedBody: null,
      },
      isPartial: true,
    };
  }

  return function (argData) {
    var apis = (argData.apis || []).map(function (api) {
      var cache = loadCache(api.id);
      var trimmed = cache && cache.lastResponse ? trimLastResponseForList(cache.lastResponse) : { lastResponse: null, isPartial: false };
      return Object.assign({}, api, {
        lastQuery: cache ? cache.lastQuery || '' : '',
        lastBody: cache ? cache.lastBody || '' : '',
        lastResponse: trimmed.lastResponse,
        lastResponseIsPartial: trimmed.isPartial || undefined,
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
