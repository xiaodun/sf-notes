(function () {
  return function (argData, argParams, external) {
    argData = external.getBaseStructure(argData);
    const menuList = argData.command.menuList.map((item) => {
      if (!item.children) {
        item.children = [];
        item.isProject = false;
      }
      return {
        ...item,
      };
    });
    const projectList = argData.projectList.map((item) => {
      if (!item.children) {
        item.children = [];
        item.isProject = true;
      }
      return {
        ...item,
      };
    });
    //argData 数据的副本
    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          list: [...menuList, ...projectList],
        },
      },
    };
  };
})();
