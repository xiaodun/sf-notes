(function () {
  return function (argData, argParams) {
    let enumList = [];
    let values = {};
    if (argParams.strategy === "onlyValue") {
      //只有值
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

      // 辅助函数：处理值类型转换
      const processValue = (val) => {
        if (argParams.valueType === "number") {
          const num = Number(val);
          return isNaN(num) ? val : num;
        }
        return val;
      };

      if (argParams.strategy === "auto") {
        const chinese = "([\u4e00-\u9fa5]+)",
          separator = "\\s*[-:]?\\s*",
          english = "([0-9a-zA-Z_]+)";
        let result;

        // 尝试等号分割 key=value
        const equalPattern = /([0-9a-zA-Z_]+)\s*=\s*([0-9a-zA-Z_]+)/g;
        let hasMatch = false;

        // 尝试匹配等号分割
        while ((result = equalPattern.exec(argParams.content)) != null) {
          hasMatch = true;
          const key = result[1];
          const value = result[2];
          const isKeyNum = /^\d+$/.test(key);
          const isValueNum = /^\d+$/.test(value);

          if (isKeyNum && !isValueNum) {
            values[value] = processValue(key);
            enumList.push(value);
          } else if (!isKeyNum && isValueNum) {
            values[key] = processValue(value);
            enumList.push(key);
          } else {
            values[key] = processValue(value);
            enumList.push(key);
          }
        }

        if (!hasMatch) {
          // 尝试描述在前值在后
          const chineseStartPattern = new RegExp(
            chinese + separator + english,
            "g"
          );
          while (
            (result = chineseStartPattern.exec(argParams.content)) != null
          ) {
            hasMatch = true;
            values[result[2]] = processValue(result[1]);
            enumList.push(result[2]);
          }
        }

        if (!hasMatch) {
          // 尝试值在前描述在后
          const englishStartPattern = new RegExp(
            english + separator + chinese,
            "g"
          );
          while (
            (result = englishStartPattern.exec(argParams.content)) != null
          ) {
            hasMatch = true;
            values[result[1]] = processValue(result[2]);
            enumList.push(result[1]);
          }
        }
      } else if (argParams.strategy === "describeValue") {
        //描述在前值在后
        const chineseStartPattern = new RegExp(
          chinese + separator + english,
          "g"
        );
        while ((result = chineseStartPattern.exec(argParams.content)) != null) {
          values[result[2]] = processValue(result[1]);
          enumList.push(result[2]);
        }
      } else if (argParams.strategy === "valueDescribe") {
        //值在前描述在后
        const englishStartPattern = new RegExp(
          english + separator + chinese,
          "g"
        );
        while ((result = englishStartPattern.exec(argParams.content)) != null) {
          values[result[1]] = processValue(result[2]);
          enumList.push(result[1]);
        }
      } else if (argParams.strategy === "equalSeparator") {
        // key=value 形式，通常用于 Swagger 枚举描述
        const pattern = /([0-9a-zA-Z_]+)\s*=\s*([0-9a-zA-Z_]+)/g;
        while ((result = pattern.exec(argParams.content)) != null) {
          const key = result[1];
          const value = result[2];
          // 逻辑：如果一个是纯数字，一个是字母，则字母作为键，数字作为值
          // 否则按第一个作为键，第二个作为值
          const isKeyNum = /^\d+$/.test(key);
          const isValueNum = /^\d+$/.test(value);

          if (isKeyNum && !isValueNum) {
            values[value] = processValue(key);
            enumList.push(value);
          } else if (!isKeyNum && isValueNum) {
            values[key] = processValue(value);
            enumList.push(key);
          } else {
            values[key] = processValue(value);
            enumList.push(key);
          }
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
