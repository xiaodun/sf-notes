export namespace UNumber {
  export function formatWithYuanUnit(yuan: number, digit = 3) {
    if (isNaN(yuan)) {
      return "";
    }
    if (yuan == 0 || yuan == -Infinity) {
      return "0";
    }
    let stuffix = "";
    if (Math.ceil(yuan) !== yuan) {
      let list = (yuan + "").split(".");
      yuan = +list[0];
      stuffix = list[1].slice(0, digit);
    }
    const levelList = ["", "万", "亿"];
    const digitList = ["", "十", "百", "千"];
    const numList = [
      "零",
      "一",
      "二",
      "三",
      "四",
      "五",
      "六",
      "七",
      "八",
      "九",
    ];

    const list = String(yuan)
      .replace(/(\d)(?=(\d{4})+$)/g, "$1,")
      .split(",");

    let finalStr = "";
    list.forEach((item, i1) => {
      const newItem = item.split("");
      let currentStr = "";
      newItem.forEach((num, i2) => {
        if (num !== "0") {
          currentStr += numList[num] + digitList[newItem.length - 1 - i2];
        } else {
          currentStr += "零";
        }
      });
      currentStr = currentStr.replace(/(零+)/, "零");
      //去掉开头和结尾的零

      currentStr = currentStr.replace(/^零+/, "");
      currentStr = currentStr.replace(/零+$/, "");

      if (currentStr) {
        finalStr += currentStr;

        finalStr += levelList[list.length - 1 - i1];
      }
    });
    if (stuffix) {
      finalStr += "." + [...stuffix].map((k, i) => numList[k]).join("");
    }
    return finalStr;
  }
}

export default UNumber;
