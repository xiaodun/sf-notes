import NRsp from "@/common/namespace/NRsp";
import NIterative from "./NIterative";
import request from "@/utils/request";
import NProject from "../project/NProject";
import SProject from "../project/SProject";
import NModel from "@/common/namespace/NModel";
import { NMDIterative } from "umi";
import { NModal } from "@/common/utils/modal/NModal";

namespace SIterative {
  export async function getConfig() {
    return (
      request({
        url: "/iterative/getConfig",
        method: "get",
      }) as Promise<NRsp<NIterative.IConfig>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            config: rsp.data,
          })
        );
      }
      return rsp;
    });
  }
  export async function getIterativeList() {
    return (
      request({
        url: "/iterative/getIterativeList",
      }) as Promise<NRsp<NIterative>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            rsp,
          })
        );
      }
      return rsp;
    });
  }
  export async function getIterative(id: number) {
    return (
      request({
        url: "/iterative/getIterative",
        params: {
          id,
        },
      }) as Promise<NRsp<NIterative>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            iteratives: rsp.data,
          })
        );
      }
      return rsp;
    });
  }
  export async function getRoleTagList() {
    return (
      request({
        url: "/iterative/getRoleTagList",
      }) as Promise<NRsp<NIterative.ITag>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            roleTagList: rsp.list,
          })
        );
      }
      return rsp;
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
  export async function getRoleList() {
    return (
      request({
        url: "/iterative/getRoleList",
      }) as Promise<NRsp<NIterative.IRole>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            roleList: rsp.list,
          })
        );
      }
      return rsp;
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
  export async function getSystemTagList() {
    return (
      request({
        url: "/iterative/getSystemTagList",
        method: "get",
      }) as Promise<NRsp<NIterative.ITag>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            systemTagList: rsp.list,
          })
        );
      }
    });
  }
  export async function getProjectList() {
    return SProject.getProjectList()
      .then((rsp) => {
        rsp.list = rsp.list.filter((item) => item.notJoinIterative !== true);
        return rsp;
      })
      .then((rsp) => {
        if (rsp.success) {
          NModel.dispatch(
            new NMDIterative.ARSetState({
              projectList: rsp.list,
            })
          );
        }
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
  export async function getEnvTagList() {
    return (
      request({
        url: "/iterative/getEnvTagList",
      }) as Promise<NRsp<NIterative.ITag>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            envTagList: rsp.list,
          })
        );
      }
      return rsp;
    });
  }
  export async function getGitConfig() {
    return (
      request({
        url: "/iterative/getGitConfig",
      }) as Promise<NRsp<NIterative.IGitConfig>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            gitConfig: rsp.data,
          })
        );
      }
      return rsp;
    });
  }
  export async function addProjectList(
    id: number,
    projectList: NIterative.IProject[]
  ): Promise<NRsp<NModal.IOptionExecMessage[]>> {
    return request({
      url: "/iterative/addProjectList",
      method: "post",
      data: {
        id,
        projectList,
      },
    });
  }
  export async function removeProject(data: {
    iterativeId: number;
    name: string;
  }) {
    return request({
      url: "/iterative/removeProject",
      method: "post",
      data,
    });
  }
}
export default SIterative;
