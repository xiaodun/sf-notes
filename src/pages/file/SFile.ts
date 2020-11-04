import NRsp from '@/common/type/NRsp';
import NFile from './NFile';
import request from '@/utils/request';

namespace SFile {
  export async function getList(): Promise<NRsp<NFile>> {
    return request({
      url: '/upload/getFileList',
    });
  }
  export async function addItem(file: File,onUploadProgress:(progressEvent: ProgressEvent<EventTarget>)=>void): Promise<NRsp> {
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
}
export default SFile;
