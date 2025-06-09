// src/presentation/hooks/useRecipes.js
import { useState, useEffect } from 'react';
import { SupabaseRecipeAdapter } from '../../infrastructure/api/supabase/recipeAdapter';
import { RecipeService } from '../../domain/services/RecipeService';

// Instance des services
const recipeAdapter = new SupabaseRecipeAdapter();
const recipeService = new RecipeService(recipeAdapter);

export function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRecipes = async (category = null) => {
    try {
      console.log('🔄 Début du chargement des recettes...', category ? `catégorie: ${category}` : 'toutes');
      setLoading(true);
      setError(null);

      // Test de connexion d'abord
      const connectionTest = await recipeAdapter.testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connexion impossible: ${connectionTest.error}`);
      }

      console.log('✅ Connexion Supabase OK');

      let data;
      if (category && category !== 'all') {
        data = await recipeService.getRecipesByCategory(category);
      } else {
        data = await recipeService.getAllRecipes();
      }

      console.log('📊 Données reçues du service:', {
        count: data?.length || 0,
        first: data?.[0]?.title || 'Aucune',
        hasImages: data?.filter(r => r.imageUrl).length || 0
      });

      if (Array.isArray(data) && data.length > 0) {
        setRecipes(data);
        console.log('✅ Recettes mises à jour dans le state');
      } else {
        console.warn('⚠️ Aucune recette trouvée ou données invalides');
        setRecipes([]);
        
        // Si aucune recette trouvée, essayer des recettes par défaut
        const defaultRecipes = getDefaultRecipes();
        setRecipes(defaultRecipes);
        console.log(`🔄 ${defaultRecipes.length} recettes par défaut chargées`);
      }

      return data;
    } catch (err) {
      console.error('❌ Erreur loadRecipes détaillée:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      setError(`Erreur de chargement: ${err.message}`);
      
      // Fallback vers les recettes par défaut
      const defaultRecipes = getDefaultRecipes();
      setRecipes(defaultRecipes);
      console.log(`🔄 Fallback: ${defaultRecipes.length} recettes par défaut`);
      
      return defaultRecipes;
    } finally {
      setLoading(false);
      console.log('✅ Fin du chargement des recettes');
    }
  };

  const searchRecipes = async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Recherche:', query);
      const data = await recipeService.searchRecipes(query);
      setRecipes(data || []);
      
      return data;
    } catch (err) {
      console.error('❌ Erreur searchRecipes:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRecipeById = async (id) => {
    try {
      console.log('🔍 Récupération recette ID:', id);
      return await recipeService.getRecipeById(id);
    } catch (err) {
      console.error('❌ Erreur getRecipeById:', err);
      throw err;
    }
  };

  // Recettes par défaut en cas d'erreur
  const getDefaultRecipes = () => {
    return [
      {
        id: 'default-1',
        title: 'Tarte au Chocolat Classique',
        description: 'Une délicieuse tarte au chocolat pour découvrir notre système de recettes.',
        ingredients: [
          { name: 'Chocolat noir', quantity: '200g', note: '70% cacao' },
          { name: 'Crème liquide', quantity: '200ml', note: '' },
          { name: 'Pâte sablée', quantity: '1', note: 'prête à l\'emploi' }
        ],
        steps: [
          { step: 1, instruction: 'Préchauffer le four à 180°C', duration: '5 min' },
          { step: 2, instruction: 'Faire fondre le chocolat avec la crème', duration: '10 min' },
          { step: 3, instruction: 'Verser sur la pâte et cuire', duration: '25 min' }
        ],
        categoryName: 'Pâtisseries',
        categorySlug: 'patisseries',
        authorName: 'Chef Système',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
        preparationTime: 20,
        cookingTime: 25,
        totalTime: 45,
        difficulty: 'facile',
        servings: 6,
        equipment: ['Four', 'Moule à tarte'],
        tips: 'Vérifiez que votre système fonctionne en créant de vraies recettes !',
        averageGavels: 0,
        totalRatings: 0,
        acquittedCount: 0,
        guiltyCount: 0,
        improvementCount: 0,
        formattedDate: new Date().toLocaleDateString('fr-FR'),
        createdAt: new Date().toISOString(),
        isFeatured: false
      },
      {
        id: 'default-2',
        title: 'Test de Connexion',
        description: 'Cette recette apparaît si la base de données n\'est pas accessible.',
        ingredients: [
          { name: 'Patience', quantity: '1 dose', note: 'importante' },
          { name: 'Configuration', quantity: '1', note: 'correcte' }
        ],
        steps: [
          { step: 1, instruction: 'Vérifier la configuration Supabase', duration: '5 min' },
          { step: 2, instruction: 'Tester les permissions de la base', duration: '3 min' }
        ],
        categoryName: 'Test',
        categorySlug: 'test',
        authorName: 'Système',
        imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307',
        preparationTime: 5,
        cookingTime: 0,
        totalTime: 5,
        difficulty: 'technique',
        servings: 1,
        equipment: ['Ordinateur', 'Connexion internet'],
        tips: 'Si vous voyez cette recette, vérifiez votre configuration !',
        averageGavels: 0,
        totalRatings: 0,
        acquittedCount: 0,
        guiltyCount: 0,
        improvementCount: 0,
        formattedDate: new Date().toLocaleDateString('fr-FR'),
        createdAt: new Date().toISOString(),
        isFeatured: false
      }
    ];
  };

  // Charger les recettes au montage du composant
  useEffect(() => {
    console.log('🚀 Initialisation du hook useRecipes');
    loadRecipes();
  }, []);

  const clearError = () => setError(null);

  return {
    recipes,
    loading,
    error,
    loadRecipes,
    searchRecipes,
    getRecipeById,
    clearError,
    // Service exposé pour usage direct
    recipeService,
    // Utilitaires de debug
    testConnection: () => recipeAdapter.testConnection(),
    getDefaultRecipes
  };
}
