import axios, { AxiosRequestConfig } from "axios";

import { message, notification } from "antd";
import serviceConfig from "@/../service/app/config.json";
import NRsp from "@/common/namespace/NRsp";
const codeMessage = {
  200: "服务器成功返回请求的数据。",
  201: "新建或修改数据成功。",
  202: "一个请求已经进入后台排队（异步任务）。",
  204: "删除数据成功。",
  400: "发出的请求有错误，服务器没有进行新建或修改数据的操作。",
  401: "用户没有权限（令牌、用户名、密码错误）。",
  403: "用户得到授权，但是访问是被禁止的。",
  404: "发出的请求针对的是不存在的记录，服务器没有进行操作。",
  406: "请求的格式不可得。",
  410: "请求的资源被永久删除，且不会再得到的。",
  422: "当创建一个对象时，发生一个验证错误。",
  500: "服务器发生错误，请检查服务器。",
  502: "网关错误。",
  503: "服务不可用，服务器暂时过载或维护。",
  504: "网关超时。",
};
const instance = axios.create({
  baseURL: `/${serviceConfig.prefix}`,
});
/**
 * 异常处理程序
 */
/**
 * 配置request请求时的默认参数
 */

export default function request(config: AxiosRequestConfig) {
  return instance(config)
    .then((rsp) => {
      if (config.responseType === "blob") {
        return rsp.data;
      } else {
        const data = rsp.data as NRsp;
        data.list || (data.list = []);
        data.data || (data.data = {} as any);
        if (!data.success) {
          data.message && message.error(data.message);
        }
        return {
          list: [],
          data: {},
          ...data,
        } as any;
      }
    })
    .catch((error) => {
      const { response } = error;
      if (response && response.status) {
        const errorText = codeMessage[response.status] || response.statusText;
        const { status } = response;

        notification.error({
          message: `请求错误 ${status}: ${config.url}`,
          description: response.data ? response.data : errorText,
          style: response.data
            ? { width: "45vw", whiteSpace: "pre", overflow: "auto" }
            : {},
          duration: response.data ? 20 : 4.5,
        });
      } else if (!response) {
        notification.error({
          description: "您的网络发生异常，无法连接服务器",
          message: "网络异常",
        });
      }
      return { success: false, isHaveReadMsg: true } as NRsp;
    });
}
