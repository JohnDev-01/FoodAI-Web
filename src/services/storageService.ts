import { supabaseClient } from './supabaseClient';

const PROFILE_IMAGE_BUCKET = 'profile-images';

const sanitizeFileName = (input: string) => {
  const baseName = input.replace(/\.[^/.]+$/, '');
  const safeBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  const extension = input.includes('.')
    ? input.split('.').pop()?.toLowerCase()
    : undefined;

  return `${safeBase || 'image'}${extension ? `.${extension}` : ''}`;
};

const uploadImageToStorage = async (file: File, pathSegments: string[]): Promise<string> => {
  if (!PROFILE_IMAGE_BUCKET) {
    throw new Error('No se ha definido el bucket de almacenamiento para imágenes.');
  }

  const safeFileName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const prefix = pathSegments.filter(Boolean).join('/');
  const path = prefix ? `${prefix}/${timestamp}-${safeFileName}` : `${timestamp}-${safeFileName}`;

  const { error: uploadError } = await supabaseClient.storage
    .from(PROFILE_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabaseClient.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error('No se pudo obtener la URL pública de la imagen cargada.');
  }

  return data.publicUrl;
};

export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
  return uploadImageToStorage(file, [userId]);
};

export const uploadRestaurantLogo = async (
  file: File,
  restaurantId: string
): Promise<string> => {
  return uploadImageToStorage(file, ['restaurants', restaurantId, 'logo']);
};
