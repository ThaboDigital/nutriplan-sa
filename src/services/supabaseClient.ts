import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://kgjonldmtkbztqxphogd.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnam9ubGRtdGtienRxeHBob2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjQ3MDcsImV4cCI6MjEwMzc0MDcwN30.LBi-E8FfiAv2M52-afLoNmmq7G1psN_OW8jobpr6Rec';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_PUBLIC_ANON_KEY;

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});