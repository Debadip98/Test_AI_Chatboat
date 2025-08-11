import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Automatically detect environment (local or production)
const redirectUrl =
  import.meta.env.DEV
    ? 'http://localhost:5173' // Local dev
    : 'https://test-ai-chatboat.vercel.app'; // Vercel production URL

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: redirectUrl,
  },
});
