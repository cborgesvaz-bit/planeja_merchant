import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copie .env.example para .env.local.'
  );
}

// A anon key é pública por design. A proteção real vem do RLS no banco
// + da sessão do usuário, que o SDK injeta automaticamente no Authorization.
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
