(function () {
  const moment = require("moment");
  const _ = require("lodash");
  return function (argData, argParams) {
    const { rspItemList, isRsp } = argParams;
    function able(dataLit, wrap = {}) {
      dataLit.forEach((item) => {
        if (item.type === "array") {
          wrap[item.name] = [];

          if (item.children.length) {
            wrap[item.name].push(able(item.children));
          }
        }
        if (item.type === "object") {
          wrap[item.name] = {};

          if (item.children.length) {
            wrap[item.name] = {
              ...able(item.children, {}),
            };
          }
        } else if (item.type === "boolean") {
          wrap[item.name] = Math.random() > 0.5 ? true : false;
        } else if (item.type === "integer" || item.type === "number") {
          wrap[item.name] = 0;
        } else if (item.type === "string") {
          if (isRsp) {
            //属于响应数据
            if (item.enum) {
              wrap[item.name] = item.enum[_.random(item.enum.length - 1)];
            } else if (item.format === "date-time") {
              wrap[item.name] = moment().format("YYYY-MM-DD HH:mm:ss");
            } else {
              wrap[item.name] = item.name;
            }
          } else {
            if (item.enum) {
              // 如果是"",后台会有枚举转换的问题
              wrap[item.name] = null;
            } else {
              wrap[item.name] = "";
            }
          }
        }
      });

      return wrap;
    }
    let data = {};

    able(rspItemList, data);
    if (!isRsp) {
      /***
       * 请求数据中存在这样的结构
       * {
       *   data:{
       *      age:""
       *   }
       * }
       *
       * 通常情况下后台只需要接受
       *
       *
       * {
       *  age:""
       * }
       *
       * */

      if (Object.keys(data).length === 1) {
        const innerObj = data[Object.keys(data)[0]];
        if (typeof innerObj === "object") {
          data = innerObj;
        }
      }
    } else {
      data = data.rsp;
    }

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data,
        },
      },
    };
  };
})();
