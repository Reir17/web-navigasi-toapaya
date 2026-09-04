import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  'https://undiautqcfedrvnqkbpf.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZGlhdXRxY2ZlZHJ2bnFrYnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTU4NjMsImV4cCI6MjEwMjI5MTg2M30.Cto6usx6c1goAYIIh5ybEPL6oMW_JYZ4AmGWrclSeR4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);