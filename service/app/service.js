var Service = require('sf-inner-service');
var file_os = require('fs');
let config = JSON.parse(file_os.readFileSync('config.json', 'utf-8'));

// 兜底：框架下载文件用的是 file_os.ReadStream(path).pipe(response)，没有挂 error 监听，
// 目标文件缺失时 'error' 事件没人接 → 未捕获异常 → 整个服务进程退出（文件管理页点下载就中招）。
// 这里给 ReadStream 补一个 error 监听：这次请求失败就算了，别把服务带崩。
// 正常路径已有 downloadFile.js 的前置判断，这里防的是文件中途消失 / 权限异常这类残留情况。
var OriginalReadStream = file_os.ReadStream;
function SafeReadStream(path, options) {
  var stream = new OriginalReadStream(path, options);
  stream.on('error', function (err) {
    console.error('[readStream-error]', path, err && err.message);
  });
  return stream;
}
SafeReadStream.prototype = OriginalReadStream.prototype;
file_os.ReadStream = SafeReadStream;

Service.start(config);
