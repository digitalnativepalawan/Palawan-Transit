import { createClient } from '@supabase/supabase-js';

// Hardcoded for testing
const supabaseUrl = 'https://indtrihshhwtvatwndyr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZHRyaWhzaGh3dHZhdHduZHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjAzNjksImV4cCI6MjA5MDU5NjM2OX0.puq_wgdAkG4ArXjXGLXrgpXoQKW6WDplb5KzTbDldfQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
