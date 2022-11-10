(function () {
  return function (argParams) {
    const _ = require("lodash");
    const prettier = require("prettier");
    const path = require("path");
    const fs = require("fs");
    const babelParser = require("@babel/parser");
    const { default: babelTraverse } = require("@babel/traverse");
    const { baseParse: vueParse } = require("@vue/compiler-core");

    function getBaseNameInfo() {
      let writeOsPath = argParams.writeOsPath || "";
      const upperFirstModuleName = _.upperFirst(argParams.moduleName);
      const pagesFolderPath = path.join(writeOsPath, "src", "pages");

      const NModuleFilePath = path.join(
        writeOsPath,
        "src",
        "common",
        "namespace",
        "NModel.ts"
      );
      const NRouterFilePath = path.join(
        writeOsPath,
        "config",
        "router",
        "NRouter.ts"
      );
      const NAppFilePath = path.join(pagesFolderPath, "app", "NApp.ts");
      const moduleFolderPath = path.join(pagesFolderPath, argParams.moduleName);
      const modelsFolderPath = path.join(moduleFolderPath, "models");
      return {
        NAppFilePath,
        NRouterFilePath,
        NModuleFilePath,
        modelsFolderPath,
        moduleFolderPath,
        upperFirstModuleName,
      };
    }
    return {
      writeOs: {
        open: true,
      },
      globalParamList: [
        {
          name: "moduleName",
          label: "模块名",
          type: "input",
          props: {
            placeholder: "英文名用于文件夹的创建等",
          },
          style: {
            width: 300,
          },
          require: true,
        },
        {
          name: "appName",
          label: "应用名",
          type: "input",
          style: {
            width: 300,
          },
          props: {
            placeholder: "中文名字相当于文档标题",
          },
          require: true,
        },
        {
          name: "position",
          label: "位置",
          type: "number",
          props: {
            min: 1,
            placeholder: "在应用列表中展示的位置",
          },
          style: {
            width: 300,
          },
        },
      ],
      fragmentList: [
        {
          title: "文件结构",
          writeOs() {
            const baseNameInfos = getBaseNameInfo();
            [
              baseNameInfos.moduleFolderPath,
              baseNameInfos.modelsFolderPath,
            ].forEach((item) => {
              if (!fs.existsSync(item)) {
                fs.mkdirSync(item);
              }
            });
          },
        },
        {
          title: "tsx文件",
          getTemplate() {
            const baseNameInfos = getBaseNameInfo();
            return `
import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button,message, Space, Table, Tag } from "antd"; 
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, Link, NMD${baseNameInfos.upperFirstModuleName} } from "umi";           
import SelfStyle from "./L${baseNameInfos.upperFirstModuleName}.less";
import N${baseNameInfos.upperFirstModuleName} from "./N${baseNameInfos.upperFirstModuleName}";
import S${baseNameInfos.upperFirstModuleName} from "./S${baseNameInfos.upperFirstModuleName}";           
import qs from "qs";
import produce from "immer";
import NRsp from "@/common/namespace/NRsp";
import { cloneDeep } from "lodash";
import UCopy from "@/common/utils/UCopy";
export interface I${baseNameInfos.upperFirstModuleName}Props {
  MD${baseNameInfos.upperFirstModuleName}: NMD${baseNameInfos.upperFirstModuleName}.IState;
}
const ${baseNameInfos.upperFirstModuleName}: ConnectRC<I${baseNameInfos.upperFirstModuleName}Props> = (props) => {
  const { MD${baseNameInfos.upperFirstModuleName} } = props;
  
  useEffect(() => {
    reqGetConfig();
    reqGetList();
  }, []);

  return (
    <div>
      <Table
        rowKey="id"
        columns={[
          {
            title: "项目名",
            key: "name",
            dataIndex: "name",
            render: renderNameColumn,
          },

          {
            title: "操作",
            key: "_option",
            render: renderOptionColumn,
          },
        ]}
        dataSource={MD${baseNameInfos.upperFirstModuleName}.rsp.list}
        pagination={false}
      ></Table>
      <PageFooter>
       
        
      </PageFooter>
    </div>
  );

  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderOptionColumn(${argParams.moduleName}: N${baseNameInfos.upperFirstModuleName}) {
    return "";
  }

  async function reqGetConfig() {
    const rsp = await S${baseNameInfos.upperFirstModuleName}.getConfig();
    if (rsp.success) {
      NModel.dispatch(
        new NMD${baseNameInfos.upperFirstModuleName}.ARSetState({
          config: rsp.data,
        })
      );
    }
  }
  async function reqGetList() {
    const rsp = await S${baseNameInfos.upperFirstModuleName}.get${baseNameInfos.upperFirstModuleName}List();
    if (rsp.success) {
      NModel.dispatch(
        new NMD${baseNameInfos.upperFirstModuleName}.ARSetState({
          rsp,
        })
      );
    }
  }
};
export default connect(({ MD${baseNameInfos.upperFirstModuleName} }: NModel.IState) => ({
  MD${baseNameInfos.upperFirstModuleName},
}))(${baseNameInfos.upperFirstModuleName});

            `;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();
            fs.writeFileSync(
              path.join(
                baseNameInfos.moduleFolderPath,
                `P${baseNameInfos.upperFirstModuleName}.tsx`
              ),
              template
            );
          },
        },
        {
          title: "less文件",
          writeOs() {
            const baseNameInfos = getBaseNameInfo();
            fs.writeFileSync(
              path.join(
                baseNameInfos.moduleFolderPath,
                `L${baseNameInfos.upperFirstModuleName}.less`
              ),
              ""
            );
          },
        },
        {
          title: "服务文件",
          getTemplate() {
            const baseNameInfos = getBaseNameInfo();
            return `
import NRsp from "@/common/namespace/NRsp";
import N${baseNameInfos.upperFirstModuleName} from "./N${baseNameInfos.upperFirstModuleName}";
import request from "@/utils/request";

namespace S${baseNameInfos.upperFirstModuleName} {
  export async function getConfig(): Promise<NRsp<N${baseNameInfos.upperFirstModuleName}.IConfig>> {
    return request({
      url: "/${argParams.moduleName}/getConfig",
      method: "get",
    });
  }
  export async function get${baseNameInfos.upperFirstModuleName}List(): Promise<NRsp<N${baseNameInfos.upperFirstModuleName}>> {
    return request({
      url: "/${argParams.moduleName}/get${baseNameInfos.upperFirstModuleName}List",
    })
  }
}
export default S${baseNameInfos.upperFirstModuleName};
            
            
            
            `;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();
            fs.writeFileSync(
              path.join(
                baseNameInfos.moduleFolderPath,
                `S${baseNameInfos.upperFirstModuleName}.ts`
              ),
              template
            );
          },
        },
        {
          title: "类型声明文件",
          getTemplate() {
            const baseNameInfos = getBaseNameInfo();
            return `

export interface N${baseNameInfos.upperFirstModuleName} {}
export namespace N${baseNameInfos.upperFirstModuleName} {
  export interface IConfig {
   
  }
 
}
export default N${baseNameInfos.upperFirstModuleName};
                        
            
            
            `;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();
            fs.writeFileSync(
              path.join(
                baseNameInfos.moduleFolderPath,
                `N${baseNameInfos.upperFirstModuleName}.ts`
              ),
              template
            );
          },
        },
        {
          title: "入口文件",
          getTemplate() {
            const baseNameInfos = getBaseNameInfo();
            return `
import P${baseNameInfos.upperFirstModuleName} from "./P${baseNameInfos.upperFirstModuleName}";
export default P${baseNameInfos.upperFirstModuleName};
            `;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();

            fs.writeFileSync(
              path.join(baseNameInfos.moduleFolderPath, "index.ts"),
              template
            );
          },
        },
        {
          title: "redux文件",
          getTemplate() {
            const baseNameInfos = getBaseNameInfo();
            return `
import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import N${baseNameInfos.upperFirstModuleName} from "../N${baseNameInfos.upperFirstModuleName}";

export namespace NMD${baseNameInfos.upperFirstModuleName} {
  export interface IState {
    rsp: NRsp<N${baseNameInfos.upperFirstModuleName}>;
    config: N${baseNameInfos.upperFirstModuleName}.IConfig;
    ${argParams.moduleName}: N${baseNameInfos.upperFirstModuleName};
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MD${baseNameInfos.upperFirstModuleName};
  }
  export class ARSetState extends Action<Partial<NMD${baseNameInfos.upperFirstModuleName}.IState>> {
    type = "setState";
  }
}

export default {
  namespace: NModel.ENames.MD${baseNameInfos.upperFirstModuleName},

  state: {
    rsp: {
      list: [],
    },
    config: {
    },
    ${argParams.moduleName}: {},
  },
  effects: {},
  reducers: {
    setState(state, { payload }: NMD${baseNameInfos.upperFirstModuleName}.ARSetState) {
      for (let key in payload) {
        if (payload[key]) {
          state[key] = payload[key];
        }
      }
    },
  },
} as NModel<NMD${baseNameInfos.upperFirstModuleName}.IState>;            
            `;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();
            fs.writeFileSync(
              path.join(
                baseNameInfos.modelsFolderPath,
                `NMD${baseNameInfos.upperFirstModuleName}.ts`
              ),
              template
            );
          },
        },
        {
          title: "NModel导人",
          getTemplate() {
            const baseNameInfos = getBaseNameInfo();
            return `
            NMD${baseNameInfos.upperFirstModuleName},
            `;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();
            const fileContent = fs
              .readFileSync(baseNameInfos.NModuleFilePath)
              .toString();
            const ast = babelParser.parse(fileContent, {
              sourceType: "module",
              plugins: ["typescript"],
            });

            let pos;
            babelTraverse(ast, {
              ImportDeclaration(path) {
                if (path.node.source.value === "umi") {
                  pos =
                    path.node.specifiers[path.node.specifiers.length - 1].end +
                    1;
                }
              },
            });
            let frontStr = fileContent.slice(0, pos);
            if (!frontStr.trim().endsWith(",")) {
              frontStr += ",";
            }
            const newFileContent = frontStr + template + fileContent.slice(pos);
            fs.writeFileSync(
              baseNameInfos.NModuleFilePath,
              prettier.format(newFileContent, { parser: "typescript" })
            );
          },
        },
        {
          title: "NModel命名枚举",
          getTemplate() {
            const baseNameInfos = getBaseNameInfo();
            return `MD${baseNameInfos.upperFirstModuleName} = "MD${baseNameInfos.upperFirstModuleName}",`;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();
            const fileContent = fs
              .readFileSync(baseNameInfos.NModuleFilePath)
              .toString();
            const ast = babelParser.parse(fileContent, {
              sourceType: "module",
              plugins: ["typescript"],
            });

            let pos;
            babelTraverse(ast, {
              TSEnumDeclaration(path) {
                if (path.node.id.name === "ENames") {
                  pos = path.node.end - 1;
                }
              },
            });

            const newFileContent =
              fileContent.slice(0, pos) + template + fileContent.slice(pos);
            fs.writeFileSync(
              baseNameInfos.NModuleFilePath,
              prettier.format(newFileContent, { parser: "typescript" })
            );
          },
        },
        {
          title: "NModel状态声明",
          getTemplate() {
            const baseNameInfos = getBaseNameInfo();
            return `[ENames.MD${baseNameInfos.upperFirstModuleName}]: NMD${baseNameInfos.upperFirstModuleName}.IState;`;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();
            const fileContent = fs
              .readFileSync(baseNameInfos.NModuleFilePath)
              .toString();
            const ast = babelParser.parse(fileContent, {
              sourceType: "module",
              plugins: ["typescript"],
            });

            let pos;
            babelTraverse(ast, {
              TSInterfaceDeclaration(path) {
                if (path.node.id.name === "IState") {
                  pos = path.node.end - 1;
                }
              },
            });
            const newFileContent =
              fileContent.slice(0, pos) + template + fileContent.slice(pos);
            fs.writeFileSync(
              baseNameInfos.NModuleFilePath,
              prettier.format(newFileContent, { parser: "typescript" })
            );
          },
        },
        {
          title: "NRouter路径声明",
          getTemplate() {
            return `export const ${argParams.moduleName}Path = "/${argParams.moduleName}";`;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();
            const fileContent = fs
              .readFileSync(baseNameInfos.NRouterFilePath)
              .toString();
            const ast = babelParser.parse(fileContent, {
              sourceType: "module",
              plugins: ["typescript"],
            });
            let pos;
            babelTraverse(ast, {
              ExportNamedDeclaration(path) {
                if (
                  path.node.declaration.declarations?.[0]?.id?.name === "routes"
                ) {
                  pos = path.node.start - 1;
                }
              },
            });
            const newFileContent =
              fileContent.slice(0, pos) + template + fileContent.slice(pos);
            fs.writeFileSync(
              baseNameInfos.NRouterFilePath,
              prettier.format(newFileContent, { parser: "typescript" })
            );
          },
        },
        {
          title: "NRouter路由声明",
          getTemplate() {
            return `
{
  path: ${argParams.moduleName}Path,
  component: "." + ${argParams.moduleName}Path,
  wrappers: [rootComponentPath],
},       
            `;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();
            const fileContent = fs
              .readFileSync(baseNameInfos.NRouterFilePath)
              .toString();
            const ast = babelParser.parse(fileContent, {
              sourceType: "module",
              plugins: ["typescript"],
            });
            let pos;
            babelTraverse(ast, {
              ExportNamedDeclaration(path) {
                if (
                  path.node.declaration.declarations?.[0]?.id?.name === "routes"
                ) {
                  pos = path.node.declaration.declarations?.[0]?.init.end - 1;
                }
              },
            });
            const newFileContent =
              fileContent.slice(0, pos) + template + fileContent.slice(pos);
            fs.writeFileSync(
              baseNameInfos.NRouterFilePath,
              prettier.format(newFileContent, { parser: "typescript" })
            );
          },
        },
        {
          title: "NApp项目声明",
          getTemplate() {
            return `
{
  name: "${argParams.appName}",
  path: NRouter.${argParams.moduleName}Path,
},            
            `;
          },
          writeOs(template) {
            const baseNameInfos = getBaseNameInfo();
            const fileContent = fs
              .readFileSync(baseNameInfos.NAppFilePath)
              .toString();
            const ast = babelParser.parse(fileContent, {
              sourceType: "module",
              plugins: ["typescript"],
            });
            let pos;
            babelTraverse(ast, {
              ExportNamedDeclaration(path) {
                if (
                  path.node.declaration.declarations?.[0]?.id?.name === "list"
                ) {
                  if (argParams.position == null) {
                    pos = path.node.declaration.declarations?.[0]?.init.end - 1;
                  } else {
                    pos =
                      path.node.declaration.declarations?.[0]?.init?.elements?.[
                        argParams.position - 1
                      ].start - 1;
                  }
                }
              },
            });

            const newFileContent =
              fileContent.slice(0, pos) + template + fileContent.slice(pos);
            fs.writeFileSync(
              baseNameInfos.NAppFilePath,
              prettier.format(newFileContent, { parser: "typescript" })
            );
          },
        },
      ],
    };
  };
})();
