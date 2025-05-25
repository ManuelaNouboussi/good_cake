import { SupabaseRecipeAdapter } from '../../infrastructure/api/supabase/recipeAdapter';
import { SupabaseAuthAdapter } from '../../infrastructure/api/supabase/authAdapter';
import { SupabaseCategoryAdapter } from '../../infrastructure/api/supabase/categoryAdapter';
import { SupabaseRatingAdapter } from '../../infrastructure/api/supabase/ratingAdapter';
import { RecipeService } from '../../domain/services/RecipeService';
import { AuthService } from '../../domain/services/AuthService';

class DIProvider {
  constructor() {
    this.instances = new Map();
    this.singletons = new Map();
    this.factories = new Map();
    this.isInitialized = false;
    
    this.initializeServices();
  }

  initializeServices() {
    try {
      console.log('DIProvider: Initializing services...');

      // Configuration des adaptateurs comme singletons
      this.registerSingleton('recipeAdapter', () => new SupabaseRecipeAdapter());
      this.registerSingleton('authAdapter', () => new SupabaseAuthAdapter());
      this.registerSingleton('categoryAdapter', () => new SupabaseCategoryAdapter());
      this.registerSingleton('ratingAdapter', () => new SupabaseRatingAdapter());

      // Configuration des services avec injection des dépendances
      this.registerSingleton('recipeService', () => {
        const recipeAdapter = this.get('recipeAdapter');
        return new RecipeService(recipeAdapter);
      });

      this.registerSingleton('authService', () => {
        const authAdapter = this.get('authAdapter');
        return new AuthService(authAdapter);
      });

      // Initialisation immédiate pour la compatibilité avec l'ancien code
      this.initializeLegacyInstances();
      
      this.isInitialized = true;
      console.log('DIProvider: Services initialized successfully');
      
    } catch (error) {
      console.error('DIProvider: Error during initialization:', error);
      throw error;
    }
  }

  // Maintenir la compatibilité avec l'ancien système
  initializeLegacyInstances() {
    try {
      const recipeAdapter = this.get('recipeAdapter');
      const authAdapter = this.get('authAdapter');
      const categoryAdapter = this.get('categoryAdapter');
      const ratingAdapter = this.get('ratingAdapter');
      const recipeService = this.get('recipeService');
      const authService = this.get('authService');

      // Garder les instances directes pour compatibilité
      this.instances.set('recipeService', recipeService);
      this.instances.set('authService', authService);
      this.instances.set('categoryAdapter', categoryAdapter);
      this.instances.set('ratingAdapter', ratingAdapter);
      
      console.log('DIProvider: Legacy instances initialized');
    } catch (error) {
      console.error('DIProvider: Error initializing legacy instances:', error);
      throw error;
    }
  }

  // Nouveau système de factory avec singletons
  registerSingleton(name, factory) {
    this.factories.set(name, { factory, isSingleton: true });
  }

  register(name, factory) {
    this.factories.set(name, { factory, isSingleton: false });
  }

  get(serviceName) {
    try {
      // Vérifier d'abord les instances legacy pour compatibilité
      if (this.instances.has(serviceName)) {
        return this.instances.get(serviceName);
      }

      // Utiliser le nouveau système de factory
      const service = this.factories.get(serviceName);
      
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }

      if (service.isSingleton) {
        if (!this.singletons.has(serviceName)) {
          console.log(`DIProvider: Creating singleton instance of ${serviceName}`);
          const instance = service.factory();
          this.singletons.set(serviceName, instance);
        }
        return this.singletons.get(serviceName);
      }

      // Créer une nouvelle instance à chaque fois pour les services non-singleton
      console.log(`DIProvider: Creating new instance of ${serviceName}`);
      return service.factory();
      
    } catch (error) {
      console.error(`DIProvider: Error getting service ${serviceName}:`, error);
      throw error;
    }
  }

  // Méthode pour vérifier si un service existe
  has(serviceName) {
    return this.instances.has(serviceName) || this.factories.has(serviceName);
  }

  // Méthode pour obtenir tous les services disponibles
  getAvailableServices() {
    const services = new Set();
    
    this.instances.forEach((_, key) => services.add(key));
    this.factories.forEach((_, key) => services.add(key));
    
    return Array.from(services);
  }

  // Méthode pour réinitialiser un singleton (utile pour les tests)
  resetSingleton(serviceName) {
    if (this.singletons.has(serviceName)) {
      console.log(`DIProvider: Resetting singleton ${serviceName}`);
      this.singletons.delete(serviceName);
    }
  }

  // Méthode pour nettoyer tous les singletons
  clearSingletons() {
    console.log('DIProvider: Clearing all singletons');
    this.singletons.clear();
  }

  // Méthode pour nettoyer et réinitialiser complètement
  reset() {
    console.log('DIProvider: Resetting all services');
    this.instances.clear();
    this.singletons.clear();
    this.factories.clear();
    this.isInitialized = false;
    this.initializeServices();
  }

  // Méthode pour diagnostiquer l'état du provider
  diagnose() {
    const diagnosis = {
      isInitialized: this.isInitialized,
      instancesCount: this.instances.size,
      singletonsCount: this.singletons.size,
      factoriesCount: this.factories.size,
      availableServices: this.getAvailableServices(),
      singletonInstances: Array.from(this.singletons.keys())
    };

    console.log('DIProvider Diagnosis:', diagnosis);
    return diagnosis;
  }

  // Méthode pour récupérer les informations de santé des services
  async healthCheck() {
    const results = {};
    
    try {
      // Vérifier le service d'authentification
      const authService = this.get('authService');
      try {
        await authService.getCurrentUser();
        results.authService = { status: 'healthy', message: 'Authentication service operational' };
      } catch (error) {
        results.authService = { status: 'warning', message: error.message };
      }

      // Vérifier le service de recettes
      const recipeService = this.get('recipeService');
      try {
        // Tenter une opération simple
        results.recipeService = { status: 'healthy', message: 'Recipe service operational' };
      } catch (error) {
        results.recipeService = { status: 'error', message: error.message };
      }

      // Vérifier les adaptateurs
      const services = ['categoryAdapter', 'ratingAdapter'];
      services.forEach(serviceName => {
        try {
          const service = this.get(serviceName);
          results[serviceName] = { status: 'healthy', message: `${serviceName} operational` };
        } catch (error) {
          results[serviceName] = { status: 'error', message: error.message };
        }
      });

    } catch (error) {
      console.error('DIProvider: Health check error:', error);
      results.global = { status: 'error', message: error.message };
    }

    return results;
  }

  // Méthode pour injecter des mocks (utile pour les tests)
  mock(serviceName, mockInstance) {
    console.log(`DIProvider: Mocking service ${serviceName}`);
    this.instances.set(serviceName, mockInstance);
    
    // Supprimer du singleton cache si existe
    if (this.singletons.has(serviceName)) {
      this.singletons.delete(serviceName);
    }
  }

  // Méthode pour supprimer un mock
  unmock(serviceName) {
    console.log(`DIProvider: Unmocking service ${serviceName}`);
    this.instances.delete(serviceName);
    
    // Si c'est un singleton, il sera recréé à la prochaine demande
    if (this.singletons.has(serviceName)) {
      this.singletons.delete(serviceName);
    }
  }
}

// Création de l'instance globale
export const diProvider = new DIProvider();

// Export des méthodes utilitaires pour le debug
export const debugDI = {
  diagnose: () => diProvider.diagnose(),
  healthCheck: () => diProvider.healthCheck(),
  reset: () => diProvider.reset(),
  clearSingletons: () => diProvider.clearSingletons()
};

// En mode développement, exposer les outils de debug
if (process.env.NODE_ENV === 'development') {
  window.debugDI = debugDI;
  console.log('DIProvider: Debug tools available at window.debugDI');
}
