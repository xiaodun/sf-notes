(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    let id = argParams.id;
    let notepad = argData.find (el => {
      if (el.id === id) {
        return el;
      }
    });
    notepad.updateTime = +new Date ();
    notepad.title = argParams.title;
    notepad.content = argParams.content;
    notepad.tagIdList = argParams.tagIdList;
    return {
      isWrite: true, //是否覆盖数据
      data: argData, //需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          data: notepad,
        },
      },
    };
  };
}) ();
