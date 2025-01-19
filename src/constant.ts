export type UrlRequest = { videoUrl: string; watermarkUrl: string };
export type FileRequest = { videoFile: File; watermarkFile: File };

const WATERMARK_WIDTH = 200;
const WATERMARK_HEIGHT = 200;
const X_OFFSET = 20;
const Y_OFFSET = 20;
const QUALITY = "auto";
const GRAVITY = ["south_east", "south_west", "north_east", "north_west"];
const CROP = "thumb";
const FLAGS = "layer_apply";

export const BACKGROUND_REPLACE_SETTINGS = {
  fetch_format: "auto",
  quality: "auto",
  loading: "lazy",
  dpr: "auto",
  responsive: true,
  width: "auto",
  crop: "scale",
}

export const WATERMARK_SETTINGS = {
  quality: QUALITY,
  watermark_width: WATERMARK_WIDTH,
  watermark_height: WATERMARK_HEIGHT,
  x_offset: X_OFFSET,
  y_offset: Y_OFFSET,
  gravity: GRAVITY[Math.floor(Math.random() * GRAVITY.length)],
  crop: CROP,
  flags: FLAGS
}

export const ERROR_MESSAGE = {
  INVALID_URL: "Invalid URL",
  INVALID_FILE: "Invalid file",
  INVALID_VIDEO: "Invalid video",
  INVALID_WATERMARK: "Invalid watermark",
  UPLOAD_ERROR: "Error uploading file",
  OPTIMIZE_ERROR: "Error getting optimized URL",
  CROP_ERROR: "Error getting auto-cropped URL", 
  BACKGROUND_ERROR: "Error getting background-replaced URL",
  WATERMARK_ERROR: "Error getting watermarked video URL",
  TEMP_FILE_ERROR: "Error deleting temp file",
  BACKGROUND_REMOVE_ERROR: "Error getting background-removed URL",
  UPLOAD_FILE_ERROR: "Error uploading file",
}

export const CORS_OPTIONS = {
  ORIGIN: ['*'],
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
  CREDENTIALS: true,
}