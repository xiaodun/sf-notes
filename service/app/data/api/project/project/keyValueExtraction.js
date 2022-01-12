(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    let enumList = [];
    let values = {};
    const prettier = require("prettier");
    if (argParams.strategy === "onlyEnglish") {
      const pattern = /[a-zA-z]+/g;
      let result;
      while ((result = pattern.exec(argParams.content)) != null) {
        enumList.push(result[0]);
      }
    } else {
      const chinese = "([\u4e00-\u9fa5]+)",
        separator = "\\s*[-:]?\\s*",
        english = "([a-zA-Z_]+)";
      let result;
      if (argParams.strategy === "chineseEnglish") {
        const chineseStartPattern = new RegExp(
          chinese + separator + english,
          "g"
        );
        while ((result = chineseStartPattern.exec(argParams.content)) != null) {
          values[result[2]] = result[1];
          enumList.push(result[2]);
        }
      } else if (argParams.strategy === "englishChinese") {
        const englishStartPattern = new RegExp(
          english + separator + chinese,
          "g"
        );
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
            enumStr:
              enumList.length > 0 ? JSON.stringify(enumList, null, 2) : null,
            values: Object.keys(values).length > 0 ? values : null,
            valueStr: JSON.stringify(values, null, 2),
          },
        },
      },
    };
  };
})();
