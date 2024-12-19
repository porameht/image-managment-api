import { UrlRequest } from "./constant";
import { FileRequest } from "./constant";

export function extractPublicId(imageUrl: string): string {
  return imageUrl.split('/').pop()?.split('.')[0] || '';
}

export function generateUniquePublicId(publicId: string): string {
  const uuid = Math.random().toString(36).substring(2, 8);
  return `${publicId}_${uuid}`;
}

export function isUrlRequest(body: unknown): body is UrlRequest {
  return (
    typeof body === 'object' && 
    body !== null &&
    'videoUrl' in body &&
    'watermarkUrl' in body &&
    typeof (body as UrlRequest).videoUrl === 'string' &&
    typeof (body as UrlRequest).watermarkUrl === 'string'
  );
}

export function isFileRequest(body: unknown): body is FileRequest {
  return (
    typeof body === 'object' &&
    body !== null && 
    'videoFile' in body &&
    'watermarkFile' in body &&
    body.videoFile instanceof File &&
    body.watermarkFile instanceof File
  );
}