import NRouter from '@/../config/router/NRouter';
interface TApp {
  name: string;
  path: string;
}
namespace TApp {
  export const list: TApp[] = [
    {
      name: '日记本',
      path: NRouter.notesPath,
    },
    {
      name: '测试用例',
      path: NRouter.testPath,
    },
  ];
}
export default TApp;
