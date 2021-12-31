(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    let enumList = [];
    let values = {};
    if (argParams.strategy === "onlyEnglish") {
      const pattern = /[a-zA-z]+/g;
      let result;
      while ((result = pattern.exec(argParams.content)) != null) {
        enumList.push(result[0]);
      }
    } else if (argParams.strategy === "englishKeyChineseDesc") {
      const chinese = "([\u4e00-\u9fa5]+)",
        separator = "\\s*[-:]\\s*",
        english = "([a-zA-Z_]+)";
      const chineseStartPattern = new RegExp(
        chinese + separator + english,
        "g"
      );
      const englishStartPattern = new RegExp(
        english + separator + chinese,
        "g"
      );
      let result;
      while ((result = chineseStartPattern.exec(argParams.content)) != null) {
        values[result[2]] = result[1];
        enumList.push(result[2]);
      }

      if (!enumList.length) {
        while ((result = englishStartPattern.exec(argParams.content)) != null) {
          values[result[1]] = result[2];
          enumList.push(result[1]);
        }
      }
      if (!enumList.length) {
        console.log("正则无法匹配");
      }
    }
    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          data: {
            enumList: enumList.length > 0 ? enumList : null,
            values: Object.keys(values).length > 0 ? values : null,
          },
        },
      },
    };
  };
})();
