import NRouter from "@/../config/router/NRouter";
interface NApp {
  name: string;
  path: string;
}
namespace NApp {
  export const list: NApp[] = [
    {
      name: "记事本",
      path: NRouter.notesPath,
    },
    {
      name: "项目管理",
      path: NRouter.projectPath,
    },
    {
      name: "迭代开发",
      path: NRouter.iterativePath,
    },
    {
      name: "文件管理",
      path: NRouter.filePath,
    },
    {
      name: "活动领取",
      path: NRouter.activityPath,
    },
    // {
    //   name: "足球",
    //   path: NRouter.footballPath,
    // },
    {
      name: "二维码",
      path: NRouter.qrCodePath,
    },
    {
      name: "测试用例",
      path: NRouter.testPath,
    },
  ];
  export function getAppInfoByPath(path: string) {
    const app = list.find((item) => item.path === path);
    return app;
  }
}
export default NApp;
