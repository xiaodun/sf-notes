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
}

export default SBase;
