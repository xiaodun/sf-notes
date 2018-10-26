(function () {
  return function (argData, argParams, argEnv) {
    //argData 数据的副本
    let id = argParams.id;
    let file = '';
    argData.some ((el, index, arr) => {
      if (el.id === id) {
        file = {
          flag: el.flag,
          name: el.name,
        };
        return true;
      }
    });
    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      isDownload: true,
      file,
      response: {
        //返回的数据
        code: 200,
        data: {},
      },
    };
  };
}) ();
