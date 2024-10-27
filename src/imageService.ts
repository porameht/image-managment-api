import cloudinary from './config';

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

function extractPublicId(imageUrl: string): string {
  return imageUrl.split('/').pop()?.split('.')[0] || '';
}

function generateUniquePublicId(publicId: string): string {
  const uuid = Math.random().toString(36).substring(2, 8);
  return `${publicId}_${uuid}`;
}
