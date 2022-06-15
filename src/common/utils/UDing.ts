import { message } from "antd";
import cryptoJS from "crypto-js";
import SBase from "../service/SBase";

/**
 * 文档地址 https://open.dingtalk.com/document/robots/custom-robot-access
 */
const axios = require("axios");
namespace UDing {
  export async function sendLink(
    webhook: string,
    secret: string,
    atMobiles: string[],
    markdown: object,
    isAtAll = false
  ) {
    const url = getSecretWebhook(webhook, secret);
    const rsp = await SBase.sendDingMsg(url, {
      msgtype: "markdown",
      markdown,
      at: {
        atMobiles,
        isAtAll,
      },
    });

    if (rsp.success) {
      message.success("发送钉钉消息成功");
    } else {
      message.error(rsp.message);
    }
  }
  export function getSecretWebhook(webhook: string, secret: string) {
    const timestamp = Date.now();
    let hash = cryptoJS
      .HmacSHA256(`${timestamp}\n${secret}`, secret)
      .toString();
    const base64 = Buffer.from(hash, "hex").toString("base64");

    return (
      webhook +
      "&timestamp=" +
      timestamp +
      "&sign=" +
      encodeURIComponent(base64)
    );
  }
}

export default UDing;
