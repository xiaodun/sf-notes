// @ts-nocheck
import { ApplyPluginsType } from 'D:/github/sf-pc-web/node_modules/_@umijs_runtime@3.2.9@@umijs/runtime';
import { plugin } from './plugin';

const routes = [
  {
    "paht": "/",
    "component": require('D:/github/sf-pc-web/src/pages/Welcome').default,
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
