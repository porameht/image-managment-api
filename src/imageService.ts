import cloudinary from "./config";
import fs from "fs";
import {
  WATERMARK_SETTINGS,
  ERROR_MESSAGE,
  BACKGROUND_REPLACE_SETTINGS
} from "./constant";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";
import { extractPublicId, generateUniquePublicId } from "./utils";
import replicate from "./client";
import { ReplicateResponse } from "./types";

export async function uploadImage(imageUrl: string, publicId: string) {
  try {
    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
    });
    return uploadResult;
  } catch (error) {
    console.error(ERROR_MESSAGE.INVALID_URL, error);
    throw error;
  }
}

export function getOptimizedUrl(publicId: string) {
  try {
    return cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
    });
  } catch (error) {
    console.error(ERROR_MESSAGE.OPTIMIZE_ERROR, error);
    throw error;
  }
}

export async function getBackgroundRemovedUrl(imageUrl: string): Promise<string> {
  try {
    const response = await replicate.run(
      "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
      {
        input: {
          image: imageUrl
        }
      }
    ) as ReplicateResponse;

    const publicId = generateUniquePublicId(imageUrl);
    const uploadResult = await uploadImage(response.output as string, publicId);

    return uploadResult.secure_url;
  } catch (error) {
    console.error(ERROR_MESSAGE.BACKGROUND_REMOVE_ERROR, error);
    throw error;
  }
}

export function getAutoCroppedUrl(
  publicId: string,
  width: number,
  height: number
) {
  try {
    return cloudinary.url(publicId, {
      crop: "auto",
      gravity: "auto",
      width,
      height,
    });
  } catch (error) {
    console.error(ERROR_MESSAGE.CROP_ERROR, error);
    throw error;
  }
}

function getBackgroundReplacedUrl(publicId: string, prompt: string): string {
  try {
    return cloudinary.url(publicId, {
      effect: `gen_background_replace:prompt_${prompt}`,
      fetch_format: "auto",
      quality: "auto",
      loading: "lazy",
      dpr: "auto",
      responsive: true,
      width: "auto",
      crop: "scale",
    });
  } catch (error) {
    console.error(ERROR_MESSAGE.BACKGROUND_ERROR, error);
    throw error;
  }
}

function getWatermarkedVideoUrl(
  publicId: string,
  imagePublicId: string
): string {
  try {
    return cloudinary.video(publicId, {
      transformation: [
        { quality: WATERMARK_SETTINGS.quality },
        { overlay: imagePublicId },
        {
          width: WATERMARK_SETTINGS.watermark_width,
          height: WATERMARK_SETTINGS.watermark_height,
          crop: WATERMARK_SETTINGS.crop,
        }, // Add crop for overlay
        {
          flags: WATERMARK_SETTINGS.flags,
          gravity: WATERMARK_SETTINGS.gravity,
          y: WATERMARK_SETTINGS.y_offset,
          x: WATERMARK_SETTINGS.x_offset,
        }, // Combine flags and position in one
      ],
    });
  } catch (error) {
    console.error(ERROR_MESSAGE.WATERMARK_ERROR, error);
    throw error;
  }
}

export async function imageFileToUrl(file: File) {
  try {
    // Create temp file path
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(
      tempDir,
      `upload_${Date.now()}_${file.name}`
    );

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
      unique_filename: true,
    });

    // Clean up temp file
    try {
      await fs.promises.unlink(tempFilePath);
    } catch (deleteError) {
      console.error(ERROR_MESSAGE.TEMP_FILE_ERROR, deleteError);
    }

    return result;
  } catch (error) {
    console.error(ERROR_MESSAGE.UPLOAD_ERROR, error);
    throw error;
  }
}

export async function videoFileToUrl(file: File) {
  try {
    // Create temp file path
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(
      tempDir,
      `upload_${Date.now()}_${file.name}`
    );

    // Convert File to Buffer and write to temp file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempFilePath, buffer);

    const publicId = file.name.split(".")[0];
    const uniquePublicId = generateUniquePublicId(publicId);

    console.log("uniquePublicId", uniquePublicId);
    // Upload using file path with chunking
    let finalResult;
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        tempFilePath,
        {
          public_id: uniquePublicId,
          resource_type: "video",
          chunk_size: 6000000,
          quality: "auto",
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          finalResult = result;
          resolve(result);
        }
      );
    });

    await uploadPromise;

    // Clean up temp file
    try {
      await fs.promises.unlink(tempFilePath);
    } catch (deleteError) {
      console.error(ERROR_MESSAGE.TEMP_FILE_ERROR, deleteError);
    }

    return finalResult;
  } catch (error) {
    console.error(ERROR_MESSAGE.UPLOAD_ERROR, error);
    throw error;
  }
}

export async function processBackgroundRemove(
  imageUrl: string | undefined,
  file: File | undefined,
) {
  if (imageUrl) {
    const publicId = extractPublicId(imageUrl);
    const uniquePublicId = generateUniquePublicId(publicId);
    const uploadResult = await uploadImage(imageUrl, uniquePublicId);

    return getBackgroundRemovedUrl(uploadResult.secure_url);
  } else if (file) {
    const uploadResult = await imageFileToUrl(file);
    return getBackgroundRemovedUrl(uploadResult.secure_url);
  }
  throw new Error('Image URL or file is required');
}

export async function processBackgroundReplacement(
  imageUrl: string,
  prompt: string
) {
  const publicId = extractPublicId(imageUrl);
  const uniquePublicId = generateUniquePublicId(publicId);
  const uploadResult = await uploadImage(imageUrl, uniquePublicId);
  return getBackgroundReplacedUrl(uploadResult.public_id, prompt);
}

export async function processAutoCrop(
  imageUrl: string,
  width: number,
  height: number
) {
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

export async function processAddWatermarkVideoFromUrl(
  videoUrl: string,
  watermarkUrl: string
) {
  const videoPublicId = extractPublicId(videoUrl);
  const watermarkPublicId = extractPublicId(watermarkUrl);
  const uniqueVideoPublicId = generateUniquePublicId(videoPublicId);
  const uniqueWatermarkPublicId = generateUniquePublicId(watermarkPublicId);
  const videoUploadResult = await uploadImage(videoUrl, uniqueVideoPublicId);
  const watermarkUploadResult = await uploadImage(
    watermarkUrl,
    uniqueWatermarkPublicId
  );

  return getWatermarkedVideoUrl(
    videoUploadResult.public_id,
    watermarkUploadResult.public_id
  );
}

export async function processAddWatermarkVideoFromFile(
  videoFile: File,
  watermarkFile: File
) {
  const videoUploadResult = await videoFileToUrl(videoFile);
  const watermarkUploadResult = await imageFileToUrl(watermarkFile);
  return getWatermarkedVideoUrl(
    videoUploadResult.public_id,
    watermarkUploadResult.public_id
  );
}

export async function processImageFileToUrl(
  file: File
): Promise<{ secure_url: string; public_id: string }> {
  const uploadResult = await imageFileToUrl(file);
  return {
    secure_url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  };
}

export async function processVideoFileToUrl(
  file: File
): Promise<{ secure_url: string; public_id: string }> {
  const uploadResult = await videoFileToUrl(file);
  return {
    secure_url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  };
}
