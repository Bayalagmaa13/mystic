import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';

export type ImageSource = 'camera' | 'library';

/** Камер эсвэл цомгоос дөрвөлжин зураг сонгоно. Цуцалбал null буцаана. */
export async function pickImage(source: ImageSource): Promise<string | null> {
  const perm =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error(source === 'camera' ? 'Камерт хандах зөвшөөрөл өгнө үү' : 'Зургийн цомогт хандах зөвшөөрөл өгнө үү');

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
}

/** Илгээхээс өмнө 512px болгож, JPEG 70%-иар шахна (≈ 40–80KB) */
export async function compressImage(uri: string): Promise<string> {
  const ref = await ImageManipulator.manipulate(uri).resize({ width: 512 }).renderAsync();
  const saved = await ref.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return saved.uri;
}

/** Supabase Storage → avatars/{userId}/avatar-<time>.jpg. Нийтэд нээлттэй URL буцаана. */
export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const body = await (await fetch(uri)).arrayBuffer();
  const path = `${userId}/avatar-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('avatars').upload(path, body, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}
