import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { authFacade } from '../../../application/facades/authFacade';
import './header.css';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    
    // Gestion du scroll (votre code original)
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);
    
    // Gestion de l'authentification améliorée
    useEffect(() => {
        let mounted = true;
        
        const initializeAuth = async () => {
            try {
                setAuthLoading(true);
                const currentUser = await authFacade.getCurrentUser();
                if (mounted) {
                    console.log('Header: User loaded:', currentUser);
                    setUser(currentUser);
                    setAuthError(null);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                if (mounted) {
                    setAuthError(error.message);
                    setUser(null);
                }
            } finally {
                if (mounted) {
                    setAuthLoading(false);
                }
            }
        };

        initializeAuth();

        // Écouter les changements d'état d'authentification
        const unsubscribe = authFacade.onAuthStateChange((event, session, enrichedUser) => {
            if (!mounted) return;
            
            console.log('Header: Auth state changed:', event, enrichedUser);
            
            switch (event) {
                case 'SIGNED_IN':
                    console.log('Header: User signed in:', enrichedUser);
                    setUser(enrichedUser || session?.user);
                    setAuthError(null);
                    setShowAuthModal(false);
                    break;
                case 'SIGNED_OUT':
                    console.log('Header: User signed out');
                    setUser(null);
                    setAuthError(null);
                    break;
                case 'TOKEN_REFRESHED':
                    if (enrichedUser) {
                        console.log('Header: Token refreshed:', enrichedUser);
                        setUser(enrichedUser);
                    }
                    break;
                default:
                    console.log('Header: Other auth event:', event);
            }
        });
        
        return () => {
            mounted = false;
            if (unsubscribe && typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);
    
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    
    const handleLogout = async () => {
        try {
            console.log('Header: Logging out...');
            await authFacade.signOut();
            console.log('Header: Logout successful');
            setUser(null);
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            setAuthError(error.message);
        }
    };

    const handleAuthSuccess = () => {
        console.log('Header: Auth success handler called');
        setShowAuthModal(false);
        
        // Forcer le rechargement de l'utilisateur pour être sûr
        setTimeout(async () => {
            try {
                const currentUser = await authFacade.getCurrentUser();
                console.log('Header: Refreshed user after success:', currentUser);
                setUser(currentUser);
            } catch (error) {
                console.error('Header: Error refreshing user:', error);
            }
        }, 100);
    };

    const handleAuthError = (error) => {
        setAuthError(error);
    };
    
    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-container">
                    {/* LOGO ORIGINAL - INCHANGÉ */}
                    <Link to="/" className="logo">CAKE LAWYER</Link>
                    
                    {/* NAVIGATION ORIGINALE - INCHANGÉE */}
                    <nav className={menuOpen ? 'open' : ''}>
                        <ul className="choice">
                            <li><Link to="/patisserie">Pâtisserie</Link></li>
                            <li><Link to="/chocolat">Chocolat</Link></li>
                            <li><Link to="/glaces">Glaces</Link></li>
                            <li><Link to="/confiserie">Confiserie</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </nav>
                    
                    {/* SECTION AUTH AMÉLIORÉE - SEULEMENT CETTE PARTIE CHANGE */}
                    <div className="auth-section">
                        {authLoading ? (
                            <div className="auth-loading">
                                <div className="auth-spinner"></div>
                            </div>
                        ) : user ? (
                            <div className="user-menu">
                                <span className="user-name">
                                    {user.username || user.email?.split('@')[0]}
                                </span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Déconnexion
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setShowAuthModal(true)} 
                                className="login-btn"
                            >
                                Connexion
                            </button>
                        )}
                    </div>
                    
                    {/* MENU TOGGLE ORIGINAL - INCHANGÉ */}
                    <div className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                
                {/* Barre d'erreur d'authentification (nouvelle fonctionnalité) */}
                {authError && (
                    <div className="auth-error-bar">
                        <span>{authError}</span>
                        <button 
                            onClick={() => setAuthError(null)}
                            aria-label="Fermer"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </header>
            
            {/* Modal d'authentification améliorée */}
            {showAuthModal && (
                <AuthModal 
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                    onError={handleAuthError}
                />
            )}
        </>
    );
};

// Composant Modal d'authentification amélioré (inchangé de la version précédente)
const AuthModal = ({ onClose, onSuccess, onError }) => {
    const [isLogin, setIsLogin] = useState(true);
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
    
    const modalRef = useRef(null);
    const emailInputRef = useRef(null);

    // Focus automatique sur le premier champ
    useEffect(() => {
        if (emailInputRef.current) {
            setTimeout(() => emailInputRef.current.focus(), 150);
        }
    }, []);

    // Gestion de l'échappement pour fermer le modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !loading) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [loading, onClose]);

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
                console.log('Logging in with:', formData.email);
                const result = await authFacade.signIn({ 
                    email: formData.email.trim().toLowerCase(), 
                    password: formData.password 
                });
                console.log('Login successful:', result);
                
                setSuccessMessage('Connexion réussie !');
                
                // Attendre un peu avant de fermer pour laisser le temps à l'état de se mettre à jour
                setTimeout(() => {
                    onSuccess();
                }, 800);
                
            } else {
                console.log('Signing up with:', formData.email, formData.username);
                const result = await authFacade.signUp({ 
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    username: formData.username.trim()
                });
                
                if (result?.needsConfirmation) {
                    setSuccessMessage('Compte créé ! Vérifiez votre email pour l\'activer.');
                    setTimeout(() => {
                        setIsLogin(true);
                        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                    }, 2000);
                } else {
                    setSuccessMessage('Compte créé avec succès !');
                    setTimeout(() => {
                        onSuccess();
                    }, 1200);
                }
            }
            
        } catch (err) {
            console.error('Auth error:', err);
            const errorMessage = err.message || 'Une erreur est survenue';
            setErrors({ submit: errorMessage });
            onError(errorMessage);
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
        <div 
            className="auth-overlay" 
            onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
        >
            <div 
                className={`auth-modal ${isAnimating ? 'animating' : ''}`} 
                ref={modalRef}
            >
                {/* Header */}
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
                    <button 
                        className="auth-close" 
                        onClick={onClose} 
                        disabled={loading}
                        aria-label="Fermer"
                    >
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
                            <label>Nom d'utilisateur</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Votre nom d'utilisateur"
                                value={formData.username}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                className={errors.username ? 'error' : ''}
                                autoComplete="username"
                                disabled={loading}
                                required
                            />
                            {errors.username && (
                                <span className="error-text">{errors.username}</span>
                            )}
                        </div>
                    )}

                    {/* Champ email */}
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            ref={emailInputRef}
                            type="email"
                            name="email"
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            className={errors.email ? 'error' : ''}
                            autoComplete="email"
                            disabled={loading}
                            required
                        />
                        {errors.email && (
                            <span className="error-text">{errors.email}</span>
                        )}
                    </div>

                    {/* Champ mot de passe */}
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                className={errors.password ? 'error' : ''}
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                aria-label={showPassword ? 'Masquer' : 'Afficher'}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="error-text">{errors.password}</span>
                        )}
                    </div>

                    {/* Confirmation mot de passe (inscription seulement) */}
                    {!isLogin && (
                        <div className="form-group">
                            <label>Confirmer le mot de passe</label>
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    className={errors.confirmPassword ? 'error' : ''}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={loading}
                                    aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
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
                                    {isLogin ? '⚖️' : '🍰'}
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
                        {isLogin ? 'Créer un compte' : 'Se connecter'}
                    </button>
                </div>

                {/* Footer */}
                <div className="auth-footer">
                    <p>🔐 Connexion sécurisée</p>
                </div>
            </div>
        </div>
    );
};

export default Header;
