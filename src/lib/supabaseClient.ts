import { createClient } from '@supabase/supabase-js';

// Zugriff auf die Daten erfolgt ausschließlich über die Supabase-API-Mappings
// (PostgREST via supabase-js .from(...)). RLS erzwingt, dass nur authentifizierte
// Trainer Daten sehen/bearbeiten. Es wird der öffentliche anon-Key verwendet –
// der service-role-Key darf NIEMALS ins Frontend.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase ist nicht konfiguriert: VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY ' +
    'müssen in der .env gesetzt sein (siehe .env.example).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
