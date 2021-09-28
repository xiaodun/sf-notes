import NRsp from "@/common/namespace/NRsp";
import NProject from "./NProject";
import request from "@/utils/request";

namespace SProject {
  export async function getCommandMenuList(): Promise<
    NRsp<NProject.ICommandMenu>
  > {
    return request({
      url: "/project/getCommandMenuList",
    });
  }
  export async function getProjectList(): Promise<NRsp<NProject>> {
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
  export async function getProject(id: number): Promise<NRsp<NProject>> {
    return request({
      url: "/project/getProject",
      method: "post",
      data: { id },
    });
  }
}
export default SProject;
