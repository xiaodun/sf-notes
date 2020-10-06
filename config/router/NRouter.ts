import { IRoute } from 'umi';
export namespace NRouter {
  export const appPath = '/app';
  export const testPath = '/test';
  export const notesPath = '/notes';
  export const filePath = '/file';
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
          path: notesPath,
          component: '.' + notesPath,
        },
        {
          path: testPath,
          component: '.' + testPath,
        },
        {
          path: filePath,
          component: '.' + filePath,
        },
      ],
    },
  ];
}

export default NRouter;
