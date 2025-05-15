import { Recipe } from '../entities/Recipe';

export class RecipeService {
  constructor(recipeRepository) {
    this.recipeRepository = recipeRepository;
  }

  async getAllRecipes(filters = {}) {
    const result = await this.recipeRepository.getAllRecipes(filters);
    return {
      ...result,
      data: result.data.map(recipe => new Recipe(recipe))
    };
  }

  async getRecipeById(id) {
    const recipe = await this.recipeRepository.getRecipeById(id);
    return new Recipe(recipe);
  }

  async createRecipe(recipeData, userId) {
    const recipe = await this.recipeRepository.createRecipe(recipeData, userId);
    return new Recipe(recipe);
  }

  async updateRecipe(id, recipeData, userId) {
    const recipe = await this.recipeRepository.updateRecipe(id, recipeData, userId);
    return new Recipe(recipe);
  }

  async deleteRecipe(id, userId) {
    return await this.recipeRepository.deleteRecipe(id, userId);
  }

  async rateRecipe(recipeId, userId, rating) {
    return await this.recipeRepository.rateRecipe(recipeId, userId, rating);
  }

  async getRecipeRatings(recipeId) {
    return await this.recipeRepository.getRecipeRatings(recipeId);
  }
}
