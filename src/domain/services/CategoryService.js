// src/domain/services/CategoryService.js
export class CategoryService {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async getAllCategories() {
    try {
      return await this.categoryRepository.findAll();
    } catch (error) {
      console.error('Erreur service getAllCategories:', error);
      throw new Error('Impossible de récupérer les catégories');
    }
  }

  async getCategoryBySlug(slug) {
    try {
      if (!slug) {
        throw new Error('Slug de catégorie requis');
      }
      return await this.categoryRepository.findBySlug(slug);
    } catch (error) {
      console.error('Erreur service getCategoryBySlug:', error);
      throw new Error('Catégorie non trouvée');
    }
  }

  async getCategoryByName(name) {
    try {
      if (!name) {
        throw new Error('Nom de catégorie requis');
      }
      return await this.categoryRepository.findByName(name);
    } catch (error) {
      console.error('Erreur service getCategoryByName:', error);
      throw new Error('Catégorie non trouvée');
    }
  }

  async createCategory(categoryData) {
    try {
      if (!categoryData.name) {
        throw new Error('Nom de catégorie requis');
      }
      return await this.categoryRepository.create(categoryData);
    } catch (error) {
      console.error('Erreur service createCategory:', error);
      throw error;
    }
  }

  // Méthode utilitaire pour obtenir les catégories par défaut
  getDefaultCategories() {
    return [
      { id: 'default-1', name: 'Pâtisseries', slug: 'patisseries', description: 'Gâteaux, tartes et délices sucrés' },
      { id: 'default-2', name: 'Chocolats', slug: 'chocolats', description: 'Créations chocolatées gourmandes' },
      { id: 'default-3', name: 'Glaces', slug: 'glaces', description: 'Desserts glacés rafraîchissants' },
      { id: 'default-4', name: 'Confiseries', slug: 'confiseries', description: 'Bonbons et friandises' }
    ];
  }
}
