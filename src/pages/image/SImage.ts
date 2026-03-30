import request from "@/utils/request";
import NImage from "./NImage";
import { NRsp } from "@/common/namespace/NRsp";

const SImage = {
  async addItem(file: File, onUploadProgress?: (event: ProgressEvent) => void): Promise<NRsp<NImage>> {
    const formData = new FormData();
    formData.append("file", file);

    const rsp = await request<NRsp<NImage>>({
      url: "/image/image/addImage",
      method: "POST",
      data: formData,
      onUploadProgress,
    });

    return rsp;
  },

  async getList(): Promise<NRsp<NImage>> {
    const rsp = await request<NRsp<NImage>>({
      url: "/image/image/getImageList",
      method: "GET",
    });

    return rsp;
  },

  async getImageContent(id: string, path?: string): Promise<NRsp<{ content: string; mimeType: string }>> {
    const rsp = await request<NRsp<{ content: string; mimeType: string }>>({
      url: "/image/image/getImageContent",
      method: "GET",
      params: { id, path },
    });

    return rsp;
  },

  async delItem(id: string): Promise<{ success: boolean }> {
    const rsp = await request<{ success: boolean }>({
      url: "/image/image/delImage",
      method: "POST",
      data: { id },
    });

    return rsp;
  },

  async downloadItem(id: string): Promise<Blob> {
    const rsp = await request<Blob>({
      url: "/image/image/downloadImage",
      method: "GET",
      params: { id },
      responseType: "blob",
    });

    return rsp;
  },
  async downloadFromFileManager(id: string): Promise<Blob> {
    const rsp = await request<Blob>({
      url: "/upload/downloadFile",
      method: "GET",
      params: { id },
      responseType: "blob",
    });

    return rsp;
  },

  async saveAs(originalImage: NImage, newName: string, compressionLevel: number): Promise<NRsp<NImage>> {
    const rsp = await request<NRsp<NImage>>({
      url: "/image/image/saveAs",
      method: "POST",
      data: { originalImage, newName, compressionLevel },
    });

    return rsp;
  },

  async overwrite(originalImage: NImage, newName: string, compressionLevel: number): Promise<NRsp<NImage>> {
    const rsp = await request<NRsp<NImage>>({
      url: "/image/image/overwrite",
      method: "POST",
      data: { originalImage, newName, compressionLevel },
    });

    return rsp;
  },

  async compress(
    originalImage: NImage,
    jimpOptions: { quality: number; scalePercent: number; format: "same" | "jpeg" | "png" }
  ): Promise<NRsp<{ content: string; mimeType: string; size: number; width: number; height: number }>> {
    const rsp = await request<NRsp<{ content: string; mimeType: string; size: number; width: number; height: number }>>({
      url: "/image/image/compressImage",
      method: "POST",
      data: { originalImage, jimpOptions },
    });

    return rsp;
  },
};

export default SImage;
