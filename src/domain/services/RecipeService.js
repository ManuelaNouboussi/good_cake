// src/domain/services/RecipeService.js
export class RecipeService {
  constructor(recipeAdapter) {
    this.recipeAdapter = recipeAdapter;
    console.log('🎯 RecipeService: Initialisé');
  }

  async getAllRecipes(limit = 50, offset = 0) {
    try {
      console.log('🎯 Service: getAllRecipes avec limit:', limit, 'offset:', offset);
      const recipes = await this.recipeAdapter.getAllRecipes(limit, offset);
      console.log('🎯 Service: Recettes récupérées:', recipes?.length || 0);
      return recipes || [];
    } catch (error) {
      console.error('❌ Service: Erreur getAllRecipes:', error);
      throw error;
    }
  }

  async getRecipesByCategory(categoryName) {
    try {
      console.log('🎯 Service: getRecipesByCategory:', categoryName);
      const recipes = await this.recipeAdapter.getRecipesByCategory(categoryName);
      console.log('🎯 Service: Recettes par catégorie récupérées:', recipes?.length || 0);
      return recipes || [];
    } catch (error) {
      console.error('❌ Service: Erreur getRecipesByCategory:', error);
      throw error;
    }
  }

  async getRecipeById(id) {
    try {
      console.log('🎯 Service: getRecipeById:', id);
      const recipe = await this.recipeAdapter.getRecipeById(id);
      console.log('🎯 Service: Recette récupérée:', recipe?.title);
      return recipe;
    } catch (error) {
      console.error('❌ Service: Erreur getRecipeById:', error);
      throw error;
    }
  }

  async createRecipe(recipeData, userId) {
    try {
      console.log('🎯 Service: createRecipe pour user:', userId);
      console.log('🎯 Service: Données recette:', recipeData);
      
      // DEBUG : Afficher les données reçues
      console.log('🔍 Service: Données reçues pour validation:', {
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
        categoryId: recipeData.categoryId,
        userId: userId
      });

      // Validation des données obligatoires avec messages détaillés
      if (!recipeData.title?.trim()) {
        throw new Error('Le titre est obligatoire (reçu: "' + recipeData.title + '")');
      }

      if (!recipeData.description?.trim()) {
        throw new Error('La description est obligatoire (reçu: "' + recipeData.description + '")');
      }

      if (!recipeData.ingredients || !Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
        throw new Error('Au moins un ingrédient est obligatoire (reçu: ' + JSON.stringify(recipeData.ingredients) + ')');
      }

      if (!recipeData.steps || !Array.isArray(recipeData.steps) || recipeData.steps.length === 0) {
        throw new Error('Au moins une étape est obligatoire (reçu: ' + JSON.stringify(recipeData.steps) + ')');
      }

      if (!recipeData.categoryId) {
        throw new Error('La catégorie est obligatoire (reçu: "' + recipeData.categoryId + '")');
      }

      if (!userId) {
        throw new Error('L\'utilisateur doit être authentifié (reçu: "' + userId + '")');
      }

      // Préparer les données avec l'ID utilisateur
      const enrichedRecipeData = {
        ...recipeData,
        userId: userId
      };

      // Créer la recette via l'adapter
      const result = await this.recipeAdapter.createRecipe(enrichedRecipeData);
      
      console.log('✅ Service: Recette créée avec succès:', result?.id);
      return result;
    } catch (error) {
      console.error('❌ Service: Erreur createRecipe:', error);
      throw error;
    }
  }

  async searchRecipes(searchTerm, categoryName = null) {
    try {
      console.log('🎯 Service: searchRecipes:', searchTerm, 'catégorie:', categoryName);
      const recipes = await this.recipeAdapter.searchRecipes(searchTerm, categoryName);
      console.log('🎯 Service: Résultats recherche:', recipes?.length || 0);
      return recipes || [];
    } catch (error) {
      console.error('❌ Service: Erreur searchRecipes:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      console.log('🎯 Service: getCategories');
      const categories = await this.recipeAdapter.getCategories();
      console.log('🎯 Service: Catégories récupérées:', categories?.length || 0);
      return categories || [];
    } catch (error) {
      console.error('❌ Service: Erreur getCategories:', error);
      throw error;
    }
  }

  async rateRecipe(recipeId, userId, ratingData) {
    try {
      console.log('🎯 Service: rateRecipe:', recipeId, 'par user:', userId);
      
      if (!recipeId || !userId) {
        throw new Error('L\'ID de la recette et l\'utilisateur sont obligatoires');
      }

      if (!ratingData.gavels || ratingData.gavels < 1 || ratingData.gavels > 5) {
        throw new Error('La notation doit être entre 1 et 5 marteaux');
      }

      const result = await this.recipeAdapter.rateRecipe(recipeId, userId, ratingData);
      console.log('✅ Service: Notation enregistrée');
      return result;
    } catch (error) {
      console.error('❌ Service: Erreur rateRecipe:', error);
      throw error;
    }
  }

  async getRecipeStats(recipeId) {
    try {
      console.log('🎯 Service: getRecipeStats:', recipeId);
      const stats = await this.recipeAdapter.getRecipeStats(recipeId);
      return stats;
    } catch (error) {
      console.error('❌ Service: Erreur getRecipeStats:', error);
      throw error;
    }
  }

  // Méthodes utilitaires
  formatRecipeForDisplay(recipe) {
    if (!recipe) return null;

    return {
      ...recipe,
      formattedPrepTime: this.formatTime(recipe.preparation_time || recipe.prepTime),
      formattedCookTime: this.formatTime(recipe.cooking_time || recipe.cookTime),
      formattedTotalTime: this.formatTime(
        (recipe.preparation_time || recipe.prepTime || 0) + 
        (recipe.cooking_time || recipe.cookTime || 0)
      ),
      formattedServings: this.formatServings(recipe.servings),
      formattedRating: this.formatRating(recipe.average_gavels || recipe.averageRating),
      difficultyIcon: this.getDifficultyIcon(recipe.difficulty)
    };
  }

  formatTime(minutes) {
    if (!minutes || minutes === 0) return '0 min';
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }

  formatServings(servings) {
    if (!servings) return '';
    return `${servings} portion${servings > 1 ? 's' : ''}`;
  }

  formatRating(rating) {
    if (!rating || rating === 0) return 'Non noté';
    return `${rating}/5 🔨`;
  }

  getDifficultyIcon(difficulty) {
    switch (difficulty?.toLowerCase()) {
      case 'facile':
        return '🟢';
      case 'moyen':
        return '🟡';
      case 'difficile':
        return '🔴';
      default:
        return '⚪';
    }
  }

  // Validation des données de recette
  validateRecipeData(recipeData) {
    const errors = [];

    if (!recipeData.title?.trim()) {
      errors.push('Le titre est obligatoire');
    }

    if (!recipeData.description?.trim()) {
      errors.push('La description est obligatoire');
    }

    if (!recipeData.categoryId) {
      errors.push('La catégorie est obligatoire');
    }

    if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
      errors.push('Au moins un ingrédient est obligatoire');
    }

    if (!recipeData.steps || recipeData.steps.length === 0) {
      errors.push('Au moins une étape est obligatoire');
    }

    if (recipeData.preparationTime && recipeData.preparationTime <= 0) {
      errors.push('Le temps de préparation doit être positif');
    }

    if (recipeData.cookingTime && recipeData.cookingTime < 0) {
      errors.push('Le temps de cuisson doit être positif ou zéro');
    }

    if (recipeData.servings && recipeData.servings <= 0) {
      errors.push('Le nombre de portions doit être positif');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}