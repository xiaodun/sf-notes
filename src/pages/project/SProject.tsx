import NRsp from "@/common/namespace/NRsp";
import NProject from "./NProject";
import request from "@/utils/request";

namespace SProject {
  export async function getList(): Promise<NRsp<NBook>> {
    return request({
      url: "/book/getBookList",
    });
  }
}
