import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from './supabase';

export type PickedFile = { uri: string; mimeType: string; name: string; size?: number };

const MAX_ID = 10 * 1024 * 1024;
const MAX_PHOTO = 5 * 1024 * 1024;
const ID_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function rand() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function fromCamera(): Promise<PickedFile | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new Error('Necesitamos permiso de cámara para tomar la foto. Actívalo en los ajustes del teléfono.');
  const r = await ImagePicker.launchCameraAsync({ quality: 0.7, exif: false });
  if (r.canceled) return null;
  const a = r.assets[0];
  return { uri: a.uri, mimeType: a.mimeType ?? 'image/jpeg', name: a.fileName ?? 'foto.jpg', size: a.fileSize };
}

/** Foto de galería (perfil o plan). Sin EXIF: así no se filtra la ubicación de la foto. */
export async function pickPhoto(opts: { camera?: boolean; square?: boolean } = {}): Promise<PickedFile | null> {
  if (opts.camera) return fromCamera();
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
    allowsEditing: true,
    aspect: opts.square ? [1, 1] : [4, 3],
    exif: false,
  });
  if (r.canceled) return null;
  const a = r.assets[0];
  return { uri: a.uri, mimeType: a.mimeType ?? 'image/jpeg', name: a.fileName ?? 'foto.jpg', size: a.fileSize };
}

/** Carné: foto con cámara o archivo (imagen o PDF). */
export async function pickIdDocument(source: 'camera' | 'file'): Promise<PickedFile | null> {
  if (source === 'camera') return fromCamera();
  const r = await DocumentPicker.getDocumentAsync({ type: ID_TYPES, copyToCacheDirectory: true, multiple: false });
  if (r.canceled) return null;
  const a = r.assets[0];
  return { uri: a.uri, mimeType: a.mimeType ?? 'application/octet-stream', name: a.name, size: a.size };
}

async function upload(bucket: 'verifications' | 'media', userId: string, file: PickedFile, max: number, types: string[]) {
  if (!types.includes(file.mimeType)) throw new Error('Ese tipo de archivo no sirve. Usa JPG, PNG' + (bucket === 'verifications' ? ' o PDF.' : '.'));
  if (file.size && file.size > max) throw new Error(`El archivo pesa más de ${Math.round(max / 1024 / 1024)} MB. Prueba con una foto más liviana.`);
  const ext = file.mimeType === 'application/pdf' ? 'pdf' : file.mimeType.split('/')[1].replace('jpeg', 'jpg');
  const path = `${userId}/${rand()}.${ext}`;
  const body = await (await fetch(file.uri)).arrayBuffer();
  if (body.byteLength > max) throw new Error(`El archivo pesa más de ${Math.round(max / 1024 / 1024)} MB.`);
  const { error } = await supabase.storage.from(bucket).upload(path, body, { contentType: file.mimeType, upsert: false });
  if (error) throw error;
  return path;
}

export const uploadIdDocument = (userId: string, file: PickedFile) => upload('verifications', userId, file, MAX_ID, ID_TYPES);
export const uploadPhoto = (userId: string, file: PickedFile) => upload('media', userId, file, MAX_PHOTO, PHOTO_TYPES);
export const removeIdDocument = (path: string) => supabase.storage.from('verifications').remove([path]);

/** Borra todos mis archivos (carné y fotos) antes de eliminar la cuenta. */
export async function removeAllMyFiles(userId: string) {
  for (const bucket of ['verifications', 'media'] as const) {
    const { data } = await supabase.storage.from(bucket).list(userId, { limit: 1000 });
    const paths = (data ?? []).map((f) => `${userId}/${f.name}`);
    if (paths.length) await supabase.storage.from(bucket).remove(paths);
  }
}
