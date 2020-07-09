// @ts-nocheck
import { Plugin } from '/Users/wangxu/Documents/GitHub/sf-pc-web/node_modules/_@umijs_runtime@3.2.9@@umijs/runtime';

const plugin = new Plugin({
  validKeys: ['patchRoutes','rootContainer','render','onRouteChange','getInitialState','locale','locale','request',],
});
plugin.register({
  apply: require('/Users/wangxu/Documents/GitHub/sf-pc-web/node_modules/_umi-plugin-antd-icon-config@2.0.3@umi-plugin-antd-icon-config/lib/app.js'),
  path: '/Users/wangxu/Documents/GitHub/sf-pc-web/node_modules/_umi-plugin-antd-icon-config@2.0.3@umi-plugin-antd-icon-config/lib/app.js',
});
plugin.register({
  apply: require('../plugin-initial-state/runtime'),
  path: '../plugin-initial-state/runtime',
});
plugin.register({
  apply: require('/Users/wangxu/Documents/GitHub/sf-pc-web/src/.umi/plugin-locale/runtime.tsx'),
  path: '/Users/wangxu/Documents/GitHub/sf-pc-web/src/.umi/plugin-locale/runtime.tsx',
});
plugin.register({
  apply: require('../plugin-model/runtime'),
  path: '../plugin-model/runtime',
});

export { plugin };
