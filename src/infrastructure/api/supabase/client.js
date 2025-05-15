// src/infrastructure/api/supabase/client.js
import { createClient } from '@supabase/supabase-js';

//const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
//const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabaseUrl = "https://vpkanzvsfqbnrqgbssfb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwa2FuenZzZnFibnJxZ2Jzc2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMDY1NzAsImV4cCI6MjA2MTg4MjU3MH0.wE0pnC4t7nyUA8x6YlOeSoTaQJ-Gej692xY6bo5MkT0";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Helper pour gérer les erreurs Supabase
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  
  // Ne pas traiter l'absence de session comme une erreur
  if (error.message === 'Auth session missing') {
    return;
  }
  
  if (error.code === 'PGRST301') {
    throw new Error('Vous n\'êtes pas autorisé à effectuer cette action');
  }
  
  if (error.code === '23505') {
    throw new Error('Cette valeur existe déjà');
  }
  
  throw new Error(error.message || 'Une erreur est survenue');
};
