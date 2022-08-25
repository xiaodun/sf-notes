export namespace UGitlab {
  export function getProjectUrl(baseUrl: string, projectName: string) {
    return `${baseUrl}/frontPlatform/${projectName}`;
  }
  export function getMergeUrl(baseUrl: string, projectName: string) {
    return `${baseUrl}/frontPlatform/${projectName}/-/merge_requests`;
  }
  export function getNewMergeUrl(baseUrl: string, projectName: string) {
    return `${baseUrl}/frontPlatform/${projectName}/-/merge_requests/new`;
  }
}

export default UGitlab;
