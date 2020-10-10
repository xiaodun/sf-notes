import NRes from '@/common/type/NRes';
import NFile from './NFile';
import request from '@/utils/request';

namespace SFile {
  export async function getList(): Promise<NRes<NFile>> {
    return request.get('/upload/getFileList');
  }
  export async function addItem(file: File): Promise<NRes> {
    const formData = new FormData();
    formData.append('file1', file);
    return request.post('/upload/addFile', {
      data: formData,
    });
  }
  export async function delItem(id: string): Promise<NRes> {
    return request.get('/upload/delFile', { params: { id } });
  }
}
export default SFile;
