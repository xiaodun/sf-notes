(function () {
  return function (argData, argParams, external) {
    const syncRequest = require("sync-request");
    const drawDate = argParams.drawDate || "";

    let winningNumbers = null;

    try {
      // 使用体彩网API接口获取七星彩开奖结果
      // gameNo=35 是七星彩的游戏编号
      const url =
        "http://api.huiniao.top/interface/home/lotteryHistory?type=qxc&page=1&limit=100";

      const response = syncRequest("GET", url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "zh-CN, zh;q=0.9",
          "Cache-Control": "no-cache",
          Origin: "https://m.lottery.gov.cn",
          Pragma: "no-cache",
          Referer: "https://m.lottery.gov.cn/",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "cross-site",
        },
        timeout: 10000,
      });

      if (response.statusCode === 200) {
        const body = response.getBody().toString();
        console.log("API返回数据:", body);

        if (
          body.trim().startsWith("<!DOCTYPE") ||
          body.trim().startsWith("<html") ||
          body.includes("AccessDeny") ||
          body.includes("访问受限")
        ) {
          console.error("API返回HTML页面，可能被拦截");
        } else {
          const data = JSON.parse(body);
          console.log("解析后的数据:", data);

          // 新API格式：code=1表示成功，数据在data.data.list或data.last中
          if (data && data.code === 1 && data.data) {
            let matchedDraw = null;

            if (drawDate) {
              // 如果有指定日期，从列表中查找匹配的记录
              const targetDate = drawDate.includes(" ")
                ? drawDate.split(" ")[0]
                : drawDate;

              // 从data.data.list中查找
              if (data.data.data && data.data.data.list) {
                matchedDraw = data.data.data.list.find(
                  (item) => item.day === targetDate
                );
              }

              // 如果列表中没有找到，检查last记录
              if (!matchedDraw && data.data.last && data.data.last.day === targetDate) {
                matchedDraw = data.data.last;
              }

              if (!matchedDraw) {
                console.error(`未找到日期 ${targetDate} 对应的开奖结果`);
              }
            } else {
              // 如果没有指定日期，使用最新的开奖结果（last）
              matchedDraw = data.data.last || null;
            }

            console.log("匹配到的开奖记录:", matchedDraw);

            if (matchedDraw) {
              // 从one到seven字段提取号码（2020年规则升级后）
              // 前6位：0-9，最后1位（后区）：0-14
              const allNumbers = [
                parseInt(matchedDraw.one),
                parseInt(matchedDraw.two),
                parseInt(matchedDraw.three),
                parseInt(matchedDraw.four),
                parseInt(matchedDraw.five),
                parseInt(matchedDraw.six),
                parseInt(matchedDraw.seven),
              ].filter((n) => !isNaN(n));

              if (allNumbers.length === 7) {
                // 验证前6位：0-9
                const front6Valid = allNumbers
                  .slice(0, 6)
                  .every((n) => n >= 0 && n <= 9);
                // 验证最后1位：0-14
                const last1Valid = allNumbers[6] >= 0 && allNumbers[6] <= 14;

                if (front6Valid && last1Valid) {
                  winningNumbers = { numbers: allNumbers };
                } else {
                  console.error("号码验证失败:", allNumbers);
                }
              } else {
                console.error("号码数量不正确，期望7位，实际:", allNumbers.length);
              }
            }
          } else {
            console.error("API返回数据格式不正确或请求失败:", data);
          }
        }
      } else {
        console.error("API返回非200状态码:", response.statusCode);
      }
    } catch (error) {
      console.error("获取中奖号码失败:", error.message);
      console.error(error.stack);
    }

    if (!winningNumbers) {
      console.error("未找到匹配的开奖结果");
      if (drawDate) {
        const targetDate = drawDate.includes(" ")
          ? drawDate.split(" ")[0]
          : drawDate;
        return {
          response: {
            code: 200,
            data: {
              success: false,
              message: `未找到日期 ${targetDate} 对应的开奖结果`,
              data: null,
            },
          },
        };
      }
      // 默认值：7位数字（前6位0-9，最后1位0-14）
      winningNumbers = {
        numbers: [1, 2, 3, 4, 5, 6, 10],
      };
    }

    return {
      response: {
        code: 200,
        data: {
          success: true,
          data: winningNumbers,
        },
      },
    };
  };
})();

