// @ts-nocheck
import { ApplyPluginsType } from '/Users/wangxu/Documents/GitHub/sf-pc-web/node_modules/@umijs/runtime';
import { plugin } from './plugin';

const routes = [
  {
    "paht": "/",
    "component": require('/Users/wangxu/Documents/GitHub/sf-pc-web/src/pages/Welcome').default,
    "exact": true
  }
];

// allow user to extend routes
plugin.applyPlugins({
  key: 'patchRoutes',
  type: ApplyPluginsType.event,
  args: { routes },
});

export { routes };
