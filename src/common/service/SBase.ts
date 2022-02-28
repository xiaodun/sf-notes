import NSwagger from "@/common/namespace/NSwagger";
import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";

namespace SBase {
  export async function getBase64(imgSrc: string): Promise<NRsp<String>> {
    return request({
      url: "/baseService/getBase64",
      method: "post",
      data: {
        url: imgSrc,
      },
    });
  }
  export async function featchOtherDomainUrl<T>(url: string): Promise<NRsp<T>> {
    return request({
      url: "/baseService/featchOtherDomainUrl",
      method: "post",
      data: {
        url,
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
}

export default SBase;
