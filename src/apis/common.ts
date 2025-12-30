// src/apis/common.ts
import request from 'utils/request';

export type MinioUploadData = {
  fileId: number;
  bucket?: string;
  objectKey?: string;
  originalName?: string;
  contentType?: string;
  sizeBytes?: number;
  etag?: string;
  visibility?: string;
  url?: string; // presigned url (optional)
};

export type MinioUploadResp = {
  msg?: string;
  code?: number;
  data?: MinioUploadData;
};

export function uploadAvatarApi(fd) {
  return request<MinioUploadResp>({
    url: '/minio/upload',
    method: 'post',
    data: fd,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export function getMinioImageSrc(fileId: number | string) {
  return `/minio/image/${fileId}`;
}
