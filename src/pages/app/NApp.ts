import NRouter from "@/../config/router/NRouter";
interface NApp {
  name: string;
  path: string;
  linkType?: "internal" | "external"; // 链接类型：内部路由或外部链接
}
namespace NApp {
  export const list: NApp[] = [
    {
      name: "记事本",
      path: NRouter.notesPath,
      linkType: "internal",
    },
    {
      name: "项目管理",
      path: NRouter.projectPath,
      linkType: "internal",
    },
    {
      name: "迭代开发",
      path: NRouter.iterativePath,
      linkType: "internal",
    },
    {
      name: "文件管理",
      path: NRouter.filePath,
      linkType: "internal",
    },
    {
      name: "活动领取",
      path: NRouter.activityPath,
      linkType: "internal",
    },
    {
      name: "足球",
      path: NRouter.footballPath,
      linkType: "external", // 外部链接
    },
    {
      name: "二维码",
      path: NRouter.qrCodePath,
      linkType: "internal",
    },
    {
      name: "测试用例",
      path: NRouter.testPath,
      linkType: "internal",
    },
  ];
  export function getAppInfoByPath(path: string) {
    const app = list.find((item) => item.path === path);
    return app;
  }
}
export default NApp;
