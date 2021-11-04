import { IRoute } from "umi";
export namespace NRouter {
  export const rootPath = "/";
  export const rootComponentPath = "Welcome";
  export const appPath = "/app";
  export const testPath = "/test";
  export const notesPath = "/notes";
  export const filePath = "/file";
  export const bookPath = "/book";
  export const bookEditPath = bookPath + "/edit";
  export const qrCodePath = "/qrCode";
  export const projectPath = "/project";
  export const projectOverviewPath = projectPath + "/overview";
  export const projectCommandPath = projectPath + "/command";
  export const projectSwaggerPath = projectPath + "/swagger";
  export const routes: IRoute[] = [
    {
      path: rootPath,
      component: "." + appPath,
      wrappers: [rootComponentPath],
    },
    {
      path: appPath,
      component: "." + appPath,
      wrappers: [rootComponentPath],
    },
    {
      path: notesPath,
      wrappers: [rootComponentPath],
      component: "." + notesPath,
    },
    {
      path: testPath,
      component: "." + testPath,
      wrappers: [rootComponentPath],
    },
    {
      path: bookPath,
      component: "." + bookPath,
      wrappers: [rootComponentPath],
    },
    {
      path: bookEditPath,
      component: "." + bookEditPath,
      wrappers: [rootComponentPath],
    },
    {
      path: filePath,
      component: "." + filePath,
      wrappers: [rootComponentPath],
    },
    {
      path: qrCodePath,
      component: "." + "/qr-code",
      wrappers: [rootComponentPath],
    },
    {
      path: projectPath,
      component: "." + "/project",
      wrappers: [rootComponentPath],
    },
    {
      path: projectOverviewPath,
      component: "." + projectOverviewPath,
      wrappers: [rootComponentPath],
    },
    {
      path: projectCommandPath,
      component: "." + projectCommandPath,
      wrappers: [rootComponentPath],
    },
    {
      path: projectSwaggerPath,
      component: "." + projectSwaggerPath,
      wrappers: [rootComponentPath],
    },
  ];
  export function isHomePage(path: string) {
    return path === rootPath || path === appPath;
  }
  export function toHomePage() {
    window.umiHistory.push(rootPath);
  }
}

export default NRouter;
