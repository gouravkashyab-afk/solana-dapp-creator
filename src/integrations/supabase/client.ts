import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'sakura.supabase.url';
const STORAGE_ANON_KEY = 'sakura.supabase.anonKey';

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
};

const storedUrl = readStorage(STORAGE_URL_KEY);
const storedAnonKey = readStorage(STORAGE_ANON_KEY);

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_URL = envUrl ?? storedUrl;
const SUPABASE_ANON_KEY = envAnonKey ?? storedAnonKey;

export const supabaseConfig = {
  hasUrl: !!SUPABASE_URL,
  hasAnonKey: !!SUPABASE_ANON_KEY,
  source:
    envUrl && envAnonKey
      ? ('env' as const)
      : storedUrl && storedAnonKey
        ? ('localStorage' as const)
        : ('missing' as const),
  storageKeys: {
    url: STORAGE_URL_KEY,
    anonKey: STORAGE_ANON_KEY,
  },
} as const;

if (import.meta.env.DEV) {
  const envKeys = Object.keys(import.meta.env as any).filter((k) =>
    k.toUpperCase().includes('SUPABASE')
  );
  console.info('[Supabase] Frontend env check', {
    hasUrl: !!SUPABASE_URL,
    hasAnonKey: !!SUPABASE_ANON_KEY,
    envKeys,
  });
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Don't hard-crash the whole app; allow non-auth pages (like Landing) to render.
  console.error(
    '[Supabase] Missing configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or configure them on the Auth page setup panel.'
  );
}

export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

