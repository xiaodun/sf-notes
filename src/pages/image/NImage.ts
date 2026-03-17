export default interface NImage {
  id: string;
  name: string;
  url: string;
  originalName: string;
  size: number;
  isProcessed: boolean;
  storage: {
    path: string;
    timestamp: number;
  };
}

export namespace NImage {
  export interface IUploadConfig {
    uploadLoading: boolean;
    loaded: number;
    total: number;
    name: string;
  }

  export interface IOptioncConfig {
    downloadLoading?: boolean;
    delLoading?: boolean;
  }
}
