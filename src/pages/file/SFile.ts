import NRsp from '@/common/namespace/NRsp';
import NFile from './NFile';
import request from '@/utils/request';
import serviceConfig from '@/../service/app/config.json';

namespace SFile {
  export async function getList(): Promise<NRsp<NFile>> {
    return request({
      url: '/upload/getFileList',
    });
  }
  export async function addItem(
    file: File,
    onUploadProgress: (
      progressEvent: ProgressEvent<EventTarget>,
    ) => void,
  ): Promise<NRsp> {
    const formData = new FormData();
    formData.append('file', file);
    return request({
      url: '/upload/addFile',
      method: 'post',
      data: formData,
      onUploadProgress,
    });
  }
  export async function delItem(id: string): Promise<NRsp> {
    return request({
      url: '/upload/delFile',
      params: { id },
    });
  }
  export function getDownloadUrl(id: string): string {
    return `/${serviceConfig.prefix}/upload/downloadFile?id=${encodeURIComponent(id)}`;
  }
  export async function downloadItem(id: string): Promise<Blob> {
    return request({
      url: '/upload/downloadFile',
      responseType: 'blob',
      params: { id },
    });
  }
}
export default SFile;
