
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL ou Key não encontradas. Verifique seu arquivo .env');
}

// Fallback para evitar crash se as env vars estiverem vazias ou inválidas
// createClient lança erro se a URL não for válida
const isValidUrl = (url: string | undefined) => {
    try {
        return url && new URL(url);
    } catch {
        return false;
    }
};

const url = isValidUrl(supabaseUrl) ? supabaseUrl! : 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder';

export const supabase = createClient(url, key);
