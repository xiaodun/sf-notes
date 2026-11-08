/**
 * 下面这样写在其他文件就可已自动导入...
 */
import {} from 'lodash';
import {} from '@ant-design/icons';
import { History, Dispatch } from 'umi';
import UWsBridge from '@/common/utils/UWsBridge';
declare global {
  interface Window {
    umiHistory: History;
    umiDispatch: Dispatch;
  }
}
/**
 * 全局兜底报错显示:手机浏览器(如 Zen/Gecko 系)没有控制台,
 * 页面脚本一旦崩溃只能看到白屏,无从定位;
 * 这里把错误直接写到页面顶部红条里,便于无 devtools 的环境排障。
 */
function showGlobalError(text: string) {
  try {
    let bar = document.getElementById('global-error-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'global-error-bar';
      bar.style.cssText =
        'position:fixed;top:0;left:0;right:0;z-index:2147483647;' +
        'max-height:45%;overflow:auto;background:#a61d24;color:#fff;' +
        'font:12px/1.5 monospace;padding:8px;white-space:pre-wrap;word-break:break-all;';
      (document.body || document.documentElement).appendChild(bar);
    }
    bar.textContent += text + '\n\n';
  } catch (error) {
    //报错条自身失败时放弃
  }
}
window.addEventListener('error', (event) => {
  const target = event.target as HTMLElement;
  if (target && target.tagName && !((event as any).message)) {
    //资源(script/css/img)加载失败走这里
    showGlobalError(
      `[资源加载失败] ${target.tagName} ${(target as any).src ||
        (target as any).href}`,
    );
    return;
  }
  showGlobalError(
    `[脚本错误] ${event.message}\n${(event.error && event.error.stack) ||
      `${event.filename}:${event.lineno}`}`,
  );
});
window.addEventListener('unhandledrejection', (event) => {
  const reason: any = event.reason;
  showGlobalError(
    `[Promise未捕获] ${(reason && (reason.stack || reason.message)) ||
      reason}`,
  );
});
if ('serviceWorker' in navigator) {
  // unregister service worker
  const { serviceWorker } = navigator;
  if (serviceWorker.getRegistrations) {
    serviceWorker.getRegistrations().then((sws) => {
      sws.forEach((sw) => {
        sw.unregister();
      });
    });
  }
  serviceWorker.getRegistration().then((sw) => {
    if (sw) sw.unregister();
  });

  // remove all caches
  if (window.caches && window.caches.keys) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        caches.delete(key);
      });
    });
  }
}
UWsBridge.init();
