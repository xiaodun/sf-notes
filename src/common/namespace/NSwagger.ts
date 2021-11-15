export interface NSwagger {}
export namespace NSwagger {
  export interface IGroup {
    name: string;
    url: string;
  }
  export interface IPathInfos {
    get?: IMethodInfos;
    post?: IMethodInfos;
  }
  export interface IGroupWithTag {
    [key: string]: ITagWithPaths;
  }
  export interface ITagWithPaths {
    [key: string]: {
      [key: string]: IMethodInfos;
    };
  }

  export interface IDefinition {
    properties: {
      [key: string]: {
        type: "array" | "string";
        required?: boolean;
        format?: string;
        items?: {
          type?: "boolean" | "number" | "string";

          $ref?: string;
          originalRef?: string;
        };

        enum: string[];
        originalRef?: string;
        description: string;
      };
    };
    additionalProperties?: {
      type: string;
    };
    required: string[];
    title: string;
    type: "object";
  }
  export interface IDefinitions {
    [key: string]: IDefinition;
  }
  export interface IParametersInfos {
    description: string;
    in: string;
    name: string;
    required: boolean;
    schema: {
      $ref: string;
      originalRef: string;
    };
  }
  export interface IResponseInfo {
    description: string;
    schema?: {
      originalRef?: string;
      type: "array";
      items: {
        type?: "string" | "number" | "boolean";
        originalRef: string;
      };
    };
  }
  export interface IMethodInfos {
    deprecated: boolean;
    operationId: string;
    parameters: IParametersInfos[];
    responses: {
      [key: string]: IResponseInfo;
    }[];
    summary: string;
    tags: string[];
    definitions: IDefinitions;
    method: string;
  }
  export interface IGroupApis {
    definitions: IDefinitions;
    paths: {
      [key: string]: IPathInfos;
    };
    tags: { description: string; name: string }[];
  }
}
export default NSwagger;
