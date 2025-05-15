export class IRecipeRepository {
    async getAllRecipes(filters) {
      throw new Error('Method not implemented');
    }
  
    async getRecipeById(id) {
      throw new Error('Method not implemented');
    }
  
    async createRecipe(recipeData, userId) {
      throw new Error('Method not implemented');
    }
  
    async updateRecipe(id, recipeData, userId) {
      throw new Error('Method not implemented');
    }
  
    async deleteRecipe(id, userId) {
      throw new Error('Method not implemented');
    }
  
    async rateRecipe(recipeId, userId, rating) {
      throw new Error('Method not implemented');
    }
  
    async getRecipeRatings(recipeId) {
      throw new Error('Method not implemented');
    }
  }
  