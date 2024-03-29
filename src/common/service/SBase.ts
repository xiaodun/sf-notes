import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";

namespace SBase {
  export async function getIpv4(): Promise<NRsp<string>> {
    return request({
      url: "/baseService/getIpv4",
      method: "post",
    });
  }
  export async function getBase64(imgSrc: string): Promise<NRsp<string>> {
    return request({
      url: "/baseService/getBase64",
      method: "post",
      data: {
        url: imgSrc,
      },
    });
  }
  export async function fetchOtherDomainUrl<T>(
    url: string,
    data?: any
  ): Promise<NRsp<T>> {
    return request({
      url: "/baseService/featchOtherDomainUrl",
      method: "post",
      data: {
        url:encodeURI(url),
        data,
      },
    });
  }
  export async function sendOtherDomainUrl<T>(
    url: string,
    data?: any
  ): Promise<NRsp<T>> {
    return request({
      url: "/baseService/sendOtherDomainUrl",
      method: "post",
      data: {
        url,
        data,
      },
    });
  }
  export async function openFile(filePath: string): Promise<NRsp<boolean>> {
    return request({
      url: "/baseService/openFilePath",
      method: "post",
      data: {
        filePath,
      },
    });
  }
  export async function sendDingMsg(
    url: string,
    data: object
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/baseService/sendDingMsg",
      method: "post",
      data: {
        url,
        data,
      },
    });
  }
}

export default SBase;
