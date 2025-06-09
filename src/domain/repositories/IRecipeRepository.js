// src/domain/repositories/IRecipeRepository.js
export class IRecipeRepository {
  async findAll(limit, offset) {
    throw new Error('Method not implemented');
  }
  
  async getAllRecipes(limit, offset) {
    // Alias pour findAll - pour compatibilité
    return this.findAll(limit, offset);
  }
  
  async findByCategory(category) {
    throw new Error('Method not implemented');
  }
  
  async findById(id) {
    throw new Error('Method not implemented');
  }
  
  async create(recipe, authorId) {
    throw new Error('Method not implemented');
  }
  
  async update(id, recipe) {
    throw new Error('Method not implemented');
  }
  
  async delete(id) {
    throw new Error('Method not implemented');
  }
  
  async search(query) {
    throw new Error('Method not implemented');
  }
}
