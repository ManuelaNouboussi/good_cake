import { SupabaseRecipeAdapter } from '../../infrastructure/api/supabase/recipeAdapter';
import { SupabaseAuthAdapter } from '../../infrastructure/api/supabase/authAdapter';
import { SupabaseCategoryAdapter } from '../../infrastructure/api/supabase/categoryAdapter';
import { SupabaseRatingAdapter } from '../../infrastructure/api/supabase/ratingAdapter';
import { RecipeService } from '../../domain/services/RecipeService';
import { AuthService } from '../../domain/services/AuthService';

class DIProvider {
  constructor() {
    this.instances = new Map();
    this.initializeServices();
  }

  initializeServices() {
    const recipeAdapter = new SupabaseRecipeAdapter();
    const authAdapter = new SupabaseAuthAdapter();
    const categoryAdapter = new SupabaseCategoryAdapter();
    const ratingAdapter = new SupabaseRatingAdapter();

    this.instances.set('recipeService', new RecipeService(recipeAdapter));
    this.instances.set('authService', new AuthService(authAdapter));
    this.instances.set('categoryAdapter', categoryAdapter);
    this.instances.set('ratingAdapter', ratingAdapter);
  }

  get(serviceName) {
    if (!this.instances.has(serviceName)) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return this.instances.get(serviceName);
  }
}

export const diProvider = new DIProvider();
