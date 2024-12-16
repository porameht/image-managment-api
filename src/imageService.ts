import cloudinary from './config';
import fs from 'fs';
import { UrlRequest, FileRequest } from './constant';
import { writeFile } from 'fs/promises';
import path from 'path';
import os from 'os';

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
function getWatermarkedVideoUrl(publicId: string, imagePublicId: string): string {
  try {
    const gravity = "south_east";
    const x = 10;
    const y = 10;
    const flags = "layer_apply";
    const quality = "auto";
    const width = 100;
    const height = 100;
    return cloudinary.video(publicId, {
      transformation: [
        { overlay: imagePublicId },
        { gravity: gravity },
        { x: x },
        { y: y },
        { width: width },
        { height: height },
        { flags: flags },
        { quality: quality }
      ]
    });
  } catch (error) {
    console.error('Error getting watermarked video URL:', error);
    throw error;
  }
}

export async function imageFileToUrl(file: File) {
  try {
    // Create temp file path
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${file.name}`);
    
    // Convert File to Buffer and write to temp file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempFilePath, buffer);

    // Upload using file path
    const result = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: "auto",
      quality: "auto",
      filename_override: file.name,
      use_filename: true,
      unique_filename: true
    });

    // Clean up temp file
    try {
      await fs.promises.unlink(tempFilePath);
    } catch (deleteError) {
      console.error('Error deleting temp file:', deleteError);
    }

    return result;
  } catch (error) {
    console.error('Error uploading image file:', error);
    throw error;
  }
}
export async function videoFileToUrl(file: File) {
  try {
    // Create temp file path
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${file.name}`);
    
    // Convert File to Buffer and write to temp file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempFilePath, buffer);

    const publicId = file.name.split('.')[0];
    const uniquePublicId = generateUniquePublicId(publicId);

    console.log("uniquePublicId", uniquePublicId)
    // Upload using file path with chunking
    let finalResult;
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(tempFilePath, {
        public_id: uniquePublicId,
        resource_type: "video",
        chunk_size: 6000000,
        quality: "auto",
        unique_filename: true
      }, (error, result) => {
        if (error) reject(error);
        finalResult = result;
        resolve(result);
      });
    });

    await uploadPromise;

    // Clean up temp file
    try {
      await fs.promises.unlink(tempFilePath);
    } catch (deleteError) {
      console.error('Error deleting temp file:', deleteError);
    }

    return finalResult;
  } catch (error) {
    console.error('Error uploading video file:', error);
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

export async function processAddWatermarkVideoFromUrl(videoUrl: string, watermarkUrl: string) {
  const videoPublicId = extractPublicId(videoUrl);
  const watermarkPublicId = extractPublicId(watermarkUrl);
  const uniqueVideoPublicId = generateUniquePublicId(videoPublicId);
  const uniqueWatermarkPublicId = generateUniquePublicId(watermarkPublicId);
  const videoUploadResult = await uploadImage(videoUrl, uniqueVideoPublicId);
  const watermarkUploadResult = await uploadImage(watermarkUrl, uniqueWatermarkPublicId);

  return getWatermarkedVideoUrl(videoUploadResult.public_id, watermarkUploadResult.public_id);
}

export async function processAddWatermarkVideoFromFile(videoFile: File, watermarkFile: File) {
  const videoUploadResult = await videoFileToUrl(videoFile);
  const watermarkUploadResult = await imageFileToUrl(watermarkFile);
  return getWatermarkedVideoUrl(videoUploadResult.public_id, watermarkUploadResult.public_id);
}

export async function processImageFileToUrl(file: File): Promise<{ secure_url: string; public_id: string }> {
  const uploadResult = await imageFileToUrl(file);
  return { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id };
}

export async function processVideoFileToUrl(file: File): Promise<{ secure_url: string; public_id: string }> {
  const uploadResult = await videoFileToUrl(file);
  return { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id };
}

function extractPublicId(imageUrl: string): string {
  return imageUrl.split('/').pop()?.split('.')[0] || '';
}

function generateUniquePublicId(publicId: string): string {
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
