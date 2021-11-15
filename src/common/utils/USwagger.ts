import NProject from "@/pages/project/NProject";
import NSwagger from "../namespace/NSwagger";

export namespace USwagger {
  export function getSuportMethod(pathInfs: NSwagger.IPathInfos) {
    const method = ["get", "post", "put", "delete"].find(
      (key) => pathInfs[key]
    );
    return method;
  }
  export function getUrlByGroup(origin: string) {
    return origin + "/swagger-resources";
  }
  export function intoTagOfPath(infos: NSwagger.IGroupApis) {
    /**
     * 将path放入到指定的tag里面
     */
    const tagWithPaths: NSwagger.ITagWithPaths = {};
    Object.keys(infos.paths).map((path) => {
      const method = getSuportMethod(infos.paths[path]);
      const methodInfos: NSwagger.IMethodInfos = infos.paths[path][method];
      methodInfos.definitions = infos.definitions;
      methodInfos.method = method;
      methodInfos.tags.forEach((tag) => {
        if (!tagWithPaths[tag]) {
          tagWithPaths[tag] = {};
        }
        tagWithPaths[tag][path] = methodInfos;
      });
    });
    return tagWithPaths;
  }
  export function parseMethodInfo(
    pathUrl: string,
    methodInfos: NSwagger.IMethodInfos
  ) {
    const definitions = methodInfos.definitions;
    let obj: NProject.IRenderMethodInfo = {
      pathUrl,
      method: methodInfos.method,
      summary: methodInfos.summary,
      tags: methodInfos.tags,
    };
    //解析入参
    obj.parameters = parseParameterList(methodInfos.parameters, definitions);
    // 解析返回格式
    console.log("wx", pathUrl);
    obj.responses = parseResponseInfo(methodInfos, definitions);
    return obj;
  }
  export function parseResponseInfo(
    methodInfos: NSwagger.IMethodInfos,
    definitions: NSwagger.IDefinitions
  ) {
    let obj = { children: [] } as NProject.IRenderResponsesInfo;
    if (methodInfos?.responses?.["200"]?.schema) {
      const { schema } = (methodInfos.responses[
        "200"
      ] as unknown) as NSwagger.IResponseInfo;
      if (schema.originalRef) {
        obj.type = "object";
        obj.children = fillResponseDefinitions(schema.originalRef, definitions);
      } else {
        if (schema.type === "array") {
          if (schema.items.originalRef) {
            obj.type = "array";
            obj.children = fillResponseDefinitions(
              schema.items.originalRef,
              definitions
            );
          } else {
            //普通数组
            obj = {
              type: schema.type,
              itemsType: schema.items.type,
            };
          }
        }
        if (schema.type === "array") {
        } else {
          //基本类型
          obj = {
            type: schema.type,
          };
        }
      }
    }
    return obj;
  }
  export function fillResponseDefinitions(
    originalRef: string,
    definitions: NSwagger.IDefinitions
  ) {
    let list: NProject.IRenderResponsesInfo[] = [];
    function able(
      currentDef: NSwagger.IDefinition,
      ableList: NProject.IRenderResponsesInfo[],
      passDefinitionList: NSwagger.IDefinition[] = []
    ) {
      if (currentDef) {
        const count = passDefinitionList.reduce((total, cur) => {
          if (currentDef === cur) {
            total++;
          }
          return total;
        }, 0);
        if (currentDef.properties) {
          Object.keys(currentDef.properties).forEach((key) => {
            const values = currentDef.properties[key];
            if (values.originalRef) {
              const item = {
                name: key,
                format: values.format,
                type: values.type,
                children: [],
              } as NProject.IRenderResponsesInfo;
              if (count < 2) {
                able(definitions[values.originalRef], item.children, [
                  ...passDefinitionList,
                  definitions[values.originalRef],
                  currentDef,
                ]);
              }
              ableList.push(item);
            } else if (values.type === "array") {
              const item = {
                name: key,
                format: values.format,
                type: values.type,
                children: [],
              } as NProject.IRenderResponsesInfo;
              if (values.items?.originalRef) {
                if (count < 2) {
                  able(definitions[values.items?.originalRef], item.children, [
                    ...passDefinitionList,
                    currentDef,
                    definitions[values.items?.originalRef],
                  ]);
                }
              } else {
                item.itemsType = values.items.type;
              }
              ableList.push(item);
            } else {
              ableList.push({ ...values, name: key });
            }
          });
        } else {
          console.warn("该定义没有properties", originalRef);
        }
      } else {
        console.warn("未找到的定义", originalRef);
      }
    }
    able(definitions[originalRef], list);
    return list;
  }
  export function fillParamsDefinitions(
    originalRef: string,
    definitions: NSwagger.IDefinitions
  ) {
    let returnList: NProject.IRenderParameterInfo[] = [];
    let passOriginalList: string[] = [];

    function able(
      currentDef: NSwagger.IDefinition,
      ableList: NProject.IRenderParameterInfo[]
    ) {
      passOriginalList.push(originalRef);
      if (currentDef) {
        Object.keys(currentDef.properties).forEach((item, index) => {
          const values = currentDef.properties[item];

          let paramInfo = {
            type: values.type,
            description: values.description,
            name: item,
            required: currentDef.required && currentDef.required.includes(item),
            format: values.format,
            children: [],
            enum: values.enum,
          } as NProject.IRenderParameterInfo;
          ableList.push(paramInfo);
          if (values.items) {
            if (values.items.type) {
              paramInfo.itemsType = values.items.type;
            } else if (values.items.originalRef) {
              const count = passOriginalList.reduce((total, pre) => {
                if (pre === originalRef) {
                  total++;
                }
                return total;
              }, 0);
              if (count < 2) {
                able(definitions[values.items.originalRef], paramInfo.children);
              }
            }
          }
        });
      } else {
        console.warn("未找到的定义", originalRef);
      }
    }
    able(definitions[originalRef], returnList);
    return returnList;
  }

  export function parseParameterList(
    parameterList: NSwagger.IParametersInfos[],
    definitions: NSwagger.IDefinitions
  ) {
    let list: NProject.IRenderParameterInfo[] = null;
    if (parameterList && parameterList.length > 0) {
      list = [];
      parameterList.forEach((arg) => {
        const data: NProject.IRenderParameterInfo = {
          description: arg.description,
          name: arg.name,
          required: arg.required,
          children: [],
        };
        list.push(data);
        if (arg.schema && arg.schema.originalRef) {
          let originalRef = arg.schema.originalRef;
          data.children = fillParamsDefinitions(originalRef, definitions);
        }
      });
    }
    return list;
  }
}
export default USwagger;
