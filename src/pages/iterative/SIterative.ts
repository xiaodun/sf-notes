import NRsp from "@/common/namespace/NRsp";
import NIterative from "./NIterative";
import request from "@/utils/request";
import NProject from "../project/NProject";
import SProject from "../project/SProject";

namespace SIterative {
  export async function getConfig(): Promise<NRsp<NIterative.IConfig>> {
    return request({
      url: "/iterative/getConfig",
      method: "get",
    });
  }
  export async function getIterativeList(): Promise<NRsp<NIterative>> {
    return request({
      url: "/iterative/getIterativeList",
    });
  }
  export async function getRoleTagList(): Promise<NRsp<NIterative.ITag>> {
    return request({
      url: "/iterative/getRoleTagList",
    });
  }
  export async function addRole(
    data: NIterative.IRole
  ): Promise<NRsp<NIterative.IRole>> {
    return request({
      url: "/iterative/addRole",
      method: "post",
      data,
    });
  }
  export async function getRoleList(): Promise<NRsp<NIterative.IRole>> {
    return request({
      url: "/iterative/getRoleList",
    });
  }
  export async function createIterative(
    data: NIterative
  ): Promise<NRsp<NIterative>> {
    return request({
      url: "/iterative/createIterative",
      method: "post",
      data,
    });
  }
  export async function getSystemTagList(): Promise<NRsp<NIterative.ITag>> {
    return request({
      url: "/iterative/getSystemTagList",
      method: "get",
    });
  }
  export async function getProjectList(): Promise<NRsp<NProject>> {
    return SProject.getProjectList().then((rsp) => {
      rsp.list = rsp.list.filter((item) => item.notJoinIterative !== true);
      return rsp;
    });
  }
  export async function addAccount(
    id: number,
    account: NIterative.IAccount
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/iterative/addAccount",
      method: "post",
      data: {
        id,
        account,
      },
    });
  }
  export async function getEnvTagList(): Promise<NRsp<NIterative.ITag>> {
    return request({
      url: "/iterative/getEnvTagList",
    });
  }
}
export default SIterative;
