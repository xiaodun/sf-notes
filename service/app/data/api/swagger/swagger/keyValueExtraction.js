(function () {
  return function (argData, argParams) {
    let enumList = [];
    let values = {};
    if (argParams.strategy === "onlyValue") {
      const pattern = /[a-zA-z]+/g;
      let result;
      while ((result = pattern.exec(argParams.content)) != null) {
        enumList.push(result[0]);
      }
    } else {
      const chinese = "([\u4e00-\u9fa5]+)",
        separator = "\\s*[-:]?\\s*",
        english = "([0-9a-zA-Z_]+)";
      let result;
      const processValue = (val) => {
        if (argParams.valueType === "number") {
          const num = Number(val);
          return isNaN(num) ? val : num;
        }
        return val;
      };
      if (argParams.strategy === "auto") {
        const equalPattern = /([0-9a-zA-Z_]+)\s*=\s*([0-9a-zA-Z_]+)/g;
        let hasMatch = false;
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
        const chineseStartPattern = new RegExp(
          chinese + separator + english,
          "g"
        );
        while ((result = chineseStartPattern.exec(argParams.content)) != null) {
          values[result[2]] = processValue(result[1]);
          enumList.push(result[2]);
        }
      } else if (argParams.strategy === "valueDescribe") {
        const englishStartPattern = new RegExp(
          english + separator + chinese,
          "g"
        );
        while ((result = englishStartPattern.exec(argParams.content)) != null) {
          values[result[1]] = processValue(result[2]);
          enumList.push(result[1]);
        }
      } else if (argParams.strategy === "equalSeparator") {
        const pattern = /([0-9a-zA-Z_]+)\s*=\s*([0-9a-zA-Z_]+)/g;
        while ((result = pattern.exec(argParams.content)) != null) {
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
