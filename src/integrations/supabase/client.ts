import { createClient } from '@supabase/supabase-js';

// On récupère les clés depuis ton fichier .env local (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les clés Supabase sont manquantes dans le fichier .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);