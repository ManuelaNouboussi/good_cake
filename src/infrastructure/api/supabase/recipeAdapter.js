// src/infrastructure/api/supabase/recipeAdapter.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export class SupabaseRecipeAdapter {
  constructor() {
    this.client = createClient(supabaseUrl, supabaseKey);
    console.log('🔌 SupabaseRecipeAdapter: Initialisé');
  }

  // Récupérer toutes les recettes avec TOUTES les données enrichies
  async getAllRecipes(limit = 50, offset = 0) {
    try {
      console.log('📡 Adapter: getAllRecipes avec limit:', limit, 'offset:', offset);
      
      // Utiliser la vue recipes_complete qui contient TOUS les champs
      const { data, error, count } = await this.client
        .from('recipes_complete')
        .select(`
          id,
          title,
          description,
          ingredients,
          steps,
          category_id,
          user_id,
          image_url,
          preparation_time,
          cooking_time,
          difficulty,
          servings,
          equipment,
          tips,
          storage_instructions,
          allergens,
          nutrition_info,
          video_url,
          source,
          yield_info,
          is_featured,
          created_at,
          updated_at,
          category_name,
          category_slug,
          author_name,
          author_avatar,
          average_gavels,
          total_ratings,
          acquitted_count,
          guilty_count,
          improvement_count,
          formatted_date,
          total_time
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Adapter: Erreur getAllRecipes:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      console.log('✅ Adapter: Recettes récupérées:', data?.length || 0);
      console.log('📋 Adapter: Première recette complète:', data?.[0]);

      // Traitement des données pour assurer la compatibilité
      const processedRecipes = (data || []).map(recipe => this.processRecipeData(recipe));

      return processedRecipes;
    } catch (error) {
      console.error('❌ Adapter: Erreur getAllRecipes:', error);
      throw error;
    }
  }

  // Récupérer les recettes par catégorie
  async getRecipesByCategory(categoryName) {
    try {
      console.log('📡 Adapter: getRecipesByCategory:', categoryName);
      
      const { data, error } = await this.client
        .from('recipes_complete')
        .select(`
          id,
          title,
          description,
          ingredients,
          steps,
          category_id,
          user_id,
          image_url,
          preparation_time,
          cooking_time,
          difficulty,
          servings,
          equipment,
          tips,
          storage_instructions,
          allergens,
          nutrition_info,
          video_url,
          source,
          yield_info,
          is_featured,
          created_at,
          updated_at,
          category_name,
          category_slug,
          author_name,
          author_avatar,
          average_gavels,
          total_ratings,
          acquitted_count,
          guilty_count,
          improvement_count,
          formatted_date,
          total_time
        `)
        .eq('category_name', categoryName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Adapter: Erreur getRecipesByCategory:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      console.log('✅ Adapter: Recettes par catégorie récupérées:', data?.length || 0);

      // Traitement des données
      const processedRecipes = (data || []).map(recipe => this.processRecipeData(recipe));

      return processedRecipes;
    } catch (error) {
      console.error('❌ Adapter: Erreur getRecipesByCategory:', error);
      throw error;
    }
  }

  // Récupérer une recette par ID
  async getRecipeById(id) {
    try {
      console.log('📡 Adapter: getRecipeById:', id);
      
      const { data, error } = await this.client
        .from('recipes_complete')
        .select(`
          id,
          title,
          description,
          ingredients,
          steps,
          category_id,
          user_id,
          image_url,
          preparation_time,
          cooking_time,
          difficulty,
          servings,
          equipment,
          tips,
          storage_instructions,
          allergens,
          nutrition_info,
          video_url,
          source,
          yield_info,
          is_featured,
          created_at,
          updated_at,
          category_name,
          category_slug,
          author_name,
          author_avatar,
          average_gavels,
          total_ratings,
          acquitted_count,
          guilty_count,
          improvement_count,
          formatted_date,
          total_time
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Adapter: Erreur getRecipeById:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      console.log('✅ Adapter: Recette récupérée:', data?.title);

      return this.processRecipeData(data);
    } catch (error) {
      console.error('❌ Adapter: Erreur getRecipeById:', error);
      throw error;
    }
  }

  // Créer une nouvelle recette
  async createRecipe(recipeData) {
    try {
      console.log('📡 Adapter: createRecipe avec données:', recipeData);
      
      // DEBUG : Vérifier les données reçues
      console.log('🔍 Adapter: Validation des champs:', {
        title: recipeData.title ? '✅' : '❌',
        description: recipeData.description ? '✅' : '❌', 
        ingredients: Array.isArray(recipeData.ingredients) ? `✅ (${recipeData.ingredients.length})` : '❌',
        steps: Array.isArray(recipeData.steps) ? `✅ (${recipeData.steps.length})` : '❌',
        categoryId: recipeData.categoryId ? '✅' : '❌',
        userId: recipeData.userId ? '✅' : '❌'
      });
      
      // Préparer les données pour l'insertion
      const insertData = {
        title: recipeData.title,
        description: recipeData.description,
        ingredients: JSON.stringify(recipeData.ingredients || []),
        steps: JSON.stringify(recipeData.steps || []),
        category_id: recipeData.categoryId,
        user_id: recipeData.userId,
        image_url: recipeData.imageUrl || null,
        preparation_time: recipeData.preparationTime || null,
        cooking_time: recipeData.cookingTime || null,
        difficulty: recipeData.difficulty || 'facile',
        servings: recipeData.servings || 4,
        equipment: recipeData.equipment || [],
        tips: recipeData.tips || null,
        storage_instructions: recipeData.storageInstructions || null,
        allergens: recipeData.allergens || [],
        nutrition_info: recipeData.nutritionInfo ? JSON.stringify(recipeData.nutritionInfo) : null,
        video_url: recipeData.videoUrl || null,
        source: recipeData.source || null,
        yield_info: recipeData.yieldInfo || null
      };

      console.log('📡 Adapter: Données préparées pour insertion:', insertData);

      const { data, error } = await this.client
        .from('recipes')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Adapter: Erreur createRecipe:', error);
        throw new Error(`Erreur création: ${error.message}`);
      }

      console.log('✅ Adapter: Recette créée:', data.id);
      return this.processRecipeData(data);
    } catch (error) {
      console.error('❌ Adapter: Erreur createRecipe:', error);
      throw error;
    }
  }

  // Traitement des données de recette pour assurer la compatibilité
  processRecipeData(recipe) {
    if (!recipe) return null;

    // Parser les JSON si nécessaire
    let ingredients = recipe.ingredients;
    if (typeof ingredients === 'string') {
      try {
        ingredients = JSON.parse(ingredients);
      } catch (e) {
        console.warn('⚠️ Adapter: Erreur parsing ingredients:', e);
        ingredients = [];
      }
    }

    let steps = recipe.steps;
    if (typeof steps === 'string') {
      try {
        steps = JSON.parse(steps);
      } catch (e) {
        console.warn('⚠️ Adapter: Erreur parsing steps:', e);
        steps = [];
      }
    }

    let nutritionInfo = recipe.nutrition_info;
    if (typeof nutritionInfo === 'string') {
      try {
        nutritionInfo = JSON.parse(nutritionInfo);
      } catch (e) {
        console.warn('⚠️ Adapter: Erreur parsing nutrition_info:', e);
        nutritionInfo = null;
      }
    }

    // S'assurer que les arrays sont bien des arrays
    const equipment = Array.isArray(recipe.equipment) ? recipe.equipment : [];
    const allergens = Array.isArray(recipe.allergens) ? recipe.allergens : [];

    // Retourner l'objet avec tous les champs, en maintenant la compatibilité
    return {
      // Champs de base
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: ingredients,
      steps: steps,
      category_id: recipe.category_id,
      user_id: recipe.user_id,
      image_url: recipe.image_url,
      imageUrl: recipe.image_url, // Alias pour compatibilité
      preparation_time: recipe.preparation_time,
      prepTime: recipe.preparation_time, // Alias pour compatibilité
      cooking_time: recipe.cooking_time,
      cookTime: recipe.cooking_time, // Alias pour compatibilité
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      is_featured: recipe.is_featured,
      isFeatured: recipe.is_featured, // Alias pour compatibilité
      created_at: recipe.created_at,
      createdAt: recipe.created_at, // Alias pour compatibilité
      updated_at: recipe.updated_at,
      updatedAt: recipe.updated_at, // Alias pour compatibilité

      // Nouveaux champs enrichis
      equipment: equipment,
      tips: recipe.tips,
      storage_instructions: recipe.storage_instructions,
      storageInstructions: recipe.storage_instructions, // Alias pour compatibilité
      allergens: allergens,
      nutrition_info: nutritionInfo,
      nutritionInfo: nutritionInfo, // Alias pour compatibilité
      video_url: recipe.video_url,
      videoUrl: recipe.video_url, // Alias pour compatibilité
      source: recipe.source,
      yield_info: recipe.yield_info,
      yieldInfo: recipe.yield_info, // Alias pour compatibilité

      // Champs calculés de la vue
      category_name: recipe.category_name,
      categoryName: recipe.category_name, // Alias pour compatibilité
      category: recipe.category_name, // Alias pour compatibilité
      category_slug: recipe.category_slug,
      author_name: recipe.author_name,
      authorName: recipe.author_name, // Alias pour compatibilité
      author_avatar: recipe.author_avatar,
      authorAvatar: recipe.author_avatar, // Alias pour compatibilité
      average_gavels: recipe.average_gavels || 0,
      averageRating: recipe.average_gavels || 0, // Alias pour compatibilité
      total_ratings: recipe.total_ratings || 0,
      totalRatings: recipe.total_ratings || 0, // Alias pour compatibilité
      acquitted_count: recipe.acquitted_count || 0,
      guilty_count: recipe.guilty_count || 0,
      improvement_count: recipe.improvement_count || 0,
      formatted_date: recipe.formatted_date,
      formattedDate: recipe.formatted_date, // Alias pour compatibilité
      total_time: recipe.total_time || 0,
      totalTime: recipe.total_time || 0 // Alias pour compatibilité
    };
  }

  // Rechercher des recettes
  async searchRecipes(searchTerm, categoryName = null) {
    try {
      console.log('📡 Adapter: searchRecipes:', searchTerm, 'catégorie:', categoryName);
      
      let query = this.client
        .from('recipes_complete')
        .select(`
          id,
          title,
          description,
          ingredients,
          steps,
          category_id,
          user_id,
          image_url,
          preparation_time,
          cooking_time,
          difficulty,
          servings,
          equipment,
          tips,
          storage_instructions,
          allergens,
          nutrition_info,
          video_url,
          source,
          yield_info,
          is_featured,
          created_at,
          updated_at,
          category_name,
          category_slug,
          author_name,
          author_avatar,
          average_gavels,
          total_ratings,
          formatted_date,
          total_time
        `);

      // Recherche dans le titre et la description
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Filtrer par catégorie si spécifié
      if (categoryName && categoryName !== 'all') {
        query = query.eq('category_name', categoryName);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('❌ Adapter: Erreur searchRecipes:', error);
        throw new Error(`Erreur recherche: ${error.message}`);
      }

      console.log('✅ Adapter: Résultats recherche:', data?.length || 0);

      // Traitement des données
      const processedRecipes = (data || []).map(recipe => this.processRecipeData(recipe));

      return processedRecipes;
    } catch (error) {
      console.error('❌ Adapter: Erreur searchRecipes:', error);
      throw error;
    }
  }

  // Tester la connexion
  async testConnection() {
    try {
      console.log('🔄 Adapter: Test de connexion...');
      
      const { data, error } = await this.client
        .from('recipes_complete')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Adapter: Erreur connexion:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Adapter: Connexion réussie');
      return { success: true, message: 'Connexion établie' };
    } catch (error) {
      console.error('❌ Adapter: Erreur test connexion:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir les catégories
  async getCategories() {
    try {
      console.log('📡 Adapter: getCategories');
      
      const { data, error } = await this.client
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Adapter: Erreur getCategories:', error);
        throw new Error(`Erreur catégories: ${error.message}`);
      }

      console.log('✅ Adapter: Catégories récupérées:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Adapter: Erreur getCategories:', error);
      throw error;
    }
  }

  // Noter une recette (utilise la fonction SQL)
  async rateRecipe(recipeId, userId, ratingData) {
    try {
      console.log('📡 Adapter: rateRecipe:', recipeId, 'par', userId);
      
      const { data, error } = await this.client
        .rpc('rate_recipe_complete', {
          recipe_uuid: recipeId,
          user_uuid: userId,
          overall_gavels: ratingData.gavels,
          taste_gavels: ratingData.tasteRating || null,
          difficulty_gavels: ratingData.difficultyRating || null,
          presentation_gavels: ratingData.presentationRating || null,
          user_comment: ratingData.comment || null,
          user_verdict: ratingData.verdict || null,
          would_make_again: ratingData.wouldMakeAgain || null
        });

      if (error) {
        console.error('❌ Adapter: Erreur rateRecipe:', error);
        throw new Error(`Erreur notation: ${error.message}`);
      }

      console.log('✅ Adapter: Notation enregistrée');
      return data?.[0] || null;
    } catch (error) {
      console.error('❌ Adapter: Erreur rateRecipe:', error);
      throw error;
    }
  }

  // Obtenir les statistiques d'une recette
  async getRecipeStats(recipeId) {
    try {
      console.log('📡 Adapter: getRecipeStats:', recipeId);
      
      const { data, error } = await this.client
        .rpc('get_recipe_rating_stats', {
          recipe_uuid: recipeId
        });

      if (error) {
        console.error('❌ Adapter: Erreur getRecipeStats:', error);
        throw new Error(`Erreur stats: ${error.message}`);
      }

      console.log('✅ Adapter: Stats récupérées');
      return data?.[0] || null;
    } catch (error) {
      console.error('❌ Adapter: Erreur getRecipeStats:', error);
      throw error;
    }
  }
}
