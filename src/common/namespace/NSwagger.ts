export interface NSwagger {}
export namespace NSwagger {
  export type TType = "object" | "array" | "string" | "integer" | "boolean";
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
        type: TType;
        required?: boolean;
        format?: string;
        items?: {
          type?: TType;
          enum?: string[];
          $ref?: string;
          originalRef?: string;
        };

        enum: string[];
        originalRef?: string;
        description: string;
      };
    };
    additionalProperties?: {
      type: TType;
    };
    required: string[];
    title: string;
    type: TType;
  }
  export interface IDefinitions {
    [key: string]: IDefinition;
  }
  export interface IParametersInfos {
    description: string;
    in: string;
    name: string;
    type: TType;
    required: boolean;
    schema: {
      $ref: string;
      originalRef: string;
      type: TType;
      items?: {
        originalRef: string;
      };
    };
  }
  export interface IResponseInfo {
    description: string;
    schema?: {
      originalRef?: string;
      type: TType;
      items: {
        type?: TType;
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
