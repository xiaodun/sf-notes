import NRsp from "@/common/namespace/NRsp";
import NProject from "@/pages/project/NProject";
import request from "@/utils/request";

namespace SSwagger {
  export async function getConfig(): Promise<NRsp<NProject.IConfig>> {
    return request({
      url: "/swagger/getConfig",
      method: "get",
    });
  }

  export async function updateConfig(config: Partial<NProject.IConfig>) {
    return request({
      url: "/swagger/updateConfig",
      method: "post",
      data: { config },
    }) as Promise<NRsp<NProject.IConfig>>;
  }

  export async function getInExcludeGroups(): Promise<
    NRsp<NProject.IInExcludeGroups>
  > {
    return request({
      url: "/swagger/getInExcludeGroups",
      method: "post",
    });
  }

  export async function delSwaggerDomain(
    domainItem: NProject.IDomainSwagger
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/swagger/delSwaggerDomain",
      method: "post",
      data: {
        domainItem,
      },
    });
  }

  export async function copySwaggerDataWithProject(data: {
    rspItemList: NProject.IRenderFormatInfo[];
    isRsp: boolean;
    name: string;
  }): Promise<NRsp<string>> {
    return request({
      url: "/swagger/copySwaggerDataWithProject",
      method: "post",
      data,
    });
  }

  export async function copySwaggerData(data: {
    rspItemList: NProject.IRenderFormatInfo[];
    isRsp: boolean;
  }): Promise<NRsp<string>> {
    return request({
      url: "/swagger/copySwaggerData",
      method: "post",
      data,
    });
  }

  export async function getKeyValueExtraction(
    strategy: string,
    content: string,
    valueType: "number" | "string"
  ): Promise<NRsp<any>> {
    return request({
      url: "/swagger/keyValueExtraction",
      method: "post",
      data: {
        strategy,
        content,
        valueType,
      },
    });
  }

  export async function getEnumCode(
    enumList: string[],
    values?: Object
  ): Promise<NRsp<Object>> {
    return request({
      url: "/swagger/getEnumCode",
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
      url: "/swagger/getAjaxCode",
      method: "post",
      data: {
        projectName,
        checkedPathList,
      },
    });
  }

  export async function getAttentionList(): Promise<
    NRsp<NProject.IAttentionInfo>
  > {
    return request({
      url: "/swagger/getAttentionList",
      method: "get",
    });
  }

  export async function setPathAttention(
    data: NProject.IMenuCheckbox[]
  ): Promise<NRsp<NProject.IApiWithPrefix>> {
    return request({
      url: "/swagger/setPathAttention",
      method: "post",
      data,
    });
  }

  export async function cancelPathAttention(
    data: NProject.IMenuCheckbox[]
  ): Promise<NRsp<NProject.IApiWithPrefix>> {
    return request({
      url: "/swagger/cancelPathAttention",
      method: "post",
      data,
    });
  }

  export async function getApiPrefixs(): Promise<NRsp<NProject.IApiWithPrefix>> {
    return request({
      url: "/swagger/getApiPrefix",
    });
  }

  export async function saveSwagger(
    data: NProject.IDomainSwagger,
    way: "add" | "update",
    oldDomainName: string,
    checkGroupNameList: string[]
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/swagger/saveSwagger",
      method: "post",
      data: {
        ...data,
        way,
        oldDomainName,
        checkGroupNameList,
      },
    });
  }

  export async function getSwaggerList(): Promise<NRsp<NProject.IDomainSwagger>> {
    return request({
      url: "/swagger/getSwagger",
    });
  }
}
export default SSwagger;
