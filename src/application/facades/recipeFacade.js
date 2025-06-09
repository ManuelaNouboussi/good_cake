// src/application/facades/recipeFacade.js
import { SupabaseRecipeAdapter } from '../../infrastructure/api/supabase/recipeAdapter.js';
import { RecipeService } from '../../domain/services/RecipeService.js';

class RecipeFacade {
  constructor() {
    this.recipeAdapter = new SupabaseRecipeAdapter();
    this.recipeService = new RecipeService(this.recipeAdapter);
  }

  async getAllRecipes(options = {}) {
    try {
      console.log('🎭 Facade: getAllRecipes avec options:', options);
      
      const { category, sortBy, order, limit = 50, offset = 0 } = options;
      
      let recipes;
      if (category && category !== 'all' && category !== '') {
        // Normaliser le nom de catégorie
        const normalizedCategory = this.normalizeCategoryName(category);
        console.log('🎭 Facade: Récupération par catégorie:', normalizedCategory);
        recipes = await this.recipeService.getRecipesByCategory(normalizedCategory);
      } else {
        console.log('🎭 Facade: Récupération de toutes les recettes');
        recipes = await this.recipeService.getAllRecipes(limit, offset);
      }

      // S'assurer que recipes est un tableau
      if (!Array.isArray(recipes)) {
        console.warn('🎭 Facade: résultat n\'est pas un tableau:', recipes);
        recipes = [];
      }

      console.log('🎭 Facade: Recettes récupérées depuis Supabase:', recipes.length);

      // Trier si nécessaire
      if (sortBy && recipes.length > 0) {
        recipes = this.sortRecipes(recipes, sortBy, order);
        console.log('🎭 Facade: Recettes triées par:', sortBy);
      }

      return {
        data: recipes,
        total: recipes.length,
        success: true
      };
    } catch (error) {
      console.error('❌ Facade: Erreur getAllRecipes:', error);
      
      // En cas d'erreur, retourner un tableau vide avec le message d'erreur
      return {
        data: [],
        total: 0,
        success: false,
        error: error.message
      };
    }
  }

  // Récupérer une recette spécifique par ID
  async getRecipeById(id) {
    try {
      console.log('🎭 Facade: getRecipeById:', id);
      const recipe = await this.recipeAdapter.getRecipeById(id);
      console.log('🎭 Facade: Recette récupérée:', recipe?.title);
      return recipe;
    } catch (error) {
      console.error('❌ Facade: Erreur getRecipeById:', error);
      throw error;
    }
  }

  // Rechercher des recettes
  async searchRecipes(searchTerm, options = {}) {
    try {
      console.log('🎭 Facade: searchRecipes:', searchTerm);
      const { category } = options;
      const normalizedCategory = category && category !== 'all' ? this.normalizeCategoryName(category) : null;
      
      const recipes = await this.recipeAdapter.searchRecipes(searchTerm, normalizedCategory);
      
      return {
        data: recipes || [],
        total: recipes?.length || 0,
        success: true
      };
    } catch (error) {
      console.error('❌ Facade: Erreur searchRecipes:', error);
      return {
        data: [],
        total: 0,
        success: false,
        error: error.message
      };
    }
  }

  // Normaliser les noms de catégories pour correspondre à la BDD
  normalizeCategoryName(category) {
    const categoryMap = {
      'patisserie': 'Pâtisseries',
      'patisseries': 'Pâtisseries',
      'Patisserie': 'Pâtisseries',
      'chocolat': 'Chocolats',
      'chocolats': 'Chocolats',
      'Chocolat': 'Chocolats',
      'glace': 'Glaces',
      'glaces': 'Glaces',
      'Glace': 'Glaces',
      'confiserie': 'Confiseries',
      'confiseries': 'Confiseries',
      'Confiserie': 'Confiseries'
    };
    
    return categoryMap[category] || category;
  }

  // ✅ NOUVELLE MÉTHODE POUR CRÉER UNE RECETTE COMPLÈTE
  async createCompleteRecipe(recipeData) {
    try {
      console.log('🎭 Facade: createCompleteRecipe - Données reçues:', recipeData);
      
      // Validation des données obligatoires
      if (!recipeData.title || !recipeData.title.trim()) {
        throw new Error('Le titre est obligatoire');
      }
      
      if (!recipeData.description || !recipeData.description.trim()) {
        throw new Error('La description est obligatoire');
      }
      
      if (!recipeData.categoryId) {
        throw new Error(`La catégorie est obligatoire (reçu: "${recipeData.categoryId}")`);
      }
      
      if (!recipeData.userId) {
        throw new Error(`L'utilisateur est obligatoire (reçu: "${recipeData.userId}")`);
      }
      
      // Debug avant appel SQL
      console.log('🎭 Facade: Paramètres pour create_complete_recipe:');
      console.log('- recipe_title:', recipeData.title);
      console.log('- recipe_category_id:', recipeData.categoryId);
      console.log('- recipe_user_id:', recipeData.userId);
      console.log('- recipe_ingredients:', recipeData.ingredients);
      console.log('- recipe_steps:', recipeData.steps);
      
      // ✅ VÉRIFICATION FINALE AVANT APPEL SQL
      if (!recipeData.categoryId) {
        throw new Error(`CategoryId est null/undefined dans recipeData: ${JSON.stringify(recipeData)}`);
      }
      
      console.log('🧪 TENTATIVE 1: Fonction SQL create_complete_recipe...');
      
      try {
        // Appel direct à la fonction SQL via l'adapter
        const { data, error } = await this.recipeAdapter.client
          .rpc('create_complete_recipe', {
            recipe_title: recipeData.title,
            recipe_description: recipeData.description,
            recipe_ingredients: recipeData.ingredients,
            recipe_steps: recipeData.steps,
            recipe_category_id: recipeData.categoryId,
            recipe_user_id: recipeData.userId,
            recipe_image_url: recipeData.imageUrl || '/assets/images/placeholder.jpg',
            recipe_prep_time: recipeData.preparationTime,
            recipe_cook_time: recipeData.cookingTime,
            recipe_difficulty: recipeData.difficulty || 'moyen',
            recipe_servings: recipeData.servings,
            recipe_equipment: recipeData.equipment || [],
            recipe_tips: recipeData.tips || null,
            recipe_storage: recipeData.storageInstructions || null,
            recipe_allergens: recipeData.allergens || [],
            recipe_nutrition: recipeData.nutritionInfo || null,
            recipe_video_url: recipeData.videoUrl || null,
            recipe_source: recipeData.source || null,
            recipe_yield: recipeData.yieldInfo || null
          });
        
        if (error) {
          console.error('❌ Facade: Erreur SQL create_complete_recipe:', error);
          throw new Error(`Erreur fonction SQL: ${error.message}`);
        }
        
        console.log('✅ Facade: Recette créée avec succès via fonction SQL:', data);
        return data?.[0] || data;
        
      } catch (sqlError) {
        console.error('❌ Fonction SQL échouée, tentative insertion directe...', sqlError);
        
        console.log('🧪 TENTATIVE 2: Insertion directe dans la table...');
        
        // Fallback : insertion directe dans la table recipes
        const insertData = {
          title: recipeData.title,
          description: recipeData.description,
          ingredients: recipeData.ingredients,
          steps: recipeData.steps,
          category_id: recipeData.categoryId,
          user_id: recipeData.userId,
          image_url: recipeData.imageUrl || '/assets/images/placeholder.jpg',
          preparation_time: recipeData.preparationTime || null,
          cooking_time: recipeData.cookingTime || null,
          difficulty: recipeData.difficulty || 'moyen',
          servings: recipeData.servings || 4,
          equipment: recipeData.equipment || [],
          tips: recipeData.tips || null,
          storage_instructions: recipeData.storageInstructions || null,
          allergens: recipeData.allergens || [],
          nutrition_info: recipeData.nutritionInfo || null,
          video_url: recipeData.videoUrl || null,
          source: recipeData.source || null,
          yield_info: recipeData.yieldInfo || null
        };
        
        console.log('🎭 Facade: Données pour insertion directe:', insertData);
        
        const { data: insertResult, error: insertError } = await this.recipeAdapter.client
          .from('recipes')
          .insert(insertData)
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ Facade: Erreur insertion directe:', insertError);
          throw new Error(`Erreur insertion directe: ${insertError.message}`);
        }
        
        console.log('✅ Facade: Recette créée avec succès via insertion directe:', insertResult);
        return insertResult;
      }
      
    } catch (error) {
      console.error('❌ Facade: Erreur createCompleteRecipe:', error);
      throw error;
    }
  }

  // ✅ MÉTHODE DE COMPATIBILITÉ POUR L'ANCIEN CODE
  async createRecipe(recipeData, authorId) {
    console.log('🎭 Facade: createRecipe (ancienne méthode) - redirection vers createCompleteRecipe');
    
    // Si authorId est fourni, l'utiliser, sinon utiliser celui dans recipeData
    const finalRecipeData = {
      ...recipeData,
      userId: authorId || recipeData.userId
    };
    
    return this.createCompleteRecipe(finalRecipeData);
  }

  async rateRecipe(recipeId, userId, ratingData) {
    try {
      console.log('🎭 Facade: Notation recette:', recipeId, 'par user:', userId);
      
      // Utiliser la fonction SQL directe via l'adapter
      const result = await this.recipeAdapter.rateRecipe(recipeId, userId, ratingData);
      
      console.log('✅ Facade: Recette notée avec succès');
      return result;
    } catch (error) {
      console.error('❌ Facade: Erreur rateRecipe:', error);
      throw error;
    }
  }

  // Obtenir les statistiques d'une recette
  async getRecipeStats(recipeId) {
    try {
      console.log('🎭 Facade: getRecipeStats pour:', recipeId);
      const stats = await this.recipeAdapter.getRecipeStats(recipeId);
      return stats;
    } catch (error) {
      console.error('❌ Facade: Erreur getRecipeStats:', error);
      throw error;
    }
  }

  // Obtenir la note d'un utilisateur pour une recette
  async getUserRating(recipeId, userId) {
    try {
      console.log('🎭 Facade: getUserRating pour recette:', recipeId, 'user:', userId);
      const { data, error } = await this.recipeAdapter.client
        .rpc('get_user_rating_for_recipe', {
          recipe_uuid: recipeId,
          user_uuid: userId
        });

      if (error) {
        throw new Error(`Erreur récupération note: ${error.message}`);
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('❌ Facade: Erreur getUserRating:', error);
      throw error;
    }
  }

  // ✅ MÉTHODE POUR OBTENIR LES CATÉGORIES (CORRIGÉE)
  async getCategories() {
    try {
      console.log('🎭 Facade: getCategories');
      
      // Utiliser la méthode de l'adapter au lieu d'un appel direct
      const categories = await this.recipeAdapter.getCategories();
      
      console.log('✅ Facade: Catégories récupérées via adapter:', categories);
      return categories || [];
      
    } catch (error) {
      console.error('❌ Facade: Erreur getCategories:', error);
      throw error;
    }
  }

  // Alias pour compatibilité avec l'ancien code
  async getAllCategories() {
    return this.getCategories();
  }

  sortRecipes(recipes, sortBy, order = 'desc') {
    const sorted = [...recipes].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'created_at':
        case 'newest':
          valueA = new Date(a.createdAt || a.created_at);
          valueB = new Date(b.createdAt || b.created_at);
          break;
        case 'rating':
        case 'highest':
          valueA = a.averageRating || a.average_gavels || 0;
          valueB = b.averageRating || b.average_gavels || 0;
          break;
        case 'title':
          valueA = a.title?.toLowerCase() || '';
          valueB = b.title?.toLowerCase() || '';
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }

  // Test de connexion
  async testConnection() {
    try {
      console.log('🎭 Facade: Test de connexion Supabase...');
      const result = await this.recipeAdapter.testConnection();
      console.log('🎭 Facade: Résultat test connexion:', result);
      return result;
    } catch (error) {
      console.error('❌ Facade: Erreur test connexion:', error);
      return { success: false, error: error.message };
    }
  }

  // Vérifier le statut de la base de données
  async getDatabaseStatus() {
    try {
      const connectionTest = await this.testConnection();
      
      if (!connectionTest.success) {
        return {
          status: 'error',
          message: 'Impossible de se connecter à la base de données',
          error: connectionTest.error
        };
      }

      // Tester en récupérant une recette
      const recipesTest = await this.getAllRecipes({ limit: 1 });
      
      if (!recipesTest.success) {
        return {
          status: 'warning',
          message: 'Connexion établie mais erreur lors de la récupération des données',
          error: recipesTest.error
        };
      }

      if (recipesTest.total === 0) {
        return {
          status: 'empty',
          message: 'Base de données vide - Aucune recette trouvée',
          suggestion: 'Ajoutez des recettes via le SQL fourni dans la documentation'
        };
      }

      return {
        status: 'success',
        message: `Base de données opérationnelle - ${recipesTest.total} recette(s) disponible(s)`,
        recipesCount: recipesTest.total
      };
    } catch (error) {
      console.error('❌ Facade: Erreur getDatabaseStatus:', error);
      return {
        status: 'error',
        message: 'Erreur lors de la vérification du statut',
        error: error.message
      };
    }
  }
}

export const recipeFacade = new RecipeFacade();