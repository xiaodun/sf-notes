(function () {
  return function (argData, argParams) {
    let singleVarStatementStr =
      argParams.enumList
        .map((key) => {
          return `${key}:"${key}",`;
        })
        .join("\n") + "\n";
    let selectOptionStr = argParams.enumList
      .map((key) => {
        return `{
          label:"",
          value:obj["${key}"]
      },`;
      })
      .join("\n");
    let enumInfoStr = `
    
    (function(){
        let obj = {
            ${singleVarStatementStr}
        }
        obj.selectOptionList = [
            ${selectOptionStr}
        ]
        obj.getLabel = (key) => {
            const data =  obj.selectOptionList.find(item => item.value == key);
            if (data) {
              return data.label;
            }
            return key;
          }

          return obj;

       
    })()

    `;
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: { JavaScript: enumInfoStr },
        },
      },
    };
    let obj = (function () {
      let obj = {
        INIT: "INIT",
        WITHDRAW: "WITHDRAW",
        FOLLOW: "FOLLOW",
        CANCEL: "CANCEL",
      };
      obj.selectOptionList = [
        {
          label: "",
          value: obj["INIT"],
        },
        {
          label: "",
          value: obj["WITHDRAW"],
        },
        {
          label: "",
          value: obj["FOLLOW"],
        },
        {
          label: "",
          value: obj["CANCEL"],
        },
      ];
      obj.getLabel = (key) => {
        const data = obj.selectOptionList.find((item) => item.value == key);
        if (data) {
          return data.label;
        }
        return key;
      };
    })();
  };
})();
