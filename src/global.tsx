/**
 * 下面这样写在其他文件就可已自动导入...
 */
import {} from 'lodash';
import {} from '@ant-design/icons';
import { History, Dispatch } from 'umi';
declare global {
  interface Window {
    umiHistory: History;
    umiDispatch: Dispatch;
  }
}
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
