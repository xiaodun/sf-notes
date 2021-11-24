import NActivity from "./NActivity";

import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";
export namespace SActivity {
  export async function getList(): Promise<NRsp<NActivity[]>> {
    function able(list: NActivity[]) {
      list.forEach((item) => {
        if (!item.weight) {
          item.weight = 1;
        }
        if (!item.isClose) {
          item.isClose = false;
        }
        if (!item.children) {
          item.children = [];
        }

        if (Array.isArray(item.children)) {
          able(item.children);
        }
      });
    }
    return request({
      url: "/activity/getActivityList",
    }).then((rsp: NRsp<NActivity[]>) => {
      able(rsp.data);
      return rsp;
    });
  }
}
export default SActivity;
