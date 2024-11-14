import cloudinary from './config';
import fs from 'fs';
import { UrlRequest, FileRequest } from './constant';

export async function uploadImage(imageUrl: string, publicId: string) {
  try {
    const uploadResult = await cloudinary.uploader.upload(imageUrl, { public_id: publicId });
    return uploadResult;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export function getOptimizedUrl(publicId: string) {
  try {
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
    });
  } catch (error) {
    console.error('Error getting optimized URL:', error);
    throw error;
  }
}

export function getAutoCroppedUrl(publicId: string, width: number, height: number) {
  try {
    return cloudinary.url(publicId, {
      crop: 'auto',
      gravity: 'auto',
      width,
      height,
    });
  } catch (error) {
    console.error('Error getting auto-cropped URL:', error);
    throw error;
  }
}

function getBackgroundReplacedUrl(publicId: string, prompt: string): string {
  try {
    return cloudinary.url(publicId, {
      effect: `gen_background_replace:prompt_${prompt}`,
      fetch_format: 'auto',
      quality: 'auto',
      loading: 'lazy',
      dpr: 'auto',
      responsive: true,
      width: 'auto',
      crop: 'scale',
    });
  } catch (error) {
    console.error('Error getting background-replaced URL:', error);
    throw error;
  }
}

function getWatermarkedVideoUrl(publicId: string, watermarkUrl: string): string {
  try {
    return cloudinary.video(publicId, {
      transformation: [
        { overlay: watermarkUrl },
        { flags: "layer_apply" },
        { quality: "auto" }
      ]
    });
  } catch (error) {
    console.error('Error getting watermarked video URL:', error);
    throw error;
  }
}

export async function imageFileToUrl(filename: string) {
  try {
    const result = await cloudinary.uploader.upload(filename, {
      use_filename: true,
      quality: "auto"
    });
    // Delete file after upload
    deleteFile(filename);
    return result;
  } catch (error) {
    console.error('Error uploading with filename:', error);
    try {
      deleteFile(filename);
    } catch (deleteError) {
      console.error('Error deleting file:', deleteError);
    }
    throw error;
  }
}

export async function videoFileToUrl(filename: string) {
  try {
    const result = await cloudinary.uploader.upload_large(filename, {
      resource_type: "video",
      chunk_size: 6000000,
      quality: "auto"
    });
    // Delete file after upload
    deleteFile(filename);
    return result;
  } catch (error) {
    console.error('Error uploading with filename:', error);
    try {
      deleteFile(filename);
    } catch (deleteError) {
      console.error('Error deleting file:', deleteError);
    }
    throw error;
  }
}

export async function processBackgroundReplacement(imageUrl: string, prompt: string) {
  const publicId = extractPublicId(imageUrl);
  const uniquePublicId = generateUniquePublicId(publicId);
  const uploadResult = await uploadImage(imageUrl, uniquePublicId);
  return getBackgroundReplacedUrl(uploadResult.public_id, prompt);
}

export async function processAutoCrop(imageUrl: string, width: number, height: number) {
  const publicId = extractPublicId(imageUrl);
  const uniquePublicId = generateUniquePublicId(publicId);
  const uploadResult = await uploadImage(imageUrl, uniquePublicId);
  return getAutoCroppedUrl(uploadResult.public_id, width, height);
}

export async function processOptimize(imageUrl: string) {
  const publicId = extractPublicId(imageUrl);
  const uniquePublicId = generateUniquePublicId(publicId);
  const uploadResult = await uploadImage(imageUrl, uniquePublicId);
  return getOptimizedUrl(uploadResult.public_id);
}

export async function processAddWatermarkVideoFromUrl(videoPublicId: string, watermarkUrl: string) {
  return getWatermarkedVideoUrl(videoPublicId, watermarkUrl);
}

export async function processAddWatermarkVideoFromFile(videoFile: File, watermarkFile: File) {
  const videoFilename = await getFilename(videoFile);
  const watermarkFilename = await getFilename(watermarkFile);
  const videoUploadResult = await videoFileToUrl(videoFilename);
  const watermarkUploadResult = await imageFileToUrl(watermarkFilename);
  return getWatermarkedVideoUrl(videoUploadResult.public_id, watermarkUploadResult.secure_url);
}

export async function processImageFileToUrl(file: File): Promise<{ secure_url: string; public_id: string }> {
  const filename = await getFilename(file);
  const uploadResult = await imageFileToUrl(filename);
  return { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id };
}

export async function processVideoFileToUrl(file: File): Promise<{ secure_url: string; public_id: string }> {
  const filename = await getFilename(file);
  const uploadResult = await videoFileToUrl(filename);
  return { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id };
}

function extractPublicId(imageUrl: string): string {
  return imageUrl.split('/').pop()?.split('.')[0] || '';
}

function generateUniquePublicId(publicId: string): string {
  const uuid = Math.random().toString(36).substring(2, 8);
  return `${publicId}_${uuid}`;
}

async function getFilename(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = file.name;
  return filename;
}

async function deleteFile(filename: string) {
  try {
    fs.unlinkSync(filename);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
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
