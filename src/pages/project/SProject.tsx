import NRsp from "@/common/namespace/NRsp";
import NProject from "./NProject";
import request from "@/utils/request";

namespace SProject {
  export async function getList(): Promise<NRsp<NProject>> {
    return request({
      url: "/project/getProjectList",
    });
  }
  export async function addProject(
    data: Partial<NProject>
  ): Promise<NRsp<Boolean>> {
    return request({
      url: "/project/addProject",
      method: "post",
      data,
    });
  }
}
export default SProject;
