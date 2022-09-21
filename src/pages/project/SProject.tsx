import NRsp from "@/common/namespace/NRsp";
import NProject from "./NProject";
import request from "@/utils/request";
import { TEnterSwaggerModalWay } from "./swagger/components/EnterSwaggerModal";
import NProjectSnippet from "./snippet/NProjectSnippet";
import { NModal } from "@/common/utils/modal/NModal";
import NModel from "@/common/namespace/NModel";
import { NMDProject } from "umi";

namespace SProject {
  export async function delSwaggerDomain(
    domainItem: NProject.IDomainSwagger
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/project/delSwaggerDomain",
      method: "post",
      data: {
        domainItem,
      },
    });
  }
  export async function generateProjectMockStructrue(): Promise<NRsp<boolean>> {
    return request({
      url: "/project/generateProjectMockStructrue",
      method: "post",
    });
  }
  export async function generateProjectStartBat(): Promise<NRsp<boolean>> {
    return request({
      url: "/project/generateProjectStartBat",
      method: "post",
    });
  }
  export async function reStartNginx(): Promise<NRsp<boolean>> {
    return request({
      url: "/project/reStartNginx",
      method: "post",
    });
  }
  export async function copySwaggerDataWithProject(data: {
    rspItemList: NProject.IRenderFormatInfo[];
    isRsp: boolean;
    name: string;
  }): Promise<NRsp<string>> {
    return request({
      url: "/project/copySwaggerDataWithProject",
      method: "post",
      data,
    });
  }
  export async function getProjectSendPath(
    projectName: string,
    list: string[]
  ): Promise<NRsp<NModal.IOptionConfirmMessage>> {
    return request({
      url: "/project/getProjectSendPath",
      method: "post",
      data: {
        projectName,
        list,
      },
    });
  }
  export async function setDefaultProject(id: number): Promise<NRsp<boolean>> {
    return request({
      url: "/project/setDefaultProject",
      method: "post",
      data: {
        id,
      },
    });
  }
  export async function copySwaggerData(data: {
    rspItemList: NProject.IRenderFormatInfo[];
    isRsp: boolean;
  }): Promise<NRsp<string>> {
    return request({
      url: "/project/copySwaggerData",
      method: "post",
      data,
    });
  }
  export async function getConfig(): Promise<NRsp<NProject.IConfig>> {
    return request({
      url: "/project/getConfig",
      method: "get",
    });
  }
  export async function updateConfig(config: Partial<NProject.IConfig>) {
    return (
      request({
        url: "/project/updateConfig",
        method: "post",
        data: { config },
      }) as Promise<NRsp<NProject.IConfig>>
    ).then((rsp) => {
      NModel.dispatch(new NMDProject.ARSetState({ config: rsp.data }));
    });
  }
  export async function writeSnippetOs(
    data: {
      script: string;
      id: number;
    },
    values: any
  ): Promise<NRsp<NModal.IOptionExecMessage>> {
    return request({
      url: "/project/writeSnippetOs",
      method: "post",
      data: {
        data,
        values,
      },
    });
  }
  export async function getPreivewTemplate(
    data: {
      script: string;
      id: number;
      index: number;
    },
    values: {}
  ): Promise<NRsp<string>> {
    return request({
      url: "/project/getPreivewTemplate",
      method: "post",
      data: {
        data,
        values,
      },
    });
  }
  export async function getSnippetConfig(
    data: {
      script: string;
      id: number;
    },
    values: any
  ): Promise<NRsp<NProjectSnippet.IConfig>> {
    return request({
      url: "/project/getSnippetConfig",
      method: "post",
      data: {
        data,
        values,
      },
    });
  }
  export async function createSnippetGroup(data: {
    name: string;
    id: number;
    isGroup: boolean;
  }): Promise<NRsp<boolean>> {
    return request({
      url: "/project/createSnippetGroup",
      method: "post",
      data,
    });
  }
  export async function createProjectSnippet(data: {
    name: string;
    script: string;
    id: number;
  }): Promise<NRsp<boolean>> {
    return request({
      url: "/project/createProjectSnippet",
      method: "post",
      data,
    });
  }
  export async function getKeyValueExtraction(
    strategy: string,
    content: string
  ): Promise<NRsp<NProjectSnippet.IExtractionResult>> {
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
    NRsp<NProject.IAttentionInfo>
  > {
    return request({
      url: "/project/getAttentionList",
      method: "get",
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
    data: Partial<NProject>,
    isUpdate?: boolean
  ): Promise<NRsp<Boolean>> {
    return request({
      url: "/project/addProject",
      method: "post",
      data: {
        ...data,
        isUpdate,
      },
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
