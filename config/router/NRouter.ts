import { IRoute, history } from 'umi';
export namespace NRouter {
  export const rootPath = '/';
  export const rootComponentPath = 'Welcome';
  export const appPath = '/app';
  export const testPath = '/test';
  export const notesPath = '/notes';
  export const filePath = '/file';
  export const routes: IRoute[] = [
    {
      path: rootPath,
      component: '.' + appPath,
      wrappers: [rootComponentPath],
    },
    {
      path: appPath,
      component: '.' + appPath,
      wrappers: [rootComponentPath],
    },
    {
      path: notesPath,
      wrappers: [rootComponentPath],
      component: '.' + notesPath,
    },
    {
      path: testPath,
      component: '.' + testPath,
      wrappers: [rootComponentPath],
    },
    {
      path: filePath,
      component: '.' + filePath,
      wrappers: [rootComponentPath],
    },
    {
      path: filePath,
      component: '.' + filePath,
      wrappers: [rootComponentPath],
    },
  ];
  export function isHomePage(path: string) {
    return path === rootPath || path === appPath;
  }
  export function toHomePage() {
    history.push(rootPath);
  }
}

export default NRouter;
