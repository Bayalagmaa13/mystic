import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';
import { SUPABASE_ANON_KEY as anonKey, SUPABASE_URL as url } from './config';

/**
 * SecureStore нэг утганд ~2KB л хадгалдаг. Supabase-ийн session (JWT) үүнээс
 * урт байж болох тул утгыг 1800 тэмдэгтийн хэсгүүдэд хувааж хадгална.
 *   key_n  → хэдэн хэсэгтэй вэ
 *   key_0, key_1 ... → хэсгүүд
 */
const CHUNK = 1800;

const SecureChunkStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await SecureStore.getItemAsync(`${key}_n`);
    if (!count) return null;
    let value = '';
    for (let i = 0; i < Number(count); i++) {
      value += (await SecureStore.getItemAsync(`${key}_${i}`)) ?? '';
    }
    return value;
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureChunkStorage.removeItem(key);
    const parts = Math.ceil(value.length / CHUNK);
    for (let i = 0; i < parts; i++) {
      await SecureStore.setItemAsync(`${key}_${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK));
    }
    await SecureStore.setItemAsync(`${key}_n`, String(parts));
  },
  async removeItem(key: string): Promise<void> {
    const count = await SecureStore.getItemAsync(`${key}_n`);
    if (!count) return;
    for (let i = 0; i < Number(count); i++) {
      await SecureStore.deleteItemAsync(`${key}_${i}`);
    }
    await SecureStore.deleteItemAsync(`${key}_n`);
  },
};

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: SecureChunkStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Апп идэвхтэй үед л token-оо автоматаар шинэчилнэ (батарей хэмнэнэ)
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
