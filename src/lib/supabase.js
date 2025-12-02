import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    const error = 'Missing required Supabase environment variables. Please check your .env file.';
    console.error(error);
    // In development, throw error to prevent silent failures
    if (import.meta.env.DEV) {
        throw new Error(error);
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
