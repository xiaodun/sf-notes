import NProject from "@/pages/project/NProject";
import NSwagger from "../namespace/NSwagger";

export namespace USwagger {
  export function getSuportMethod(pathInfs: NSwagger.IPathInfos) {
    const method = ["get", "post", "put", "delete"].find(
      (key) => pathInfs[key]
    );
    return method;
  }
  export function getUrlByGroup(url: string) {
    return url + "/swagger-resources";
  }
  export function intoTagOfPath(infos: NSwagger.IGroupApis) {
    /**
     * 将path放入到指定的tag里面
     */
    const tagWithPaths: NSwagger.ITagWithPaths = {};
    Object.keys(infos.paths).map((path) => {
      const method = getSuportMethod(infos.paths[path]);
      const methodInfos: NSwagger.IMethodInfos = infos.paths[path][method];
      methodInfos.definitions = infos.definitions || infos.components.schemas;
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
    methodInfos: NSwagger.IMethodInfos,
    version: string
  ) {
    const definitions = methodInfos.definitions;
    let obj: NProject.IRenderMethodInfo = {
      pathUrl,
      method: methodInfos.method,
      summary: methodInfos.summary,
      tags: methodInfos.tags,
    };
    if (
      pathUrl ==
      "/datamesh-analysis/appTeamgriderView/getTeamgriderExpwarnByGriderIdAndBigType"
    ) {
    }
    //解析入参
    let parameters = methodInfos.parameters;
    if (version == "3") {
      let ref = (
        methodInfos.requestBody?.content?.["application/json"]?.schema?.$ref ||
        ""
      )
        .split("/")
        .pop();

      if (ref) {
        parameters = Object.keys(definitions[ref].properties).map((key) => ({
          name: key,
          ...definitions[ref].properties[key],
        })) as unknown as NSwagger.IParametersInfos[];
      }
    }
    obj.parameters = parseParameterList(parameters, definitions, version);
    // 解析返回格式
    obj.responses = parseResponseInfo(methodInfos, definitions, version);
    return obj;
  }
  export function parseResponseInfo(
    methodInfos: NSwagger.IMethodInfos,
    definitions: NSwagger.IDefinitions,
    version: string
  ) {
    let obj = {
      key: Math.random() + "",
      name: "rsp",
      children: [],
    } as NProject.IRenderFormatInfo;

    let schema;

    if (version == "3") {
      let ref = (methodInfos.responses["200"].content["*/*"].schema.$ref || "")
        .split("/")
        .pop();
      if (!ref) {
        return {};
      }

      schema = {
        originalRef: ref,
      };
    } else if (version == "2") {
      schema = (
        methodInfos.responses["200"] as unknown as NSwagger.IResponseInfo
      ).schema;
    }
    if (schema.originalRef) {
      obj.type = "object";
      obj.children = fillResponseDefinitions(
        schema.originalRef,
        definitions,
        version
      );
    } else {
      if (schema.type === "array") {
        if (schema.items.originalRef) {
          obj.type = "array";
          obj.children = fillResponseDefinitions(
            schema.items.originalRef,
            definitions,
            version
          );
        } else {
          //普通数组
          obj = {
            ...obj,

            type: schema.type,
            itemsType: schema.items.type,
          };
        }
      }
      if (schema.type === "array") {
      } else {
        //基本类型
        obj = {
          ...obj,
          type: schema.type,
        };
      }
    }

    return [obj];
  }
  export function fillResponseDefinitions(
    originalRef: string,
    definitions: NSwagger.IDefinitions,
    version: string
  ) {
    let list: NProject.IRenderFormatInfo[] = [];
    function able(
      currentDef: NSwagger.IDefinition,
      ableList: NProject.IRenderFormatInfo[],
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
            let type = values.type;
            let originalRef = values.originalRef;
            if (version == "3" && values.$ref) {
              originalRef = values.$ref.split("/").pop();
            }
            console.log("wx", values, originalRef);
            if (originalRef) {
              if (!values.type) {
                type = definitions[originalRef].type;
              }
              const item = {
                key: Math.random() + "",
                name: key,
                format: values.format,
                description: values.description,
                type,
                children: [],
              } as NProject.IRenderFormatInfo;
              if (count < 2) {
                able(definitions[originalRef], item.children, [
                  ...passDefinitionList,
                  definitions[originalRef],
                  currentDef,
                ]);
              }
              ableList.push(item);
            } else if (values.type === "array") {
              const item = {
                key: Math.random() + "",
                name: key,
                format: values.format,
                type: values.type,
                description: values.description,
                children: [],
              } as NProject.IRenderFormatInfo;
              let itemsRef = values.items?.originalRef;
              if (version == "3") {
                itemsRef = (values.items.$ref || "").split("/").pop();
              }
              if (itemsRef) {
                if (count < 2) {
                  able(definitions[itemsRef], item.children, [
                    ...passDefinitionList,
                    currentDef,
                    definitions[itemsRef],
                  ]);
                }
              } else {
                item.itemsType = values.items.type;
                item.enum = values.items.enum;
              }
              ableList.push(item);
            } else {
              ableList.push({
                ...values,
                name: key,
                key: Math.random() + "",
                description: values.description,
                children: [],
              });
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
    let returnList: NProject.IRenderFormatInfo[] = [];
    let passOriginalList: string[] = [];

    function able(
      currentDef: NSwagger.IDefinition,
      ableList: NProject.IRenderFormatInfo[]
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
            enum: values.enum || values.items?.enum,
            key: item + Math.random(),
          } as NProject.IRenderFormatInfo;
          ableList.push(paramInfo);
          if (values.items) {
            if (values.items.type) {
              paramInfo.itemsType = values.items.type;
            } else if (values.items.originalRef) {
              const count = passOriginalList.reduce((total, pre) => {
                if (pre === values.items.originalRef) {
                  total++;
                }
                return total;
              }, 0);
              if (count < 2) {
                able(definitions[values.items.originalRef], paramInfo.children);
              }
            }
          } else {
            if (values.originalRef) {
              paramInfo.type = definitions[values.originalRef]?.type;
              const count = passOriginalList.reduce((total, pre) => {
                if (pre === originalRef) {
                  total++;
                }
                return total;
              }, 0);
              if (count < 2) {
                able(definitions[values.originalRef], paramInfo.children);
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
    definitions: NSwagger.IDefinitions,
    version: string
  ) {
    let list: NProject.IRenderFormatInfo[] = null;
    if (parameterList && parameterList.length > 0) {
      list = [];
      parameterList.forEach((arg) => {
        const data: NProject.IRenderFormatInfo = {
          description: arg.description,
          name: arg.name,
          required: arg.required,
          children: [],
          type: arg.type,
          key: arg.name + Math.random(),
        };
        list.push(data);
        if (arg.schema) {
          if (arg.schema.originalRef) {
            let originalRef = arg.schema.originalRef;
            data.type = definitions[originalRef]?.type;
            data.children = fillParamsDefinitions(originalRef, definitions);
          } else if (arg.schema.items) {
            data.type = arg.schema.type;
            data.children = fillParamsDefinitions(
              arg.schema.items.originalRef,
              definitions
            );
          } else {
            data.type = arg.schema.type;
          }
        }
      });
    }
    return list;
  }
}
export default USwagger;
