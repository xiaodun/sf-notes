import NRsp from "@/common/namespace/NRsp";
import NProject from "./NProject";
import request from "@/utils/request";

namespace SProject {
  export async function isProjectStart(url: string): Promise<NRsp<boolean>> {
    return request({
      url: "/project/isProjectStart",
      method: "post",
      data: {
        url,
      },
    });
  }
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
    }).then((rsp: NRsp<NProject>) => {
      rsp.list = rsp.list.map((item) => ({
        ...item,
        web: {
          isStart: null,
        },
      }));
      return rsp;
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
