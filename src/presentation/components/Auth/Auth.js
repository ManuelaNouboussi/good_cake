// src/presentation/components/Auth/Auth.js
import React, { useState, useEffect, useRef } from 'react';
import { authFacade } from '../../../application/facades/authFacade';
import './Auth.css';

const Auth = ({ onClose, initialMode = 'login' }) => {
  // Vérifier dynamiquement si les fonctionnalités de reset sont disponibles
  const [isResetPasswordEnabled, setIsResetPasswordEnabled] = useState(false);

  useEffect(() => {
    // Vérifier si les méthodes de reset sont disponibles
    const checkResetAvailability = () => {
      try {
        const available = authFacade.isResetPasswordAvailable();
        setIsResetPasswordEnabled(available);
      } catch (error) {
        console.log('Reset password features not available:', error);
        setIsResetPasswordEnabled(false);
      }
    };

    checkResetAvailability();
  }, []);

  const [mode, setMode] = useState(() => {
    // Vérifier si on est dans un processus de récupération
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    
    if (urlParams.get('type') === 'recovery' || hash.includes('type=recovery')) {
      return 'updatePassword';
    }
    
    return initialMode === 'login' ? 'login' : 'signup';
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const formRef = useRef(null);
  const emailInputRef = useRef(null);
  const newPasswordInputRef = useRef(null);

  // Focus automatique sur le premier champ
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      if (mode === 'updatePassword' && newPasswordInputRef.current) {
        try {
          newPasswordInputRef.current.focus();
        } catch (error) {
          console.log('Focus error on new password field:', error);
        }
      } else if (emailInputRef.current) {
        try {
          emailInputRef.current.focus();
        } catch (error) {
          console.log('Focus error on email field:', error);
        }
      }
    }, 200);

    return () => clearTimeout(focusTimer);
  }, [mode]);

  // Animation lors du changement de mode
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // Validation en temps réel
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Format d\'email invalide';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Mot de passe requis';
        } else if (value.length < 6) {
          newErrors.password = 'Au moins 6 caractères';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'username':
        if (mode === 'signup' && !value) {
          newErrors.username = 'Nom d\'utilisateur requis';
        } else if (mode === 'signup' && value.length < 3) {
          newErrors.username = 'Au moins 3 caractères';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'confirmPassword':
        if (mode === 'signup' && value !== formData.password) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case 'newPassword':
        if (!value) {
          newErrors.newPassword = 'Nouveau mot de passe requis';
        } else if (value.length < 6) {
          newErrors.newPassword = 'Au moins 6 caractères';
        } else {
          delete newErrors.newPassword;
        }
        break;

      case 'confirmNewPassword':
        if (value !== formData.newPassword) {
          newErrors.confirmNewPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmNewPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation en temps réel avec debounce
    setTimeout(() => validateField(name, value), 300);
  };

  const changeMode = (newMode) => {
    setIsAnimating(true);
    setMode(newMode);
    setErrors({});
    setSuccessMessage('');
    
    // Reset des champs selon le mode
    if (newMode === 'login') {
      setFormData(prev => ({ 
        ...prev, 
        confirmPassword: '', 
        username: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } else if (newMode === 'reset') {
      setFormData(prev => ({ 
        ...prev, 
        password: '', 
        confirmPassword: '', 
        username: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } else if (newMode === 'updatePassword') {
      setFormData(prev => ({ 
        ...prev, 
        email: '',
        password: '', 
        confirmPassword: '', 
        username: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        // Validation finale
        validateField('email', formData.email);
        validateField('password', formData.password);

        if (Object.keys(errors).length > 0) {
          setLoading(false);
          return;
        }

        await authFacade.signIn({ 
          email: formData.email.trim().toLowerCase(), 
          password: formData.password 
        });
        setSuccessMessage('Connexion réussie ! Bienvenue !');
        
      } else if (mode === 'signup') {
        // Validation finale
        validateField('email', formData.email);
        validateField('password', formData.password);
        validateField('username', formData.username);
        validateField('confirmPassword', formData.confirmPassword);

        if (Object.keys(errors).length > 0) {
          setLoading(false);
          return;
        }

        const result = await authFacade.signUp({ 
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          username: formData.username.trim()
        });
        
        if (result?.needsConfirmation) {
          setSuccessMessage('Compte créé ! Vérifiez votre email pour l\'activer.');
        } else {
          setSuccessMessage('Compte créé et connecté avec succès !');
        }
        
      } else if (mode === 'reset') {
        if (!isResetPasswordEnabled) {
          setErrors({ submit: 'Fonctionnalité temporairement désactivée. Utilisez la connexion normale.' });
          setLoading(false);
          return;
        }

        // Validation finale
        validateField('email', formData.email);

        if (Object.keys(errors).length > 0) {
          setLoading(false);
          return;
        }

        await authFacade.resetPassword({ 
          email: formData.email.trim().toLowerCase()
        });
        
        setSuccessMessage('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
        
        // Retourner au mode login après un délai
        setTimeout(() => {
          changeMode('login');
        }, 3000);
        
      } else if (mode === 'updatePassword') {
        if (!isResetPasswordEnabled) {
          setErrors({ submit: 'Fonctionnalité temporairement désactivée. Veuillez vous connecter normalement.' });
          setLoading(false);
          return;
        }

        // Validation finale
        validateField('newPassword', formData.newPassword);
        validateField('confirmNewPassword', formData.confirmNewPassword);

        if (Object.keys(errors).length > 0) {
          setLoading(false);
          return;
        }

        await authFacade.updatePassword({ 
          password: formData.newPassword,
          confirmPassword: formData.confirmNewPassword
        });
        
        setSuccessMessage('Mot de passe mis à jour avec succès !');
      }
      
      // Fermer le modal après un délai pour montrer le message de succès
      if (mode !== 'reset') {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      setErrors({ submit: err.message || 'Une erreur s\'est produite' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  const isFormValid = () => {
    const { email, password, username, confirmPassword, newPassword, confirmNewPassword } = formData;
    const hasErrors = Object.keys(errors).length > 0;
    
    if (mode === 'login') {
      return email && password && !hasErrors;
    } else if (mode === 'signup') {
      return email && password && username && password === confirmPassword && !hasErrors;
    } else if (mode === 'reset') {
      return email && !hasErrors;
    } else if (mode === 'updatePassword') {
      return newPassword && newPassword === confirmNewPassword && !hasErrors;
    }
    
    return false;
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return '👋 Bon retour !';
      case 'signup': return '🎉 Rejoignez-nous !';
      case 'reset': return '🔐 Mot de passe oublié ?';
      case 'updatePassword': return '🔄 Nouveau mot de passe';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Connectez-vous pour accéder à vos recettes';
      case 'signup': return 'Créez votre compte en quelques secondes';
      case 'reset': return 'Entrez votre email pour recevoir un lien de réinitialisation';
      case 'updatePassword': return 'Choisissez votre nouveau mot de passe';
      default: return '';
    }
  };

  const getSubmitText = () => {
    if (loading) {
      switch (mode) {
        case 'login': return 'Connexion...';
        case 'signup': return 'Création...';
        case 'reset': return 'Envoi...';
        case 'updatePassword': return 'Mise à jour...';
        default: return 'Chargement...';
      }
    } else {
      switch (mode) {
        case 'login': return 'Se connecter';
        case 'signup': return 'Créer mon compte';
        case 'reset': return 'Envoyer le lien';
        case 'updatePassword': return 'Mettre à jour';
        default: return 'Valider';
      }
    }
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`auth-modal ${isAnimating ? 'animating' : ''}`} ref={formRef}>
        {/* Header avec animation */}
        <div className="auth-header">
          <div className="auth-header-content">
            <h2 className="auth-title">{getTitle()}</h2>
            <p className="auth-subtitle">{getSubtitle()}</p>
          </div>
          <button className="auth-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {successMessage && (
          <div className="success-banner">
            <span className="success-icon">✅</span>
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {errors.submit}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Champ nom d'utilisateur (inscription seulement) */}
          {mode === 'signup' && (
            <div className="form-group">
              <div className="input-container">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  name="username"
                  placeholder="Nom d'utilisateur"
                  value={formData.username}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={errors.username ? 'error' : ''}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <span className="error-text">{errors.username}</span>
              )}
            </div>
          )}

          {/* Champ email (sauf pour updatePassword) */}
          {mode !== 'updatePassword' && (
            <div className="form-group">
              <div className="input-container">
                <span className="input-icon">📧</span>
                <input
                  ref={emailInputRef}
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={errors.email ? 'error' : ''}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
          )}

          {/* Champ mot de passe (login et signup seulement) */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="form-group">
              <div className="input-container">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={errors.password ? 'error' : ''}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>
          )}

          {/* Confirmation mot de passe (inscription seulement) */}
          {mode === 'signup' && (
            <div className="form-group">
              <div className="input-container">
                <span className="input-icon">🔒</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirmer le mot de passe"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={errors.confirmPassword ? 'error' : ''}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* Champs pour la mise à jour du mot de passe */}
          {mode === 'updatePassword' && (
            <>
              <div className="form-group">
                <div className="input-container">
                  <span className="input-icon">🔒</span>
                  <input
                    ref={newPasswordInputRef}
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="Nouveau mot de passe"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className={errors.newPassword ? 'error' : ''}
                    autoComplete="new-password"
                    autoFocus={mode === 'updatePassword'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showNewPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="error-text">{errors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <div className="input-container">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    name="confirmNewPassword"
                    placeholder="Confirmer le nouveau mot de passe"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className={errors.confirmNewPassword ? 'error' : ''}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    aria-label={showConfirmNewPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showConfirmNewPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmNewPassword && (
                  <span className="error-text">{errors.confirmNewPassword}</span>
                )}
              </div>
            </>
          )}

          {/* Bouton de soumission */}
          <button 
            type="submit" 
            className={`auth-submit ${loading ? 'loading' : ''} ${!isFormValid() ? 'disabled' : ''}`}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {getSubmitText()}
              </>
            ) : (
              <>
                <span className="submit-icon">
                  {mode === 'updatePassword' ? '🔄' : mode === 'reset' ? '📧' : mode === 'login' ? '🚀' : '✨'}
                </span>
                {getSubmitText()}
              </>
            )}
          </button>
        </form>

        {/* Navigation entre les modes (sauf pour updatePassword) */}
        {mode !== 'updatePassword' && (
          <div className="auth-switch">
            {mode === 'login' && (
              <>
                <p>Pas encore de compte ?</p>
                <button 
                  type="button" 
                  className="switch-button"
                  onClick={() => changeMode('signup')}
                  disabled={loading}
                >
                  ✨ Créer un compte
                </button>
                {isResetPasswordEnabled && (
                  <>
                    <p>Mot de passe oublié ?</p>
                    <button 
                      type="button" 
                      className="switch-button"
                      onClick={() => changeMode('reset')}
                      disabled={loading}
                    >
                      🔐 Réinitialiser
                    </button>
                  </>
                )}
              </>
            )}
            
            {mode === 'signup' && (
              <>
                <p>Déjà inscrit ?</p>
                <button 
                  type="button" 
                  className="switch-button"
                  onClick={() => changeMode('login')}
                  disabled={loading}
                >
                  🚀 Se connecter
                </button>
              </>
            )}
            
            {mode === 'reset' && (
              <>
                <p>Retour à la connexion</p>
                <button 
                  type="button" 
                  className="switch-button"
                  onClick={() => changeMode('login')}
                  disabled={loading}
                >
                  🚀 Se connecter
                </button>
              </>
            )}
          </div>
        )}

        {/* Footer avec informations */}
        <div className="auth-footer">
          <p>
            {mode === 'login' ? '🔐 Connexion sécurisée' : 
             mode === 'signup' ? '🛡️ Vos données sont protégées' :
             mode === 'reset' ? '📧 Vérifiez votre boîte mail' :
             '🔒 Sécurisé et confidentiel'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;