import { diProvider } from '../providers/DIProvider';

export const authFacade = {
  // Cache pour éviter les appels répétés
  _cachedUser: null,
  _isInitialized: false,
  _initPromise: null,

  // Initialisation paresseuse
  async _ensureInitialized() {
    if (this._isInitialized) return;
    
    if (!this._initPromise) {
      this._initPromise = this._initialize();
    }
    
    await this._initPromise;
  },

  async _initialize() {
    try {
      const authService = diProvider.get('authService');
      this._cachedUser = await authService.getCurrentUser();
      this._isInitialized = true;
    } catch (error) {
      console.error('Auth facade initialization error:', error);
      this._isInitialized = true;
      this._cachedUser = null;
    }
  },

  // Validation des données d'entrée
  _validateSignUpData({ email, password, username }) {
    const errors = [];
    
    if (!email || !email.trim()) {
      errors.push('L\'email est requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Format d\'email invalide');
    }
    
    if (!password) {
      errors.push('Le mot de passe est requis');
    } else if (password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    if (!username || !username.trim()) {
      errors.push('Le nom d\'utilisateur est requis');
    } else if (username.trim().length < 3) {
      errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  },

  _validateSignInData({ email, password }) {
    const errors = [];
    
    if (!email || !email.trim()) {
      errors.push('L\'email est requis');
    }
    
    if (!password) {
      errors.push('Le mot de passe est requis');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  },

  async signUp({ email, password, username }) {
    try {
      // Validation des données
      this._validateSignUpData({ email, password, username });
      
      // Nettoyage des données
      const cleanData = {
        email: email.trim().toLowerCase(),
        password,
        username: username.trim()
      };

      const authService = diProvider.get('authService');
      const user = await authService.signUp(cleanData);
      
      // Mise à jour du cache
      this._cachedUser = user;
      
      return user;
    } catch (error) {
      console.error('SignUp error in facade:', error);
      
      // Formatage des erreurs pour l'utilisateur
      if (error.message.includes('User already registered')) {
        throw new Error('Un compte existe déjà avec cet email');
      } else if (error.message.includes('Invalid email')) {
        throw new Error('Format d\'email invalide');
      } else if (error.message.includes('Password should be at least 6 characters')) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      
      throw error;
    }
  },

  async signIn({ email, password }) {
    try {
      // Validation des données
      this._validateSignInData({ email, password });
      
      // Nettoyage des données
      const cleanData = {
        email: email.trim().toLowerCase(),
        password
      };

      const authService = diProvider.get('authService');
      const user = await authService.signIn(cleanData);
      
      // Mise à jour du cache
      this._cachedUser = user;
      
      return user;
    } catch (error) {
      console.error('SignIn error in facade:', error);
      
      // Formatage des erreurs pour l'utilisateur
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email ou mot de passe incorrect');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Veuillez confirmer votre email avant de vous connecter');
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Trop de tentatives. Veuillez patienter avant de réessayer');
      }
      
      throw error;
    }
  },

  async signOut() {
    try {
      const authService = diProvider.get('authService');
      const result = await authService.signOut();
      
      // Nettoyer le cache
      this._cachedUser = null;
      
      return result;
    } catch (error) {
      console.error('SignOut error in facade:', error);
      
      // Nettoyer le cache même en cas d'erreur
      this._cachedUser = null;
      
      throw new Error('Erreur lors de la déconnexion');
    }
  },

  async getCurrentUser() {
    try {
      await this._ensureInitialized();
      
      // Retourner le cache s'il est disponible
      if (this._cachedUser) {
        return this._cachedUser;
      }
      
      const authService = diProvider.get('authService');
      const user = await authService.getCurrentUser();
      
      // Mettre à jour le cache
      this._cachedUser = user;
      
      return user;
    } catch (error) {
      console.error('GetCurrentUser error in facade:', error);
      this._cachedUser = null;
      return null;
    }
  },

  async refreshCurrentUser() {
    try {
      // Forcer le rechargement sans cache
      const authService = diProvider.get('authService');
      const user = await authService.getCurrentUser();
      
      // Mettre à jour le cache
      this._cachedUser = user;
      
      return user;
    } catch (error) {
      console.error('RefreshCurrentUser error in facade:', error);
      this._cachedUser = null;
      return null;
    }
  },

  onAuthStateChange(callback) {
    try {
      const authService = diProvider.get('authService');
      
      // Wrapper pour gérer le cache et les erreurs
      const wrappedCallback = (event, session, user) => {
        try {
          // Mettre à jour le cache selon l'événement
          switch (event) {
            case 'SIGNED_IN':
              this._cachedUser = user;
              break;
            case 'SIGNED_OUT':
              this._cachedUser = null;
              break;
            case 'TOKEN_REFRESHED':
              if (user) {
                this._cachedUser = user;
              }
              break;
          }
          
          // Appeler le callback original
          callback(event, session, user);
        } catch (error) {
          console.error('Auth state change callback error:', error);
          // Appeler le callback avec null en cas d'erreur
          callback(event, session, null);
        }
      };
      
      return authService.onAuthStateChange(wrappedCallback);
    } catch (error) {
      console.error('OnAuthStateChange error in facade:', error);
      
      // Retourner une fonction de nettoyage vide
      return () => {};
    }
  },

  // Méthodes utilitaires
  isAuthenticated() {
    return !!this._cachedUser;
  },

  getUserId() {
    return this._cachedUser?.id || null;
  },

  getUsername() {
    return this._cachedUser?.username || this._cachedUser?.user_metadata?.username || null;
  },

  getUserEmail() {
    return this._cachedUser?.email || null;
  },

  // Méthode pour vider le cache (utile pour les tests ou le debug)
  clearCache() {
    this._cachedUser = null;
    this._isInitialized = false;
    this._initPromise = null;
  },

  // Méthode pour vérifier l'état de la connexion
  async checkConnectionStatus() {
    try {
      const authService = diProvider.get('authService');
      
      // Essayer de récupérer l'utilisateur pour vérifier la connexion
      const user = await authService.getCurrentUser();
      return {
        isConnected: true,
        user
      };
    } catch (error) {
      console.error('Connection check error:', error);
      return {
        isConnected: false,
        error: error.message
      };
    }
  },

  // Méthode pour retry une opération avec backoff exponentiel
  async retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Ne pas retry pour certains types d'erreurs
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('User already registered')) {
          throw error;
        }
        
        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
};
