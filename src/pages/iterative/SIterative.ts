import NRsp from "@/common/namespace/NRsp";
import NIterative from "./NIterative";
import request from "@/utils/request";

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
  export async function getRoleTagList(): Promise<NRsp<NIterative.IRoleTag>> {
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
}
export default SIterative;
