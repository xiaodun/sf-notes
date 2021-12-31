(function () {
  return function (argData, argParams) {
    argParams.values = argParams.values || [];
    let singleVarStatementStr =
      argParams.enumList
        .map((key) => {
          return `${key}:"${key}",`;
        })
        .join("\n") + "\n";
    let selectOptionStr = argParams.enumList
      .map((key) => {
        return `
      {
          label:${argParams.values[key] || ""},
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
  };
})();
