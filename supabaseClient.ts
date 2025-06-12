import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import type { Database } from './types/supabase'; // Will create this for type safety

const supabaseUrl = 'https://aojnxzljnbvdvpjmtzbs.supabase.co';
// It's generally better to use environment variables for keys,
// but using the provided anon key directly as requested.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvam54emxqbmJ2ZHZwam10emJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTQxNDQsImV4cCI6MjA2NTI5MDE0NH0.v61Jd2Mt-2Zgmu3FvgYl94aK_SLFXth2jojsdNAI9R0';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);