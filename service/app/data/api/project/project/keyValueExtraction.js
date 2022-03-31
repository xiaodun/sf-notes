(function () {
  return function (argData, argParams) {
    let enumList = [];
    let values = {};
    const prettier = require("prettier");

    if (argParams.strategy === "onlyEnglish") {
      //只有英文
      const pattern = /[a-zA-z]+/g;
      let result;
      while ((result = pattern.exec(argParams.content)) != null) {
        enumList.push(result[0]);
      }
    } else {
      //中英结合
      const chinese = "([\u4e00-\u9fa5]+)",
        separator = "\\s*[-:]?\\s*",
        english = "([0-9a-zA-Z_]+)";
      let result;
      if (argParams.strategy === "chineseEnglish") {
        //中文前英文后
        const chineseStartPattern = new RegExp(
          chinese + separator + english,
          "g"
        );
        while ((result = chineseStartPattern.exec(argParams.content)) != null) {
          values[result[2]] = result[1];
          enumList.push(result[2]);
        }
      } else if (argParams.strategy === "englishChinese") {
        //英文前中文后
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
      response: {
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
