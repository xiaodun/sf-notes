import NRsp from "@/common/namespace/NRsp";
import NIterative from "./NIterative";
import request from "@/utils/request";
import SProject from "../project/SProject";
import NModel from "@/common/namespace/NModel";
import { NMDIterative } from "umi";
import { NModal } from "@/common/utils/modal/NModal";
import { UModal } from "@/common/utils/modal/UModal";

namespace SIterative {
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
            iterative: rsp.data,
          })
        );
      }
      return rsp;
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
  export async function addRole(data: NIterative.IRole): Promise<NRsp<null>> {
    return request({
      url: "/iterative/addRole",
      method: "post",
      data,
    });
  }
  export async function addPerson(
    data: NIterative.IPerson
  ): Promise<NRsp<NIterative.IPerson>> {
    return request({
      url: "/iterative/addPerson",
      method: "post",
      data,
    });
  }
  export async function getPersonList() {
    return (
      request({
        url: "/iterative/getPersonList",
      }) as Promise<NRsp<NIterative.IPerson>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            personList: rsp.list,
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
  export async function getSystemList() {
    return (
      request({
        url: "/iterative/getSystemList",
        method: "get",
      }) as Promise<NRsp<NIterative.ISystem>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            systemList: rsp.list,
          })
        );
      }
    });
  }
  export async function getProjectList() {
    return SProject.getProjectList()
      .then((rsp) => {
        rsp.list = rsp.list.filter(
          (item) => item.notJoinIterative !== true && item.name !== "sf-notes"
        );
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
  export async function getEnvList() {
    return (
      request({
        url: "/iterative/getEnvList",
      }) as Promise<NRsp<NIterative.IEnv>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            envList: rsp.list,
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
  export async function getReleaseConfig() {
    return (
      request({
        url: "/iterative/getReleaseConfig",
      }) as Promise<NRsp<NIterative.IReleaseConfig>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            releaseConfig: rsp.data,
          })
        );
      }
      return rsp;
    });
  }
  export async function addProjectList(
    id: number,
    projectList: NIterative.IProject[]
  ): Promise<NRsp<NModal.IOptionExecMessage>> {
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
  export async function addEnv(data: NIterative.IEnv) {
    return request({
      url: "/iterative/addEnv",
      method: "post",
      data,
    });
  }
  export async function addSystem(data: NIterative.ISystem) {
    return request({
      url: "/iterative/addSystem",
      method: "post",
      data,
    });
  }
  export async function delIterative(id: number) {
    return request({
      url: "/iterative/delIterative",
      method: "post",
      data: { id },
    });
  }
  export async function pullMaster(
    id: number,
    projectList: NIterative.IProject[]
  ): Promise<NRsp<NModal.IOptionExecMessage>> {
    return request({
      url: "/iterative/pullMaster",
      method: "post",
      data: {
        id,
        projectList,
      },
    });
  }
  export async function mergeTo(
    id: number,
    envId: number,
    projectList: NIterative.IProject[]
  ): Promise<NRsp<NModal.IOptionExecMessage>> {
    return request({
      url: "/iterative/mergeTo",
      method: "post",
      data: {
        id,
        envId,
        projectList,
      },
    });
  }
  export async function switchToIterativeBranch(
    projectList: NIterative.IProject[]
  ) {
    return (
      request({
        url: "/iterative/switchToIterativeBranch",
        method: "post",
        data: {
          projectList,
        },
      }) as Promise<NRsp<NModal.IOptionExecMessage>>
    ).then((rsp) => {
      if (rsp.success) {
        UModal.showExecResult(rsp.list);
      }
    });
  }
  export async function checkConflict(
    id: number,
    projectList: NIterative.IProject[]
  ): Promise<NRsp<NModal.IOptionExecMessage>> {
    return request({
      url: "/iterative/checkConflict",
      method: "post",
      data: {
        id,
        projectList,
      },
    });
  }
  export async function saveIteraitve(
    iterative: NIterative
  ): Promise<NRsp<NModal.IOptionExecMessage>> {
    return request({
      url: "/iterative/saveIteraitve",
      method: "post",
      data: {
        iterative,
      },
    });
  }
  export async function getSystemAccountList(
    systemId: number
  ): Promise<NRsp<NIterative.IAccount>> {
    return request({
      url: "/iterative/getSystemAccountList",
      method: "post",
      data: {
        systemId,
      },
    });
  }
  export async function markTag(id: number, markTags: NIterative.IMarkTag) {
    return (
      request({
        url: "/iterative/markTag",
        method: "post",
        data: {
          id,
          markTags,
        },
      }) as Promise<NRsp<NIterative>>
    ).then((rsp) => {
      if (rsp.success) {
        NModel.dispatch(
          new NMDIterative.ARSetState({
            iterative: rsp.data,
          })
        );
      }
      return rsp;
    });
  }
}
export default SIterative;
