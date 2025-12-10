(function () {
  return function (argData, argParams, external) {
    const syncRequest = require("sync-request");
    const drawDate = argParams.drawDate || "";

    let winningNumbers = null;

    try {
      // 使用体彩网API接口
      // 根据浏览器请求头配置，模拟真实浏览器请求
      const url =
        "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&isVerify=1&termLimits=30";

      const response = syncRequest("GET", url, {
        headers: {
          // 根据浏览器开发者工具中的实际请求头配置
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
        timeout: 10000, // 超时时间
      });

      if (response.statusCode === 200) {
        const body = response.getBody().toString();
        console.log(body);

        // 检查返回的是否是HTML（被拦截的情况）
        if (
          body.trim().startsWith("<!DOCTYPE") ||
          body.trim().startsWith("<html") ||
          body.includes("AccessDeny") ||
          body.includes("访问受限")
        ) {
          console.error("API返回HTML页面，可能被拦截");
        } else {
          const data = JSON.parse(body);
          // 解析体彩网API返回的数据格式
          // value.list[0].lotteryDrawResult: "01,05,12,23,35+01,08" 或 "01 05 12 23 35+01 08"
          if (data && data.value) {
            console.log(data);

            const list = data.value.list || [];

            // 通过 lotteryDrawTime 匹配，直接在 list 中查找
            let matchedDraw = null;
            
            if (drawDate) {
              // 将 drawDate 转换为匹配格式（确保格式一致，如 "2025-12-08"）
              const targetDate = drawDate.includes(" ") 
                ? drawDate.split(" ")[0] 
                : drawDate;

              // 直接在 list 中查找匹配的 lotteryDrawTime
              matchedDraw = list.find(
                (item) => item.lotteryDrawTime === targetDate
              );
              
              if (!matchedDraw) {
                console.error(`未找到日期 ${targetDate} 对应的开奖结果`);
              }
            } else {
              // 如果没有提供 drawDate，使用 list[0]（最新一期）
              matchedDraw = list.length > 0 ? list[0] : null;
            }

            console.log(matchedDraw);

            if (matchedDraw && matchedDraw.lotteryDrawResult) {
              // 解析开奖号码字符串，格式： "04 05 13 18 34 02 08" (空格分隔，前5个是前区，后2个是后区)
              const resultStr = matchedDraw.lotteryDrawResult.trim();
              
              // 按空格或逗号分割所有数字，前5个是前区，后2个是后区
              const allNumbers = resultStr
                .split(/[,，\s]+/)
                .map((n) => parseInt(n.trim()))
                .filter((n) => !isNaN(n) && n > 0);
              
              if (allNumbers.length >= 7) {
                const front = allNumbers.slice(0, 5);
                const back = allNumbers.slice(5, 7);
                
                if (front.length === 5 && back.length === 2) {
                  winningNumbers = { front, back };
                }
              }
            }
          }
        }
      } else {
        console.error("API返回非200状态码:", response.statusCode);
      }
    } catch (error) {
      console.error("获取中奖号码失败:", error.message);
    }

    // 如果没有匹配到对应的开奖结果
    if (!winningNumbers) {
      console.error("未找到匹配的开奖结果");
      // 如果提供了 drawDate，返回错误信息
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
      // 否则使用默认值
      winningNumbers = {
        front: [9, 10, 25, 27, 34],
        back: [4, 5],
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

