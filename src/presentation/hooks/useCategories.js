// src/presentation/hooks/useCategories.js - VERSION SIMPLIFIÉE
import { useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/api/supabase/client';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Catégories par défaut
  const defaultCategories = [
    { id: 'default-1', name: 'Pâtisseries', slug: 'patisseries' },
    { id: 'default-2', name: 'Chocolats', slug: 'chocolats' },
    { id: 'default-3', name: 'Glaces', slug: 'glaces' },
    { id: 'default-4', name: 'Confiseries', slug: 'confiseries' }
  ];

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Hook: Chargement des catégories...');
      
      const { data, error: supabaseError } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (supabaseError) {
        console.error('❌ Hook: Erreur Supabase:', supabaseError);
        throw supabaseError;
      }
      
      if (data && data.length > 0) {
        console.log('✅ Hook: Catégories chargées:', data);
        setCategories(data);
      } else {
        console.warn('⚠️ Hook: Aucune catégorie, utilisation des valeurs par défaut');
        setCategories(defaultCategories);
      }
      
      return data || defaultCategories;
    } catch (err) {
      console.error('💥 Hook: Erreur:', err);
      setError(err.message);
      setCategories(defaultCategories);
      return defaultCategories;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const clearError = () => setError(null);

  return {
    categories: categories.length > 0 ? categories : defaultCategories,
    loading,
    error,
    loadCategories,
    clearError
  };
}