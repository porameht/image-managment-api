import { Elysia } from 'elysia';
import {
  uploadImage,
  processBackgroundReplacement,
  processAutoCrop,
  processOptimize,
} from './imageService';

const routes = new Elysia();

routes.get('/', () => {
  return { status: 'OK', message: 'Service is healthy' };
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

export default routes;
