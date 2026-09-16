import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://elrftdikxgtmtsmkoqqm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscmZ0ZGlreGd0bXRzbWtvcXFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0OTAyOTEsImV4cCI6MjEwNTA2NjI5MX0.1wo5onFNWwmc8KfdEsNOg8sXEg4RoXvNHPARVBlPvyY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);