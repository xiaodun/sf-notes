import NRsp from "@/common/namespace/NRsp";
import request from "@/utils/request";

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
}

export default SBase;
