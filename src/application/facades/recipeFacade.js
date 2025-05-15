import { diProvider } from '../providers/DIProvider';

export const recipeFacade = {
  async getAllRecipes(filters = {}) {
    const recipeService = diProvider.get('recipeService');
    return await recipeService.getAllRecipes(filters);
  },

  async getRecipeById(id) {
    const recipeService = diProvider.get('recipeService');
    return await recipeService.getRecipeById(id);
  },

  async createRecipe(recipeData, userId) {
    const recipeService = diProvider.get('recipeService');
    return await recipeService.createRecipe(recipeData, userId);
  },

  async updateRecipe(id, recipeData, userId) {
    const recipeService = diProvider.get('recipeService');
    return await recipeService.updateRecipe(id, recipeData, userId);
  },

  async deleteRecipe(id, userId) {
    const recipeService = diProvider.get('recipeService');
    return await recipeService.deleteRecipe(id, userId);
  },

  async rateRecipe(recipeId, userId, rating) {
    const recipeService = diProvider.get('recipeService');
    return await recipeService.rateRecipe(recipeId, userId, rating);
  },

  async getRecipeRatings(recipeId) {
    const recipeService = diProvider.get('recipeService');
    return await recipeService.getRecipeRatings(recipeId);
  },

  async getAllCategories() {
    const categoryAdapter = diProvider.get('categoryAdapter');
    return await categoryAdapter.getAllCategories();
  }
};
