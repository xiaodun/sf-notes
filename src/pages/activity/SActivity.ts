import NActivity from "./NActivity";

import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";
export namespace SActivity {
  export async function getList(): Promise<NRsp<NActivity>> {
    return request({
      url: "/activity/getActivityList",
    });
  }
}
export default SActivity;
