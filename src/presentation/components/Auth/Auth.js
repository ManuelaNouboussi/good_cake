// src/presentation/components/Auth/Auth.js
import React, { useState, useEffect, useRef } from 'react';
import { authFacade } from '../../../application/facades/authFacade';
import './Auth.css';

const Auth = ({ onClose, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const formRef = useRef(null);
  const emailInputRef = useRef(null);

  // Focus automatique sur le premier champ
  useEffect(() => {
    if (emailInputRef.current) {
      setTimeout(() => emailInputRef.current.focus(), 100);
    }
  }, []);

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
        if (!isLogin && !value) {
          newErrors.username = 'Nom d\'utilisateur requis';
        } else if (!isLogin && value.length < 3) {
          newErrors.username = 'Au moins 3 caractères';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'confirmPassword':
        if (!isLogin && value !== formData.password) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmPassword;
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

  const toggleMode = () => {
    setIsAnimating(true);
    setIsLogin(!isLogin);
    setErrors({});
    setSuccessMessage('');
    
    // Reset confirmPassword quand on passe en mode login
    if (!isLogin) {
      setFormData(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setLoading(true);

    try {
      // Validation finale
      validateField('email', formData.email);
      validateField('password', formData.password);
      if (!isLogin) {
        validateField('username', formData.username);
        validateField('confirmPassword', formData.confirmPassword);
      }

      if (Object.keys(errors).length > 0) {
        setLoading(false);
        return;
      }

      if (isLogin) {
        await authFacade.signIn({ 
          email: formData.email.trim().toLowerCase(), 
          password: formData.password 
        });
        setSuccessMessage('Connexion réussie ! Bienvenue !');
      } else {
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
      }
      
      // Fermer le modal après un délai pour montrer le message de succès
      setTimeout(() => {
        onClose();
      }, 1500);
      
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
    const { email, password, username, confirmPassword } = formData;
    const baseValid = email && password && Object.keys(errors).length === 0;
    
    if (isLogin) {
      return baseValid;
    } else {
      return baseValid && username && password === confirmPassword;
    }
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`auth-modal ${isAnimating ? 'animating' : ''}`} ref={formRef}>
        {/* Header avec animation */}
        <div className="auth-header">
          <div className="auth-header-content">
            <h2 className="auth-title">
              {isLogin ? '👋 Bon retour !' : '🎉 Rejoignez-nous !'}
            </h2>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Connectez-vous pour accéder à vos recettes' 
                : 'Créez votre compte en quelques secondes'
              }
            </p>
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
          {!isLogin && (
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

          {/* Champ email */}
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

          {/* Champ mot de passe */}
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
                autoComplete={isLogin ? 'current-password' : 'new-password'}
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

          {/* Confirmation mot de passe (inscription seulement) */}
          {!isLogin && (
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

          {/* Bouton de soumission */}
          <button 
            type="submit" 
            className={`auth-submit ${loading ? 'loading' : ''} ${!isFormValid() ? 'disabled' : ''}`}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {isLogin ? 'Connexion...' : 'Création...'}
              </>
            ) : (
              <>
                <span className="submit-icon">
                  {isLogin ? '🚀' : '✨'}
                </span>
                {isLogin ? 'Se connecter' : 'Créer mon compte'}
              </>
            )}
          </button>
        </form>

        {/* Bouton de changement de mode */}
        <div className="auth-switch">
          <p>
            {isLogin ? 'Pas encore de compte ?' : 'Déjà inscrit ?'}
          </p>
          <button 
            type="button" 
            className="switch-button"
            onClick={toggleMode}
            disabled={loading}
          >
            {isLogin ? '✨ Créer un compte' : '🚀 Se connecter'}
          </button>
        </div>

        {/* Footer avec informations */}
        <div className="auth-footer">
          <p>
            {isLogin 
              ? '🔐 Connexion sécurisée' 
              : '🛡️ Vos données sont protégées'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;