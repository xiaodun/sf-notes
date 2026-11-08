/**
 * 手机 HTTPS 访问代理:
 *   https://<本机IP>:8443  →  http://127.0.0.1:<PORT|8000>(umi dev)
 *
 * 背景:umi3 的 https 模式依赖 spdy(process.binding('http_parser') 等),
 * 在 Node 22+ 上启动即崩,所以 dev 保持 HTTP,由本脚本在前面套一层 TLS。
 * 证书为自签,SAN 绑定当前局域网 IP,IP 变化时自动重签,换电脑零配置。
 * 用法:npm run dev(带 --dev,同时拉起 umi dev);
 *      或 dev 已在别处运行时,npm run https 只起代理。
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync, spawn } = require('child_process');

const upstreamPort = Number(process.env.PORT) || 8000;
const listenPort = Number(process.env.HTTPS_PORT) || 8443;
const withDev = process.argv.includes('--dev');
/**
 * 证书模板版本:变更签发参数(扩展、算法等)时递增,
 * 已有证书即使 IP 没变也会自动重签。v2:补 CA:FALSE 与 serverAuth,
 * 修复 Gecko 系浏览器(Firefox/Zen)对 CA:TRUE 服务器证书直接拒绝的问题。
 */
const CERT_VERSION = 'v2';
const httpsDir = path.join(__dirname, 'config', 'https');
const certFile = path.join(httpsDir, 'dev-cert.pem');
const keyFile = path.join(httpsDir, 'dev-key.pem');
const certIpFile = path.join(httpsDir, 'dev-cert.ip');

/** 取局域网 IPv4:192.168 网段最常见放最前,虚拟网卡的 172.x 垫底 */
function getLanIp() {
  const all = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const net of list || []) {
      if (
        (net.family === 'IPv4' || net.family === 4) &&
        !net.internal
      ) {
        all.push(net.address);
      }
    }
  }
  const priority = (ip) =>
    ip.startsWith('192.168.') ? 0 : ip.startsWith('10.') ? 1 : 2;
  all.sort((a, b) => priority(a) - priority(b));
  return all[0];
}

/**
 * 找 openssl:PATH 里没有时退回 Git for Windows 的常见安装路径
 * (cmd 环境下 Git 的 usr/bin 通常不在 PATH,Git Bash 里才在)
 */
function findOpenssl() {
  const candidates = [
    'openssl',
    'C:\\Program Files\\Git\\usr\\bin\\openssl.exe',
    'C:\\Program Files (x86)\\Git\\usr\\bin\\openssl.exe',
  ];
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ['version'], { stdio: 'ignore' });
      return candidate;
    } catch (error) {
      //试下一个候选路径
    }
  }
  return null;
}

function ensureCert(lanIp) {
  const reused =
    lanIp &&
    fs.existsSync(certFile) &&
    fs.existsSync(keyFile) &&
    fs.existsSync(certIpFile) &&
    fs.readFileSync(certIpFile, 'utf8').trim() === `${lanIp}|${CERT_VERSION}`;
  if (reused) {
    return {
      cert: fs.readFileSync(certFile),
      key: fs.readFileSync(keyFile),
      created: false,
    };
  }
  const openssl = findOpenssl();
  if (!openssl) {
    console.error(
      '找不到 openssl:请安装 Git for Windows,或把 openssl 加入 PATH。',
    );
    process.exit(1);
  }
  if (!fs.existsSync(httpsDir)) {
    fs.mkdirSync(httpsDir, { recursive: true });
  }
  const sans = ['DNS:localhost', 'IP:127.0.0.1'];
  if (lanIp) {
    sans.push(`IP:${lanIp}`);
  }
  execFileSync(
    openssl,
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-sha256',
      '-days',
      '3650',
      '-nodes',
      '-keyout',
      keyFile,
      '-out',
      certFile,
      '-subj',
      '/CN=sf-notes-dev',
      //openssl 默认签出 CA:TRUE 且无用途声明,Chromium 宽容,
      //Gecko 系(Firefox/Zen)会按硬错误拒绝且不给「接受风险」入口
      '-addext',
      'basicConstraints=critical,CA:FALSE',
      '-addext',
      'keyUsage=critical,digitalSignature,keyEncipherment',
      '-addext',
      'extendedKeyUsage=serverAuth',
      '-addext',
      `subjectAltName=${sans.join(',')}`,
    ],
    { stdio: 'ignore' },
  );
  if (lanIp) {
    fs.writeFileSync(certIpFile, `${lanIp}|${CERT_VERSION}`, 'utf8');
  }
  return {
    cert: fs.readFileSync(certFile),
    key: fs.readFileSync(keyFile),
    created: true,
  };
}

function forwardHeaders(req) {
  return { ...req.headers, host: `127.0.0.1:${upstreamPort}` };
}

/**
 * 打印访问入口。--dev 模式下 umi 编译完会自己打印「App running at」(HTTP 地址,
 * 关不掉),这里仅以同款格式与颜色(chalk.cyan)追加 HTTPS 手机入口一行;
 * 纯代理模式(npm run https)下没有 umi 输出,才列全量。
 */
function printEntryBanner() {
  if (withDev) {
    const cyan = (text) =>
      process.stdout.isTTY ? `\x1b[36m${text}\x1b[39m` : text;
    if (lanIp) {
      console.log(`  - Https:   ${cyan(`https://${lanIp}:${listenPort}`)}`);
    }
    return;
  }
  console.log('');
  console.log('==================================================');
  console.log(' 访问入口:');
  if (lanIp) {
    console.log(`   手机(HTTPS) https://${lanIp}:${listenPort}`);
    console.log(`   手机(HTTP)  http://${lanIp}:${upstreamPort}`);
  }
  console.log(`   本机         http://localhost:${upstreamPort}`);
  console.log('   · 自签证书,首次访问需点「高级/继续访问」');
  console.log('==================================================');
}

const lanIp = getLanIp();
const { cert, key, created } = ensureCert(lanIp);

const server = https.createServer({ cert, key }, (req, res) => {
  const upstream = http.request(
    {
      hostname: '127.0.0.1',
      port: upstreamPort,
      path: req.url,
      method: req.method,
      headers: forwardHeaders(req),
    },
    (upstreamRes) => {
      console.log(`[req] ${req.method} ${req.url} -> ${upstreamRes.statusCode}`);
      res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );
  upstream.on('error', (error) => {
    console.log(`[req] ${req.method} ${req.url} -> 上游错误 ${error.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end(
      `上游 http://127.0.0.1:${upstreamPort} 不可用:${error.message}\n` +
        `若 dev 服务正在编译请稍等;尚未启动则先运行 npm run dev`,
    );
  });
  req.pipe(upstream);
});

/** 诊断日志:TLS 握手成功但后续没有 [req],说明客户端在证书校验后主动弃连 */
server.on('secureConnection', (socket) => {
  console.log(`[tls] 握手完成 ${socket.remoteAddress}`);
});

/** 热更新(webpack-dev-server 的 sockjs/ws)走 WebSocket,需透传 101 升级 */
server.on('upgrade', (req, socket, head) => {
  console.log(`[ws] ${req.url}`);
  const upstream = http.request({
    hostname: '127.0.0.1',
    port: upstreamPort,
    path: req.url,
    method: req.method,
    headers: forwardHeaders(req),
  });
  upstream.on('upgrade', (upstreamRes, upstreamSocket, upstreamHead) => {
    const headerLines = Object.entries(upstreamRes.headers).map(
      ([name, value]) => `${name}: ${value}`,
    );
    socket.write(
      `HTTP/1.1 ${upstreamRes.statusCode} ${upstreamRes.statusMessage}\r\n` +
        headerLines.join('\r\n') +
        '\r\n\r\n',
    );
    if (upstreamHead && upstreamHead.length) {
      socket.write(upstreamHead);
    }
    upstreamSocket.pipe(socket).pipe(upstreamSocket);
  });
  //升级失败(如 dev 未启动)时简单回写状态并断开,页面会自行重试
  upstream.on('response', (upstreamRes) => {
    socket.write(
      `HTTP/1.1 ${upstreamRes.statusCode} ${upstreamRes.statusMessage}\r\n\r\n`,
    );
    socket.destroy();
  });
  upstream.on('error', () => socket.destroy());
  upstream.end(head && head.length ? head : undefined);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `端口 ${listenPort} 已被占用,可用环境变量 HTTPS_PORT 换一个,如:`,
    );
    console.error(`  HTTPS_PORT=${listenPort + 1} npm run https`);
  } else {
    console.error('代理启动失败:', error);
  }
  process.exit(1);
});

server.listen(listenPort, '0.0.0.0', () => {
  if (!withDev) {
    //纯代理模式:上游已在别处运行,直接给出全部入口
    printEntryBanner();
    return;
  }
  console.log(
    `HTTPS 代理就绪(证书${created ? '已按当前网络签发' : '沿用上次签发'}),正在启动 dev 服务(编译需一两分钟)…`,
  );
  //整条命令作为字符串传给 shell,避免 spawn(shell:true)+args 触发 DEP0190 警告
  const devChild = spawn('npm run start:dev', {
    shell: true,
    stdio: 'inherit',
    env: process.env,
  });
  devChild.on('exit', (code) => {
    console.log(`dev 服务已退出(exit ${code}),代理一并退出`);
    process.exit(code === null ? 1 : code);
  });
  //轮询上游直到能响应(umi 编译完成后才应答),届时把全部入口汇总打印到屏底,
  //避免启动横幅被 umi 的编译日志刷走;编译期间的探测请求会被 wds 全部挂起、
  //完成瞬间同时返回,需防重复打印
  let readyPrinted = false;
  const probe = setInterval(() => {
    const req = http.get(
      `http://127.0.0.1:${upstreamPort}/`,
      (upstreamRes) => {
        upstreamRes.resume();
        if (readyPrinted) {
          return;
        }
        readyPrinted = true;
        clearInterval(probe);
        printEntryBanner();
      },
    );
    req.on('error', () => {
      //dev 尚未监听,继续等下一轮
    });
    req.setTimeout(15000, () => req.destroy());
  }, 2000);
  //代理自身退出时兜底清理子进程(正常 Ctrl+C 时子进程也会收到信号自行退出)
  process.on('exit', () => {
    try {
      devChild.kill();
    } catch (error) {
      //子进程已退出
    }
  });
});
