import NProject from "@/pages/project/NProject";
import NSwagger from "../namespace/NSwagger";

/** 不依赖调用方传入的 version，从 operation 自身判断是否 OpenAPI 3 */
function isLikelyOpenApi3Operation(
  methodInfos: NSwagger.IMethodInfos
): boolean {
  if ((methodInfos as any)?.requestBody) {
    return true;
  }
  const responses = (methodInfos as any)?.responses as
    | Record<string, { content?: unknown }>
    | undefined;
  if (!responses || typeof responses !== "object") {
    return false;
  }
  return Object.keys(responses).some((k) => {
    const c = responses[k]?.content;
    return c != null && typeof c === "object";
  });
}

export namespace USwagger {
  /** OpenAPI / Swagger 2 常见 operationId 键（小写） */
  export const SWAGGER_HTTP_OPERATIONS = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "options",
    "head",
    "trace",
  ] as const;

  /** paths 对象上的唯一键：`{method}:{path}`，path 为文档中的原始 path */
  export function pathOperationKey(method: string, swaggerPath: string) {
    return `${String(method).toLowerCase()}:${swaggerPath}`;
  }

  /**
   * 从 paths 的存储键解析出 method 与真实 path；兼容旧数据（键仅为 path）
   */
  export function parsePathOperationKey(key: string): {
    method: string | null;
    swaggerPath: string;
  } {
    const i = key.indexOf(":");
    if (i <= 0) {
      return { method: null, swaggerPath: key };
    }
    const maybeMethod = key.slice(0, i).toLowerCase();
    if (
      (SWAGGER_HTTP_OPERATIONS as readonly string[]).includes(maybeMethod)
    ) {
      return { method: maybeMethod, swaggerPath: key.slice(i + 1) };
    }
    return { method: null, swaggerPath: key };
  }

  export interface IPathMethodPair {
    pathUrl: string;
    method: string;
  }

  /**
   * 左侧菜单「路径」模式下的展示文案：在同一 tag 的兄弟接口中尽量短且可区分。
   * - 多条路径末段相同（如多个 …/batch）时自动加长后缀，例如 `groups/batch`
   * - 同一路径多种 HTTP 动词：仅靠左侧方法徽标区分，文案只显示末段（如 `transfer`）
   */
  export function getMenuPathDisplayLabel(
    pathUrl: string | undefined | null,
    method: string | undefined,
    siblings: IPathMethodPair[]
  ): string {
    const safePath =
      pathUrl == null || pathUrl === ""
        ? ""
        : String(pathUrl);
    if (!safePath) {
      return "（未知路径）";
    }
    const m = (method || "get").toLowerCase();
    const segs = safePath.split("/").filter(Boolean);
    if (!segs.length) {
      return safePath;
    }
    const safeSiblings = (siblings || []).filter(
      (s) => s && typeof s.pathUrl === "string" && s.pathUrl.length > 0
    );
    const list = safeSiblings.length
      ? safeSiblings
      : [{ pathUrl: safePath, method: m }];

    // 同 path 多方法：左侧已有方法徽标，文案只保留末段即可，避免「transfer (PUT)」重复
    const samePathCount = list.filter((s) => s.pathUrl === safePath).length;
    if (samePathCount > 1) {
      return segs[segs.length - 1];
    }

    for (let depth = 1; depth <= segs.length; depth++) {
      const suffix = segs.slice(-depth).join("/");
      const matches = list.filter((s) => {
        if (!s?.pathUrl) {
          return false;
        }
        const ss = s.pathUrl.split("/").filter(Boolean);
        if (ss.length < depth) {
          return false;
        }
        return ss.slice(-depth).join("/") === suffix;
      });
      if (matches.length === 1) {
        return suffix;
      }
    }
    return segs.join("/");
  }

  export function getUrlByGroup(url: string) {
    return url + "/swagger-resources";
  }
  export function intoTagOfPath(infos: NSwagger.IGroupApis) {
    /**
     * 将 path 的每个 HTTP 方法放入到指定的 tag 里面（同 path 多方法各自一条）
     */
    const tagWithPaths: NSwagger.ITagWithPaths = {};
    const definitions =
      infos.definitions || infos.components?.schemas || {};
    Object.keys(infos.paths).forEach((swaggerPath) => {
      const pathItem = infos.paths[swaggerPath];
      if (!pathItem) return;
      SWAGGER_HTTP_OPERATIONS.forEach((method) => {
        const methodInfos = pathItem[method] as NSwagger.IMethodInfos | undefined;
        if (!methodInfos) return;
        methodInfos.definitions = definitions;
        methodInfos.method = method;
        const tags = methodInfos.tags || [];
        tags.forEach((tag) => {
          if (!tagWithPaths[tag]) {
            tagWithPaths[tag] = {};
          }
          const storageKey = pathOperationKey(method, swaggerPath);
          tagWithPaths[tag][storageKey] = methodInfos;
        });
      });
    });
    return tagWithPaths;
  }

  /** 从 OAS3 requestBody.content 中取 schema（优先表单上传） */
  function pickV3RequestBodySchema(methodInfos: any): any {
    const content = methodInfos?.requestBody?.content;
    if (!content || typeof content !== "object") {
      return null;
    }
    const prefer = [
      "multipart/form-data",
      "application/x-www-form-urlencoded",
      "application/json",
      "application/*+json",
    ];
    for (const k of prefer) {
      if (content[k]?.schema) {
        return content[k].schema;
      }
    }
    const first = Object.keys(content).find((k) => content[k]?.schema);
    return first ? content[first].schema : null;
  }

  function schemaPropertiesToSyntheticParameters(
    properties: Record<string, any>,
    requiredList: string[] | undefined,
    inLocation: string
  ): any[] {
    if (!properties) {
      return [];
    }
    const required = requiredList || [];
    return Object.keys(properties).map((name) => {
      const prop = properties[name] || {};
      return {
        name,
        in: inLocation,
        description: prop.description,
        required: required.includes(name),
        schema: prop,
      };
    });
  }

  /** 将 requestBody 中的 schema（$ref 或内联 properties）展开为与 parameters 同形的列表 */
  function expandRequestBodyParametersV3(
    methodInfos: any,
    definitions: NSwagger.IDefinitions
  ): any[] {
    const schema = pickV3RequestBodySchema(methodInfos);
    if (!schema) {
      return [];
    }
    const refName =
      typeof schema.$ref === "string"
        ? schema.$ref.split("/").pop()
        : "";
    if (refName && definitions[refName]?.properties) {
      const def = definitions[refName] as NSwagger.IDefinition;
      return schemaPropertiesToSyntheticParameters(
        def.properties as Record<string, any>,
        def.required,
        "body"
      );
    }
    if (schema.properties) {
      return schemaPropertiesToSyntheticParameters(
        schema.properties,
        schema.required,
        "body"
      );
    }
    return [];
  }

  export function parseMethodInfo(
    pathUrl: string,
    methodInfos: NSwagger.IMethodInfos,
    version: string
  ) {
    const definitions = methodInfos.definitions;
    /** 覆盖「更新录入」时未传 version、或误标为 2 的 OpenAPI 3 文档 */
    const effectiveVersion = isLikelyOpenApi3Operation(methodInfos)
      ? "3"
      : version === "3"
        ? "3"
        : "2";
    let obj: NProject.IRenderMethodInfo = {
      pathUrl: pathUrl == null || pathUrl === "" ? "" : String(pathUrl),
      method: methodInfos.method,
      summary: methodInfos.summary,
      tags: methodInfos.tags,
    };
    if (
      pathUrl ==
      "/datamesh-analysis/appTeamgriderView/getTeamgriderExpwarnByGriderIdAndBigType"
    ) {
    }
    //解析入参（OAS3：query/path 在 parameters；body 在 requestBody.content，含 multipart / form-urlencoded）
    let parameters = [...(methodInfos.parameters || [])] as any[];
    if (effectiveVersion === "3") {
      const bodyParams = expandRequestBodyParametersV3(
        methodInfos,
        definitions
      );
      if (bodyParams.length) {
        const byName = new Map<string, any>();
        parameters.forEach((p) => {
          if (p?.name) {
            byName.set(p.name, p);
          }
        });
        bodyParams.forEach((p) => {
          if (p?.name) {
            byName.set(p.name, p);
          }
        });
        parameters = Array.from(byName.values());
      }
    }
    obj.parameters = parseParameterList(
      parameters,
      definitions,
      effectiveVersion
    );
    // 解析返回格式
    obj.responses = parseResponseInfo(
      methodInfos,
      definitions,
      effectiveVersion
    );
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

    // Helper: pick schema from OpenAPI 3 content by preferred media types
    const pickV3Schema = (content: any) => {
      const prefer = [
        "application/json",
        "application/*+json",
        "text/json",
        "text/plain",
        "*/*",
      ];
      for (const k of prefer) {
        if (content?.[k]?.schema) {
          return content[k].schema;
        }
      }
      if (content && typeof content === "object") {
        for (const k of Object.keys(content)) {
          if (content[k]?.schema) {
            return content[k].schema;
          }
        }
      }
      return undefined;
    };
    // Helper: build children for inline schemas (v3) when not using $ref
    const buildChildrenFromInline = (properties: any): NProject.IRenderFormatInfo[] => {
      if (!properties) return [];
      const list: NProject.IRenderFormatInfo[] = [];
      Object.keys(properties).forEach((key) => {
        const values: any = properties[key] || {};
        let type = values.type as NSwagger.TType;
        // $ref property
        if (values.$ref) {
          const ref = (values.$ref as string).split("/").pop();
          const refType = definitions?.[ref!]?.type || "object";
          const item: NProject.IRenderFormatInfo = {
            key: Math.random() + "",
            name: key,
            format: values.format,
            description: values.description,
            type: refType as any,
            children: [],
          };
          item.children = fillResponseDefinitions(ref!, definitions, version);
          list.push(item);
          return;
        }
        // array property
        if (values.type === "array") {
          const item: NProject.IRenderFormatInfo = {
            key: Math.random() + "",
            name: key,
            format: values.format,
            type: "array",
            description: values.description,
            children: [],
          };
          const itemsRef = (values.items?.$ref as string) || "";
          if (itemsRef) {
            const ref = itemsRef.split("/").pop()!;
            item.children = fillResponseDefinitions(ref, definitions, version);
          } else if (values.items) {
            item.itemsType = values.items.type;
          }
          list.push(item);
          return;
        }
        // inline object
        if (values.type === "object" && values.properties) {
          const item: NProject.IRenderFormatInfo = {
            key: Math.random() + "",
            name: key,
            format: values.format,
            type: "object",
            description: values.description,
            children: buildChildrenFromInline(values.properties),
          };
          list.push(item);
          return;
        }
        // primitive
        const item: NProject.IRenderFormatInfo = {
          key: Math.random() + "",
          name: key,
          format: values.format,
          description: values.description,
          type: type,
          enum: values.enum,
          children: [],
        };
        list.push(item);
      });
      return list;
    };

    let schema: any;

    if (version === "3") {
      const responses = (methodInfos as any)?.responses || {};
      const resp =
        responses["200"] ||
        responses["201"] ||
        responses["204"] ||
        responses.default;
      const picked = pickV3Schema(resp?.content);
      if (!picked) {
        // 没有找到 schema，返回空对象占位，页面会显示“没有返回”
        return [{} as any];
      }
      schema = picked;
    } else {
      const r200 = methodInfos.responses?.["200"] as unknown as
        | NSwagger.IResponseInfo
        | undefined;
      schema = r200?.schema;
    }

    // Handle $ref case
    const ref = (schema?.$ref as string) ? (schema.$ref as string).split("/").pop() : schema?.originalRef;
    if (ref) {
      obj.type = "object";
      obj.children = fillResponseDefinitions(ref, definitions, version);
      return [obj];
    }

    // Array schema
    if (schema?.type === "array") {
      const itemsRef =
        (schema.items?.$ref as string)
          ? (schema.items.$ref as string).split("/").pop()
          : schema.items?.originalRef;
      if (itemsRef) {
        obj.type = "array";
        obj.children = fillResponseDefinitions(itemsRef, definitions, version);
      } else {
        obj = {
          ...obj,
          type: "array",
          itemsType: schema.items?.type,
        };
      }
      return [obj];
    }

    // Inline object
    if (schema?.type === "object" && schema?.properties) {
      obj.type = "object";
      obj.children = buildChildrenFromInline(schema.properties);
      return [obj];
    }

    // Primitive or unknown
    if (schema?.type) {
      obj = {
        ...obj,
        type: schema.type,
      };
      return [obj];
    }

    // Fallback for unexpected shapes
    return [{} as any];
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

  /** OpenAPI3 常见：说明写在 schema.description，parameter.description 为空 */
  function mergeParameterDescription(
    arg: Record<string, any>,
    schema?: Record<string, any>
  ): string | undefined {
    const a =
      typeof arg.description === "string" ? arg.description.trim() : "";
    const s =
      schema && typeof schema.description === "string"
        ? String(schema.description).trim()
        : "";
    const parts: string[] = [];
    if (a) {
      parts.push(a);
    }
    if (s && s !== a) {
      parts.push(s);
    }
    if (!parts.length && schema && typeof schema.title === "string") {
      const t = schema.title.trim();
      if (t) {
        parts.push(t);
      }
    }
    return parts.length ? parts.join("\n") : undefined;
  }

  /** 去掉 OpenAPI 里 enum 常见的 null（可空枚举）、以及 String(null) 产生的 "null" */
  function normalizeEnumTokens(tokens: string[]): string[] | undefined {
    const out = tokens
      .map((s) => String(s).trim())
      .filter((s) => {
        if (s === "") {
          return false;
        }
        const low = s.toLowerCase();
        return low !== "null" && low !== "undefined";
      });
    return out.length ? out : undefined;
  }

  /** 合并 schema / 描述中的枚举，供入参、类型列展示 */
  function coalesceParameterEnum(
    arg: Record<string, any>,
    schema?: Record<string, any>
  ): string[] | undefined {
    const sch = schema || {};
    const rawEnum = sch.enum ?? arg.enum;
    if (Array.isArray(rawEnum) && rawEnum.length) {
      return normalizeEnumTokens(
        rawEnum
          .filter((v) => v !== null && v !== undefined)
          .map((v) => String(v))
      );
    }
    const desc = [arg.description, sch.description]
      .filter((s) => typeof s === "string" && s.trim())
      .join(" ");
    if (!desc) {
      return undefined;
    }
    // 中文文档常见：「可用值: 0, 4, 5」「可用值：0、4、5」
    const zh = desc.match(/可用值\s*[:：]\s*([^。\n;；]+)/);
    if (zh && zh[1]) {
      const parts = zh[1]
        .split(/[,，、]\s*|\s+/)
        .map((s) => s.trim())
        .filter((s) => /^-?\d+(\.\d+)?$|^[A-Za-z_][\w.-]*$/.test(s));
      if (parts.length) {
        return normalizeEnumTokens(parts);
      }
    }
    const en = desc.match(
      /(?:allowable|allowed|available)\s+values?\s*[:：]\s*([^。\n;；]+)/i
    );
    if (en && en[1]) {
      const parts = en[1]
        .split(/[,，、]\s*|\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length) {
        return normalizeEnumTokens(parts);
      }
    }
    return undefined;
  }

  export function parseParameterList(
    parameterList: NSwagger.IParametersInfos[],
    definitions: NSwagger.IDefinitions,
    version: string
  ) {
    let list: NProject.IRenderFormatInfo[] = null;
    if (parameterList && parameterList.length > 0) {
      list = [];
      parameterList.forEach((arg: any) => {
        const schema = arg.schema;
        const enumVals = coalesceParameterEnum(arg, schema);
        // Swagger UI 常在无 description 时用 enum 拼「可用值」；JSON 里可能只有 enum
        let description = mergeParameterDescription(arg, schema);
        if (!description?.trim() && enumVals?.length) {
          description = `可用值：${enumVals.join("，")}`;
        }
        const data: NProject.IRenderFormatInfo = {
          description,
          name: arg.name,
          required:
            arg.required !== undefined && arg.required !== null
              ? arg.required
              : !!schema?.required,
          children: [],
          type: (arg.type || schema?.type) as NSwagger.TType,
          key: (arg.name || "param") + Math.random(),
          ...(enumVals?.length ? { enum: enumVals } : {}),
        };
        list.push(data);
        if (!schema) {
          return;
        }
        const refName =
          (typeof schema.$ref === "string" &&
            schema.$ref.split("/").pop()) ||
          schema.originalRef;
        if (refName && definitions[refName]) {
          data.type =
            (definitions[refName]?.type as NSwagger.TType) ||
            data.type ||
            ("object" as any);
          data.children = fillParamsDefinitions(refName, definitions);
          return;
        }
        if (schema.items) {
          const itemsRef =
            (typeof schema.items.$ref === "string" &&
              schema.items.$ref.split("/").pop()) ||
            schema.items.originalRef;
          data.type = (schema.type || "array") as NSwagger.TType;
          if (itemsRef && definitions[itemsRef]) {
            data.children = fillParamsDefinitions(itemsRef, definitions);
          } else if (schema.items.type) {
            data.itemsType = schema.items.type;
          }
          return;
        }
        if (schema.originalRef && definitions[schema.originalRef]) {
          data.type = definitions[schema.originalRef]?.type as NSwagger.TType;
          data.children = fillParamsDefinitions(
            schema.originalRef,
            definitions
          );
          return;
        }
        if (schema.type) {
          data.type = schema.type as NSwagger.TType;
        }
      });
    }
    return list;
  }
}
export default USwagger;
