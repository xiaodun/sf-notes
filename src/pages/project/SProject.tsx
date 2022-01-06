import NRsp from "@/common/namespace/NRsp";
import NProject from "./NProject";
import request from "@/utils/request";
import { TEnterSwaggerModalWay } from "./swagger/components/EnterSwaggerModal";

namespace SProject {
  export async function getKeyValueExtraction(
    strategy: string,
    content: string
  ): Promise<NRsp<{ enumList: string[]; values: Object }>> {
    return request({
      url: "/project/keyValueExtraction",
      method: "post",
      data: {
        strategy,
        content,
      },
    });
  }
  export async function getEnumCode(
    enumList: string[],
    values?: Object
  ): Promise<NRsp<Object>> {
    return request({
      url: "/project/getEnumCode",
      method: "post",
      data: {
        enumList,
        values,
      },
    });
  }
  export async function getAjaxCode(
    projectName: String,
    checkedPathList: NProject.IMenuCheckbox[]
  ): Promise<NRsp<NProject.IAjaxCode>> {
    return request({
      url: "/project/getAjaxCode",
      method: "post",
      data: {
        projectName,
        checkedPathList,
      },
    });
  }
  export async function getAttentionList(): Promise<
    NRsp<NProject.IMenuCheckbox>
  > {
    return request({
      url: "/project/getAttentionList",
      method: "get",
    });
  }
  export async function setDefaultAjaxCode(
    projectName: String
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/project/setDefaultAjaxCode",
      method: "post",
      data: {
        projectName,
      },
    });
  }
  export async function setPathAttention(
    data: NProject.IMenuCheckbox[]
  ): Promise<NRsp<NProject.IApiWithPrefix>> {
    return request({
      url: "/project/setPathAttention",
      method: "post",
      data,
    });
  }
  export async function cancelPathAttention(
    data: NProject.IMenuCheckbox[]
  ): Promise<NRsp<NProject.IApiWithPrefix>> {
    return request({
      url: "/project/cancelPathAttention",
      method: "post",
      data,
    });
  }
  export async function getApiPrefixs(): Promise<
    NRsp<NProject.IApiWithPrefix>
  > {
    return request({
      url: "/project/getApiPrefix",
    });
  }
  export async function saveSwagger(
    data: NProject.IDomainSwagger,
    way: TEnterSwaggerModalWay,
    oldDomainName: string
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/project/saveSwagger",
      method: "post",
      data: {
        ...data,
        way,
        oldDomainName,
      },
    });
  }
  export async function getSwaggerList(): Promise<
    NRsp<NProject.IDomainSwagger>
  > {
    return request({
      url: "/project/getSwagger",
    });
  }
  export async function isProjectStart(
    url: string
  ): Promise<NRsp<{ isStart: boolean; isError: boolean }>> {
    return request({
      url: "/project/isProjectStart",
      method: "post",
      data: {
        url,
      },
    });
  }
  export async function isProjectListStart(
    projectList: NProject[]
  ): Promise<NRsp<NProject>> {
    return request({
      url: "/project/isProjectListStart",
      method: "post",
      data: {
        projectList,
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
  export async function getProjectSnippet(id: number): Promise<NRsp<NProject>> {
    return request({
      url: "/project/getProjectSnippet",
      method: "post",
      data: { id },
    });
  }
}
export default SProject;
