// src/domain/services/authService.js
export class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
    this.currentUser = null;
    this.authStateListeners = new Set();
    
    // Initialiser l'authentification
    this.initialize();
  }

  async initialize() {
    try {
      // Récupérer l'utilisateur courant au démarrage
      this.currentUser = await this.authRepository.getCurrentUser();
      
      // Configurer l'écoute des changements d'état
      this.setupAuthStateListener();
      
    } catch (error) {
      console.error('AuthService initialization error:', error);
      this.currentUser = null;
    }
  }

  setupAuthStateListener() {
    this.authRepository.onAuthStateChange((event, session, user) => {
      console.log('AuthService: Auth state changed:', event);
      
      // Mettre à jour l'utilisateur courant
      this.currentUser = user;
      
      // Notifier tous les listeners
      this.notifyAuthStateChange(event, session, user);
    });
  }

  notifyAuthStateChange(event, session, user) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(event, session, user);
      } catch (error) {
        console.error('Auth state listener error:', error);
      }
    });
  }

  async signUp({ email, password, username }) {
    try {
      console.log('AuthService: Starting signup for:', email);
      
      const user = await this.authRepository.signUp({
        email,
        password,
        username
      });

      // Mettre à jour l'utilisateur courant
      this.currentUser = user;
      
      console.log('AuthService: Signup successful:', user?.id);
      return user;
      
    } catch (error) {
      console.error('AuthService: Signup error:', error);
      throw this.handleAuthError(error);
    }
  }

  async signIn({ email, password }) {
    try {
      console.log('AuthService: Starting signin for:', email);
      
      const user = await this.authRepository.signIn({
        email,
        password
      });

      // Mettre à jour l'utilisateur courant
      this.currentUser = user;
      
      console.log('AuthService: Signin successful:', user?.id);
      return user;
      
    } catch (error) {
      console.error('AuthService: Signin error:', error);
      throw this.handleAuthError(error);
    }
  }

  async signOut() {
    try {
      console.log('AuthService: Starting signout');
      
      await this.authRepository.signOut();
      
      // Nettoyer l'utilisateur courant
      this.currentUser = null;
      
      console.log('AuthService: Signout successful');
      return true;
      
    } catch (error) {
      console.error('AuthService: Signout error:', error);
      
      // Nettoyer l'utilisateur même en cas d'erreur
      this.currentUser = null;
      
      throw this.handleAuthError(error);
    }
  }

  async getCurrentUser() {
    try {
      // Retourner l'utilisateur en cache s'il existe
      if (this.currentUser) {
        return this.currentUser;
      }

      console.log('AuthService: Fetching current user');
      
      const user = await this.authRepository.getCurrentUser();
      
      // Mettre à jour le cache
      this.currentUser = user;
      
      return user;
      
    } catch (error) {
      console.error('AuthService: Get current user error:', error);
      this.currentUser = null;
      return null;
    }
  }

  async refreshUser() {
    try {
      console.log('AuthService: Refreshing user data');
      
      const user = await this.authRepository.getCurrentUser();
      
      // Mettre à jour le cache
      this.currentUser = user;
      
      return user;
      
    } catch (error) {
      console.error('AuthService: Refresh user error:', error);
      this.currentUser = null;
      return null;
    }
  }

  onAuthStateChange(callback) {
    // Ajouter le callback à la liste des listeners
    this.authStateListeners.add(callback);
    
    // Retourner une fonction de nettoyage
    return () => {
      this.authStateListeners.delete(callback);
    };
  }

  // Méthodes utilitaires
  isAuthenticated() {
    return !!this.currentUser;
  }

  getUserId() {
    return this.currentUser?.id || null;
  }

  getUsername() {
    return this.currentUser?.username || 
           this.currentUser?.user_metadata?.username || 
           null;
  }

  getUserEmail() {
    return this.currentUser?.email || null;
  }

  getUserProfile() {
    return this.currentUser?.profile || null;
  }

  // Gestion des erreurs spécifique au domaine
  handleAuthError(error) {
    // Log détaillé pour le debug
    console.error('AuthService: Handling auth error:', {
      message: error.message,
      code: error.code,
      type: error.type || 'unknown'
    });

    // Mapper les erreurs techniques vers des messages utilisateur
    const errorMappings = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'User already registered': 'Un compte existe déjà avec cet email',
      'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'Invalid email': 'Format d\'email invalide',
      'Too many requests': 'Trop de tentatives. Veuillez patienter avant de réessayer',
      'Auth session missing': 'Session expirée. Veuillez vous reconnecter',
      'Network error': 'Erreur de connexion. Vérifiez votre connexion internet'
    };

    // Trouver le message approprié
    let userMessage = error.message;
    for (const [techMessage, userMsg] of Object.entries(errorMappings)) {
      if (error.message?.toLowerCase().includes(techMessage.toLowerCase())) {
        userMessage = userMsg;
        break;
      }
    }

    // Créer une nouvelle erreur avec le message utilisateur
    const userError = new Error(userMessage);
    userError.originalError = error;
    userError.code = error.code;
    userError.type = error.type || 'auth_error';

    return userError;
  }

  // Méthode pour valider les données d'authentification
  validateAuthData(data, type = 'signin') {
    const errors = [];

    if (type === 'signup') {
      if (!data.username || data.username.trim().length < 3) {
        errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      }
    }

    if (!data.email || !data.email.trim()) {
      errors.push('L\'email est requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Format d\'email invalide');
    }

    if (!data.password) {
      errors.push('Le mot de passe est requis');
    } else if (data.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  // Méthode pour nettoyer les données d'entrée
  sanitizeAuthData(data) {
    return {
      ...data,
      email: data.email?.trim().toLowerCase(),
      username: data.username?.trim()
    };
  }

  // Méthode pour vérifier l'état de la session
  async checkSession() {
    try {
      const user = await this.getCurrentUser();
      return {
        isValid: !!user,
        user,
        needsRefresh: false
      };
    } catch (error) {
      return {
        isValid: false,
        user: null,
        needsRefresh: true,
        error: error.message
      };
    }
  }
}
