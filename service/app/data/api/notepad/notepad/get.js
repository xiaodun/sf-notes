(function () {
  return function (argData, argParams) {
    let filterTagIdList = argParams.filter.tagIdList;
    if (filterTagIdList && filterTagIdList.length > 0) {
      //过滤
      argData = argData.filter ((notepad, index, arr) => {
        if (notepad.tagIdList && notepad.tagIdList.length > 0) {
          let isNotContain = filterTagIdList.some ((tagId, index1, arr1) => {
            if (!~notepad.tagIdList.indexOf (tagId)) {
              return true;
            }
          });
          return !isNotContain;
        }
      });
    }
    //argData 数据的副本
    let start = (argParams.page - 1) * argParams.size;
    let end = start + argParams.size;
    let arr = argData.slice (start, end);

    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          data: arr,
          total: argData.length,
        },
      },
    };
  };
}) ();
