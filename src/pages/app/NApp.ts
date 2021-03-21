import NRouter from '@/../config/router/NRouter';
interface NApp {
  name: string;
  path: string;
}
namespace NApp {
  export const list: NApp[] = [
    {
      name: '记事本',
      path: NRouter.notesPath,
    },
    {
      name: '文件管理',
      path: NRouter.filePath,
    },
    {
      name: '写书籍',
      path: NRouter.bookPath,
    },
    {
      name: '二维码',
      path: NRouter.qrCodePath,
    },
    {
      name: '测试用例',
      path: NRouter.testPath,
    },
  ];
  export function getAppInfoByPath(path: string) {
    const app = list.find((item) => item.path === path);
    return app;
  }
}
export default NApp;
