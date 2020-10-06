import { IConfigFromPlugins } from '@/.umi/core/pluginConfig';
import { RouterOptions } from 'express';
import { IRoute, Router } from 'umi';
declare let UmiConfig: IConfigFromPlugins;

export namespace NRouter {
  export const appPath = '/app';
  export const testPath = '/test';
  export const notesPath = '/notes';
  export const routes: IRoute[] = [
    {
      path: '/',
      component: 'Welcome',
      routes: [
        {
          path: appPath,
          component: '.' + appPath,
        },
        {
          path: '/test',
          component: '.' + testPath,
        },
        {
          path: '/notes',
          component: '.' + notesPath,
        },
      ],
    },
  ];
}

interface NewPricePageState {
  test: {
    name: 1;
  };
}

declare let _foo: NewPricePageState;
let bar: typeof _foo.test;
