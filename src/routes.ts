import { Elysia } from 'elysia';
import {
  uploadImage,
  processBackgroundReplacement,
  processAutoCrop,
  processOptimize,
  processAddWatermarkVideoFromUrl,
  processImageFileToUrl,
  processVideoFileToUrl,
  processAddWatermarkVideoFromFile,
  isUrlRequest,
  isFileRequest,
} from './imageService';
import { UrlRequest, FileRequest } from './constant';

const routes = new Elysia();

routes.get('/', () => {
  return { status: 'OK', message: 'Service is healthy' };
});

routes.post('/img-to-url', async ({ body }) => {
  const { file } = body as { file: File };
  const url = await processImageFileToUrl(file);
  return { success: true, url };
});

routes.post('/video-to-url', async ({ body }) => {
  const { file } = body as { file: File };
  const url = await processVideoFileToUrl(file);
  return { success: true, url };
});

routes.post('/upload', async ({ body }) => {
  const { imageUrl, publicId } = body as { imageUrl: string; publicId: string };
  if (!imageUrl || !publicId) {
    return { success: false, error: 'Image URL and public ID are required' };
  }
  const result = await uploadImage(imageUrl, publicId);
  return { success: true, result };
});

routes.post('/optimize', async ({ body }) => {
  const { imageUrl } = body as { imageUrl: string };
  if (!imageUrl) {
    return { success: false, error: 'Image URL is required' };
  }
  const url = await processOptimize(imageUrl);
  return { success: true, url };
});

routes.post('/autocrop', async ({ body }) => {
  const { imageUrl, width, height } = body as { imageUrl: string; width: string; height: string };
  if (!imageUrl || !width || !height) {
    return { success: false, error: 'Image URL, width, and height are required' };
  }
  const url = await processAutoCrop(imageUrl, parseInt(width), parseInt(height));
  return { success: true, url };
});

routes.post('/replace-background', async ({ body }) => {
  const { imageUrl, prompt } = body as { imageUrl: string; prompt: string };
  if (!imageUrl || !prompt) {
    return { success: false, error: 'Image URL and prompt are required' };
  }
  const url = await processBackgroundReplacement(imageUrl, prompt);
  return { success: true, url };
});

routes.post('/add-watermark-video', async ({ body }: { body: unknown }) => {

  if (isUrlRequest(body)) {
    const { videoUrl, watermarkUrl } = body as UrlRequest;
    const url = await processAddWatermarkVideoFromUrl(videoUrl, watermarkUrl);
    return { success: true, url };
  }

  if (isFileRequest(body)) {
    const { videoFile, watermarkFile } = body as FileRequest;
    const url = await processAddWatermarkVideoFromFile(videoFile, watermarkFile);
    return { success: true, url };
  }

  return { 
    success: false, 
    error: 'Invalid request format. Provide either URLs or files for both video and watermark.' 
  };
});

export default routes;
