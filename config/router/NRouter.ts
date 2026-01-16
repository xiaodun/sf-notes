import { IRoute } from "umi";
export namespace NRouter {
  export const rootPath = "/";
  export const rootComponentPath = "Welcome";
  export const appPath = "/app";
  export const testPath = "/test";
  export const notesPath = "/notes";
  export const filePath = "/file";
  export const qrCodePath = "/qrCode";
  export const projectPath = "/project";
  export const projectSnippetPath = projectPath + "/snippet";
  export const projectSwaggerPath = projectPath + "/swagger";
  export const iterativePath = "/iterative";
  export const iterativeReleasePath = iterativePath + "/release";
  export const footballPath = "/football";
  export const footballPredictPath = footballPath + "/predict";
  export const jokesPath = "/jokes";
  export const classicsPath = "/classics";
  export const maximPath = "/maxim";
  export const lotteryPath = "/lottery";
  export const lotteryPredictPath = lotteryPath + "/predict";
  export const sevenStarPath = "/seven-star";
  export const sevenStarPredictPath = sevenStarPath + "/predict";
  export const behaviorPath = "/behavior";
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
      path: projectSnippetPath,
      component: "." + projectSnippetPath,
      wrappers: [rootComponentPath],
    },
    {
      path: projectSwaggerPath,
      component: "." + projectSwaggerPath,
      wrappers: [rootComponentPath],
    },
    {
      path: iterativePath,
      component: "." + iterativePath,
      wrappers: [rootComponentPath],
    },
    {
      path: iterativeReleasePath,
      component: "." + iterativeReleasePath,
      wrappers: [rootComponentPath],
    },

    {
      path: footballPath,
      component: "." + footballPath,
      wrappers: [rootComponentPath],
    },
    {
      path: footballPredictPath,
      component: "." + footballPredictPath,
      wrappers: [rootComponentPath],
    },
    {
      path: jokesPath,
      component: "." + jokesPath,
      wrappers: [rootComponentPath],
    },
    {
      path: classicsPath,
      component: "." + classicsPath,
      wrappers: [rootComponentPath],
    },
    {
      path: maximPath,
      component: "." + maximPath,
      wrappers: [rootComponentPath],
    },
    {
      path: lotteryPath,
      component: "." + lotteryPath,
      wrappers: [rootComponentPath],
    },
    {
      path: lotteryPredictPath,
      component: "." + lotteryPredictPath,
      wrappers: [rootComponentPath],
    },
    {
      path: sevenStarPath,
      component: "." + sevenStarPath,
      wrappers: [rootComponentPath],
    },
    {
      path: sevenStarPredictPath,
      component: "." + sevenStarPredictPath,
      wrappers: [rootComponentPath],
    },
    {
      path: behaviorPath,
      component: "." + behaviorPath,
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
