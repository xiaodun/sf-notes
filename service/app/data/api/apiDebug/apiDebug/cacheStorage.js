/**
 * API 调试缓存：小对象仍写在 {apiId}.json；超大响应正文单独 {apiId}.body.txt，列表与接口响应只带元数据。
 */
'use strict';

var fs = require('fs');
var path = require('path');

var CACHE_DIR = 'data/api/apiDebug/apiDebug/cache';

/** 超过该字符数则外置正文（UTF-16 长度近似用 string.length） */
var EXTERNAL_BODY_THRESHOLD_CHARS = 64 * 1024;

var DEFAULT_SLICE_BYTES = 256 * 1024;
var MAX_SLICE_BYTES = 1024 * 1024;

/** 外置正文时，元数据里始终附带一段 UTF-8 前缀供前端格式化 / 树预览（与 .body.txt 前缀一致） */
var BODY_PUBLIC_HEAD_CHARS = 96 * 1024;
/** 从文件回填公共头时多读一点字节，避免多字节字符截断 */
var BODY_PUBLIC_READ_BYTES = 132 * 1024;
/** 外置正文时，尽量抽取稳定外层结构，避免前端必须依赖整包 JSON */
/** positions/list 常见在 20MB+，这里放宽到 64MB 以保证能产出结构快照 */
var ENVELOPE_PARSE_MAX_CHARS = 64 * 1024 * 1024;
var ENVELOPE_MAX_DEPTH = 4;
var ENVELOPE_MAX_ARRAY_ITEMS = 24;
var ENVELOPE_MAX_OBJECT_KEYS = 40;
var ENVELOPE_SAMPLE_ITEMS = 24;
var NODE_SLICE_MAX_ITEMS = 500;

function sliceBodyPublicHeadFromFullString(fullBody) {
  var s = String(fullBody);
  var head = s.slice(0, Math.min(BODY_PUBLIC_HEAD_CHARS, s.length));
  return { head: head, headByteLength: Buffer.byteLength(head, 'utf8') };
}

function pushPathToken(pathTokens, token) {
  var out = pathTokens.slice();
  out.push(token);
  return out;
}

function toLazyArrayNode(arr, depth, pathTokens) {
  var total = arr.length;
  var sampleCount = Math.min(total, ENVELOPE_SAMPLE_ITEMS);
  var sample = [];
  for (var i = 0; i < sampleCount; i++) {
    sample.push(buildBodyEnvelopeNode(arr[i], depth + 1, pushPathToken(pathTokens, i)));
  }
  return {
    __apiDebugLazy: true,
    kind: 'array',
    totalItems: total,
    loadedItems: sample.length,
    nextCursor: sample.length,
    pathTokens: pathTokens,
    items: sample,
    hint: '数组已按需加载，可继续展开加载更多。',
  };
}

function toLazyObjectNode(obj, depth, pathTokens) {
  var keys = Object.keys(obj);
  var sampleCount = Math.min(keys.length, ENVELOPE_SAMPLE_ITEMS);
  var sampleEntries = {};
  for (var i = 0; i < sampleCount; i++) {
    var k = keys[i];
    sampleEntries[k] = buildBodyEnvelopeNode(obj[k], depth + 1, pushPathToken(pathTokens, k));
  }
  return {
    __apiDebugLazy: true,
    kind: 'object',
    totalKeys: keys.length,
    loadedKeys: sampleCount,
    nextCursor: sampleCount,
    pathTokens: pathTokens,
    entries: sampleEntries,
    hint: '对象字段较多，已按需加载，可继续展开加载更多。',
  };
}

function buildBodyEnvelopeNode(node, depth, pathTokens) {
  if (node == null || typeof node !== 'object') return node;
  if (Array.isArray(node)) {
    if (depth >= ENVELOPE_MAX_DEPTH || node.length > ENVELOPE_MAX_ARRAY_ITEMS) {
      return toLazyArrayNode(node, depth, pathTokens);
    }
    return node.map(function (it, idx) {
      return buildBodyEnvelopeNode(it, depth + 1, pushPathToken(pathTokens, idx));
    });
  }
  var keys = Object.keys(node);
  if (depth >= ENVELOPE_MAX_DEPTH || keys.length > ENVELOPE_MAX_OBJECT_KEYS) {
    return toLazyObjectNode(node, depth, pathTokens);
  }
  var out = {};
  keys.forEach(function (k) {
    out[k] = buildBodyEnvelopeNode(node[k], depth + 1, pushPathToken(pathTokens, k));
  });
  return out;
}

function tryBuildBodyEnvelope(fullBody) {
  if (typeof fullBody !== 'string' || !fullBody) return null;
  if (fullBody.length > ENVELOPE_PARSE_MAX_CHARS) return null;
  try {
    var parsed = JSON.parse(fullBody);
    return buildBodyEnvelopeNode(parsed, 0, []);
  } catch (e) {
    return null;
  }
}

function resolveByPathTokens(root, pathTokens) {
  var cur = root;
  for (var i = 0; i < pathTokens.length; i++) {
    if (cur == null) return undefined;
    cur = cur[pathTokens[i]];
  }
  return cur;
}

/**
 * 读取某个路径节点的按需子片段（数组/对象）。
 * @returns {{
 *   kind: 'array'|'object',
 *   total: number,
 *   cursor: number,
 *   nextCursor: number,
 *   eof: boolean,
 *   items?: any[],
 *   entries?: Record<string, any>
 * }}
 */
function readResponseNodeSlice(apiId, pathTokens, cursor, limit) {
  migrateLegacyBodyToSidecarIfNeeded(apiId);
  var side = bodyPath(apiId);
  if (!fs.existsSync(side)) {
    throw new Error('缓存正文不存在');
  }
  var full = fs.readFileSync(side, 'utf8');
  if (full.length > ENVELOPE_PARSE_MAX_CHARS) {
    throw new Error('响应过大，节点按需解析超出限制');
  }
  var parsed = JSON.parse(full);
  var tokens = Array.isArray(pathTokens) ? pathTokens : [];
  var target = resolveByPathTokens(parsed, tokens);
  var start = parseInt(cursor, 10);
  if (isNaN(start) || start < 0) start = 0;
  var size = parseInt(limit, 10);
  if (isNaN(size) || size < 1) size = ENVELOPE_SAMPLE_ITEMS;
  size = Math.min(size, NODE_SLICE_MAX_ITEMS);

  if (Array.isArray(target)) {
    var total = target.length;
    var end = Math.min(total, start + size);
    var outItems = [];
    for (var i = start; i < end; i++) {
      outItems.push(buildBodyEnvelopeNode(target[i], 1, pushPathToken(tokens, i)));
    }
    return {
      kind: 'array',
      total: total,
      cursor: start,
      nextCursor: end,
      eof: end >= total,
      items: outItems,
    };
  }

  if (target && typeof target === 'object') {
    var keys = Object.keys(target);
    var totalK = keys.length;
    var endK = Math.min(totalK, start + size);
    var outEntries = {};
    for (var j = start; j < endK; j++) {
      var key = keys[j];
      outEntries[key] = buildBodyEnvelopeNode(target[key], 1, pushPathToken(tokens, key));
    }
    return {
      kind: 'object',
      total: totalK,
      cursor: start,
      nextCursor: endK,
      eof: endK >= totalK,
      entries: outEntries,
    };
  }

  throw new Error('目标节点不是对象或数组');
}

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function jsonPath(apiId) {
  return path.join(CACHE_DIR, String(apiId) + '.json');
}

function bodyPath(apiId) {
  return path.join(CACHE_DIR, String(apiId) + '.body.txt');
}

function deleteApiCacheFiles(apiId) {
  var id = String(apiId);
  try {
    var j = path.join(CACHE_DIR, id + '.json');
    if (fs.existsSync(j)) fs.unlinkSync(j);
    var b = path.join(CACHE_DIR, id + '.body.txt');
    if (fs.existsSync(b)) fs.unlinkSync(b);
  } catch (e) {}
}

/**
 * 旧版 json 内嵌超大 body 时，迁出到 .body.txt，避免反复整包 parse
 */
function migrateLegacyBodyToSidecarIfNeeded(apiId) {
  var j = jsonPath(apiId);
  if (!fs.existsSync(j)) return;
  var side = bodyPath(apiId);
  if (fs.existsSync(side)) return;
  var cache;
  try {
    cache = JSON.parse(fs.readFileSync(j, 'utf-8'));
  } catch (e) {
    return;
  }
  var lr = cache.lastResponse;
  if (!lr || typeof lr.body !== 'string' || lr.body.length < EXTERNAL_BODY_THRESHOLD_CHARS) return;
  if (lr.bodyStorage === 'file') return;
  try {
    fs.writeFileSync(side, lr.body, 'utf8');
    var slim = {};
    Object.keys(lr).forEach(function (k) {
      if (k !== 'body' && k !== 'parsedBody') slim[k] = lr[k];
    });
    slim.bodyStorage = 'file';
    slim.bodyCharLength = lr.body.length;
    slim.bodyEnvelope = tryBuildBodyEnvelope(lr.body) || undefined;
    var pub = sliceBodyPublicHeadFromFullString(lr.body);
    slim.bodyPublicHead = pub.head;
    slim.bodyPublicHeadByteLength = pub.headByteLength;
    slim.hint =
      '正文在 .body.txt；元数据已带公共前缀（可格式化），其余请在前端按需加载分片。';
    cache.lastResponse = slim;
    fs.writeFileSync(j, JSON.stringify(cache, null, 2));
  } catch (e) {}
}

function persistApiCache(apiId, cache) {
  ensureDir();
  var id = String(apiId);
  var lr = cache.lastResponse;
  if (lr && typeof lr.body === 'string' && lr.body.length >= EXTERNAL_BODY_THRESHOLD_CHARS) {
    fs.writeFileSync(bodyPath(id), lr.body, 'utf8');
    var slim = {};
    Object.keys(lr).forEach(function (k) {
      if (k !== 'body' && k !== 'parsedBody') slim[k] = lr[k];
    });
    slim.bodyStorage = 'file';
    slim.bodyCharLength = lr.body.length;
    slim.bodyEnvelope = tryBuildBodyEnvelope(lr.body) || undefined;
    var pub2 = sliceBodyPublicHeadFromFullString(lr.body);
    slim.bodyPublicHead = pub2.head;
    slim.bodyPublicHeadByteLength = pub2.headByteLength;
    slim.hint =
      '正文在 .body.txt；元数据已带公共前缀（可格式化），其余请在前端按需加载分片。';
    var outCache = {
      lastQuery: cache.lastQuery,
      lastBody: cache.lastBody,
      lastMethod: cache.lastMethod,
      lastResponse: slim,
      updatedAt: cache.updatedAt,
    };
    fs.writeFileSync(jsonPath(id), JSON.stringify(outCache, null, 2));
    return;
  }
  fs.writeFileSync(jsonPath(id), JSON.stringify(cache, null, 2));
}

/** 回写给浏览器的结果：超大时不带 body，避免二次巨包 JSON */
function toClientResponseResult(result) {
  if (!result || typeof result.body !== 'string' || result.body.length < EXTERNAL_BODY_THRESHOLD_CHARS) {
    return result;
  }
  var o = {};
  Object.keys(result).forEach(function (k) {
    if (k !== 'body' && k !== 'parsedBody') o[k] = result[k];
  });
  o.bodyStorage = 'file';
  o.bodyCharLength = result.body.length;
  o.bodyEnvelope = tryBuildBodyEnvelope(result.body) || undefined;
  var pub3 = sliceBodyPublicHeadFromFullString(result.body);
  o.bodyPublicHead = pub3.head;
  o.bodyPublicHeadByteLength = pub3.headByteLength;
  o.hint = '正文已落盘；已附带可格式化的公共前缀，其余按需分片加载。';
  return o;
}

/**
 * 旧 .json 无外置公共头时，从 .body.txt 前缀回填一次（便于列表/前端格式化）
 */
function ensurePublicHeadForSidecar(apiId) {
  migrateLegacyBodyToSidecarIfNeeded(apiId);
  var j = jsonPath(apiId);
  if (!fs.existsSync(j)) return;
  var cache;
  try {
    cache = JSON.parse(fs.readFileSync(j, 'utf-8'));
  } catch (e) {
    return;
  }
  var lr = cache.lastResponse;
  if (!lr || lr.bodyStorage !== 'file') return;
  if (lr.bodyPublicHead != null && String(lr.bodyPublicHead).length > 0) return;
  var side = bodyPath(apiId);
  if (!fs.existsSync(side)) return;
  try {
    var stat = fs.statSync(side);
    var cap = Math.min(BODY_PUBLIC_READ_BYTES, stat.size);
    if (cap <= 0) return;
    var fd = fs.openSync(side, 'r');
    try {
      var buf = Buffer.allocUnsafe(cap);
      var n = fs.readSync(fd, buf, 0, cap, 0);
      var s = buf.slice(0, n).toString('utf8');
      var head = s.slice(0, Math.min(BODY_PUBLIC_HEAD_CHARS, s.length));
      lr.bodyPublicHead = head;
      lr.bodyPublicHeadByteLength = Buffer.byteLength(head, 'utf8');
    } finally {
      try {
        fs.closeSync(fd);
      } catch (e2) {}
    }
    fs.writeFileSync(j, JSON.stringify(cache, null, 2));
  } catch (e3) {}
}

/**
 * 旧缓存缺少 bodyEnvelope 时，尝试从 .body.txt 回填结构外层快照。
 */
function ensureBodyEnvelopeForSidecar(apiId) {
  migrateLegacyBodyToSidecarIfNeeded(apiId);
  var j = jsonPath(apiId);
  if (!fs.existsSync(j)) return;
  var cache;
  try {
    cache = JSON.parse(fs.readFileSync(j, 'utf-8'));
  } catch (e) {
    return;
  }
  var lr = cache.lastResponse;
  if (!lr || lr.bodyStorage !== 'file') return;
  if (lr.bodyEnvelope != null) return;
  var side = bodyPath(apiId);
  if (!fs.existsSync(side)) return;
  try {
    var full = fs.readFileSync(side, 'utf8');
    var envelope = tryBuildBodyEnvelope(full);
    if (!envelope) return;
    lr.bodyEnvelope = envelope;
    fs.writeFileSync(j, JSON.stringify(cache, null, 2));
  } catch (e2) {}
}

/**
 * @returns {{ text: string, nextCursor: number, totalBytes: number, eof: boolean }}
 */
function readResponseBodySlice(apiId, byteCursor, maxBytes) {
  migrateLegacyBodyToSidecarIfNeeded(apiId);
  var side = bodyPath(apiId);
  if (!fs.existsSync(side)) {
    return { text: '', nextCursor: 0, totalBytes: 0, eof: true };
  }
  var stat = fs.statSync(side);
  var total = stat.size;
  var start = Math.max(0, Math.min(byteCursor | 0, total));
  var lim = maxBytes || DEFAULT_SLICE_BYTES;
  if (lim > MAX_SLICE_BYTES) lim = MAX_SLICE_BYTES;
  if (start >= total) {
    return { text: '', nextCursor: total, totalBytes: total, eof: true };
  }
  var fd = fs.openSync(side, 'r');
  try {
    var toRead = Math.min(lim, total - start);
    var buf = Buffer.allocUnsafe(toRead);
    var n = fs.readSync(fd, buf, 0, toRead, start);
    var text = buf.slice(0, n).toString('utf8');
    var next = start + n;
    return { text: text, nextCursor: next, totalBytes: total, eof: next >= total };
  } finally {
    try {
      fs.closeSync(fd);
    } catch (e2) {}
  }
}

/**
 * 在 .body.txt 中按字节区间扫描子串（UTF-8），用于远程搜索，避免整包进浏览器。
 * @param {string|number} apiId
 * @param {string} query 搜索关键字（按 UTF-8 编码匹配）
 * @param {number} byteStart 起始读取字节偏移
 * @param {number} maxScanBytes 本次最多扫描的字节数（上限 8MB）
 * @param {number} maxMatches 本次最多返回命中条数（上限 100）
 * @param {number} overlapBytes 分段重叠字节，避免关键字跨段漏检
 * @returns {{ matches: Array<{ byteOffset: number, snippet: string }>, nextScanByte: number, totalBytes: number, fileExhausted: boolean }}
 */
function searchResponseBody(apiId, query, byteStart, maxScanBytes, maxMatches, overlapBytes) {
  migrateLegacyBodyToSidecarIfNeeded(apiId);
  var side = bodyPath(apiId);
  if (!fs.existsSync(side)) {
    return { matches: [], nextScanByte: 0, totalBytes: 0, fileExhausted: true };
  }
  var total = fs.statSync(side).size;
  var start = Math.max(0, Math.min(byteStart | 0, total));
  var q = String(query || '');
  var defScan = 2 * 1024 * 1024;
  var scan = parseInt(maxScanBytes, 10);
  if (isNaN(scan) || scan < 65536) scan = defScan;
  scan = Math.min(8 * 1024 * 1024, scan);
  var maxHit = parseInt(maxMatches, 10);
  if (isNaN(maxHit) || maxHit < 1) maxHit = 30;
  maxHit = Math.min(100, maxHit);
  var overlap = parseInt(overlapBytes, 10);
  if (isNaN(overlap) || overlap < 0) overlap = 256;
  overlap = Math.min(4096, overlap);
  var SNIPPET_RADIUS = 1500;

  if (!q) {
    return { matches: [], nextScanByte: start, totalBytes: total, fileExhausted: start >= total };
  }

  var needle = Buffer.from(q, 'utf8');
  if (needle.length === 0) {
    return { matches: [], nextScanByte: start, totalBytes: total, fileExhausted: true };
  }

  var readStart = Math.max(0, start - overlap);
  var lead = start - readStart;
  var toRead = Math.min(scan + lead, total - readStart);
  if (toRead <= 0) {
    return { matches: [], nextScanByte: start, totalBytes: total, fileExhausted: true };
  }

  var fd = fs.openSync(side, 'r');
  try {
    var buf = Buffer.allocUnsafe(toRead);
    var n = fs.readSync(fd, buf, 0, toRead, readStart);
    if (n <= 0) {
      return { matches: [], nextScanByte: start, totalBytes: total, fileExhausted: true };
    }
    var matches = [];
    var idx = 0;
    while (idx < n && matches.length < maxHit) {
      var hit = buf.indexOf(needle, idx);
      if (hit < 0) break;
      var abs = readStart + hit;
      if (abs < start) {
        idx = hit + Math.max(1, needle.length);
        continue;
      }
      var s0 = Math.max(0, hit - SNIPPET_RADIUS);
      var s1 = Math.min(n, hit + needle.length + SNIPPET_RADIUS);
      matches.push({ byteOffset: abs, snippet: buf.slice(s0, s1).toString('utf8') });
      idx = hit + Math.max(1, needle.length);
    }
    var nextScan = Math.min(total, start + scan);
    if (nextScan < start) nextScan = start;
    var fileExhausted = nextScan >= total;
    return { matches: matches, nextScanByte: nextScan, totalBytes: total, fileExhausted: fileExhausted };
  } finally {
    try {
      fs.closeSync(fd);
    } catch (e2) {}
  }
}

var _mainDataPath;
function resolveMainDataPath() {
  if (_mainDataPath) return _mainDataPath;
  var candidates = [
    path.join(process.cwd(), 'service', 'app', 'data', 'api', 'apiDebug', 'apiDebug', 'apiDebug.json'),
    path.join(process.cwd(), 'data', 'api', 'apiDebug', 'apiDebug', 'apiDebug.json'),
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (fs.existsSync(candidates[i])) { _mainDataPath = candidates[i]; return _mainDataPath; }
  }
  _mainDataPath = candidates[0];
  return _mainDataPath;
}

function writeMainDataWithRetry(data, maxRetries) {
  var filePath = resolveMainDataPath();
  var content = JSON.stringify(data, null, 4);
  maxRetries = maxRetries || 5;
  for (var attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(filePath, content);
      return;
    } catch (e) {
      if (attempt === maxRetries) throw e;
      var end = Date.now() + 50 * (attempt + 1);
      while (Date.now() < end) { /* brief sync delay before retry */ }
    }
  }
}

module.exports = {
  CACHE_DIR: CACHE_DIR,
  /** 可调：超过则写入 .body.txt 且接口响应不再携带全文 */
  EXTERNAL_BODY_THRESHOLD_CHARS: EXTERNAL_BODY_THRESHOLD_CHARS,
  deleteApiCacheFiles: deleteApiCacheFiles,
  migrateLegacyBodyToSidecarIfNeeded: migrateLegacyBodyToSidecarIfNeeded,
  persistApiCache: persistApiCache,
  toClientResponseResult: toClientResponseResult,
  ensurePublicHeadForSidecar: ensurePublicHeadForSidecar,
  ensureBodyEnvelopeForSidecar: ensureBodyEnvelopeForSidecar,
  readResponseNodeSlice: readResponseNodeSlice,
  readResponseBodySlice: readResponseBodySlice,
  searchResponseBody: searchResponseBody,
  bodyPath: bodyPath,
  jsonPath: jsonPath,
  writeMainDataWithRetry: writeMainDataWithRetry,
};
