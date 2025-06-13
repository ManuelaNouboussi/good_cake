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
    
    // Gestion du scroll
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);
    
    // Gestion de l'authentification
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
                case 'PASSWORD_RECOVERY':
                    console.log('Header: Password recovery event');
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
                    {/* LOGO */}
                    <Link to="/" className="logo">CAKE LAWYER</Link>
                    
                    {/* NAVIGATION */}
                    <nav className={menuOpen ? 'open' : ''}>
                        <ul className="choice">
                            <li><Link to="/patisserie">Pâtisserie</Link></li>
                            <li><Link to="/chocolat">Chocolat</Link></li>
                            <li><Link to="/glaces">Glaces</Link></li>
                            <li><Link to="/confiserie">Confiserie</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </nav>
                    
                    {/* SECTION AUTH */}
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
                    
                    {/* MENU TOGGLE */}
                    <div className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                
                {/* Barre d'erreur d'authentification */}
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
            
            {/* Modal d'authentification */}
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

// Composant Modal d'authentification (sans updatePassword)
const AuthModal = ({ onClose, onSuccess, onError }) => {
    const [mode, setMode] = useState('login'); // 'login', 'signup', 'reset'
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

    // Focus automatique sur le premier champ
    useEffect(() => {
        if (emailInputRef.current) {
            setTimeout(() => {
                try {
                    emailInputRef.current.focus();
                } catch (error) {
                    console.log('Focus error:', error);
                }
            }, 150);
        }
    }, [mode]);

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
                
                // Re-valider confirmPassword si il existe déjà (mode signup)
                if (mode === 'signup' && formData.confirmPassword) {
                    if (formData.confirmPassword !== value) {
                        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
                    } else {
                        delete newErrors.confirmPassword;
                    }
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
                if (mode === 'signup') {
                    // Ne valider que si le champ n'est pas vide
                    if (value) {
                        if (value !== formData.password) {
                            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
                        } else {
                            delete newErrors.confirmPassword;
                        }
                    } else {
                        // Si le champ est vide, supprimer l'erreur
                        delete newErrors.confirmPassword;
                    }
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
        
        // Nettoyer l'erreur du champ en cours de modification
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        
        // Si on modifie confirmPassword et qu'il y avait une erreur de correspondance,
        // la nettoyer aussi pour permettre une nouvelle validation
        if (name === 'confirmPassword' && errors.confirmPassword) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.confirmPassword;
                return newErrors;
            });
        }
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
                username: ''
            }));
        } else if (newMode === 'reset') {
            setFormData(prev => ({ 
                ...prev, 
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
                const finalErrors = {};
                
                if (!formData.email) {
                    finalErrors.email = 'Email requis';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    finalErrors.email = 'Format d\'email invalide';
                }

                if (!formData.password) {
                    finalErrors.password = 'Mot de passe requis';
                } else if (formData.password.length < 6) {
                    finalErrors.password = 'Au moins 6 caractères';
                }

                if (Object.keys(finalErrors).length > 0) {
                    setErrors(finalErrors);
                    setLoading(false);
                    return;
                }

                console.log('Logging in with:', formData.email);
                const result = await authFacade.signIn({ 
                    email: formData.email.trim().toLowerCase(), 
                    password: formData.password 
                });
                console.log('Login successful:', result);
                
                setSuccessMessage('Connexion réussie !');
                
                setTimeout(() => {
                    onSuccess();
                }, 800);

            } else if (mode === 'signup') {
                // Validation finale
                const finalErrors = {};
                
                if (!formData.email) {
                    finalErrors.email = 'Email requis';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    finalErrors.email = 'Format d\'email invalide';
                }

                if (!formData.password) {
                    finalErrors.password = 'Mot de passe requis';
                } else if (formData.password.length < 6) {
                    finalErrors.password = 'Au moins 6 caractères';
                }

                if (!formData.username) {
                    finalErrors.username = 'Nom d\'utilisateur requis';
                } else if (formData.username.length < 3) {
                    finalErrors.username = 'Au moins 3 caractères';
                }

                if (!formData.confirmPassword) {
                    finalErrors.confirmPassword = 'Confirmation requise';
                } else if (formData.confirmPassword !== formData.password) {
                    finalErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
                }

                if (Object.keys(finalErrors).length > 0) {
                    setErrors(finalErrors);
                    setLoading(false);
                    return;
                }

                console.log('Signing up with:', formData.email, formData.username);
                const result = await authFacade.signUp({ 
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    username: formData.username.trim()
                });
                
                if (result?.needsConfirmation) {
                    setSuccessMessage('Compte créé ! Vérifiez votre email pour l\'activer.');
                    setTimeout(() => {
                        changeMode('login');
                    }, 2000);
                } else {
                    setSuccessMessage('Compte créé avec succès !');
                    setTimeout(() => {
                        onSuccess();
                    }, 1200);
                }

            } else if (mode === 'reset') {
                if (!isResetPasswordEnabled) {
                    setErrors({ submit: 'Fonctionnalité temporairement désactivée. Utilisez la connexion normale.' });
                    setLoading(false);
                    return;
                }

                // Validation finale
                const finalErrors = {};
                
                if (!formData.email) {
                    finalErrors.email = 'Email requis';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    finalErrors.email = 'Format d\'email invalide';
                }

                if (Object.keys(finalErrors).length > 0) {
                    setErrors(finalErrors);
                    setLoading(false);
                    return;
                }

                console.log('Resetting password for:', formData.email);
                await authFacade.resetPassword({ 
                    email: formData.email.trim().toLowerCase()
                });
                
                setSuccessMessage('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
                
                setTimeout(() => {
                    changeMode('login');
                }, 3000);
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
        const hasErrors = Object.keys(errors).length > 0;
        
        if (mode === 'login') {
            return email && password && password.length >= 6 && !hasErrors;
        } else if (mode === 'signup') {
            return email && password && username && 
                   password.length >= 6 && username.length >= 3 &&
                   password === confirmPassword && !hasErrors;
        } else if (mode === 'reset') {
            return email && !hasErrors;
        }
        
        return false;
    };

    const getTitle = () => {
        switch (mode) {
            case 'login': return '👋 Bon retour !';
            case 'signup': return '🎉 Rejoignez-nous !';
            case 'reset': return '🔐 Mot de passe oublié ?';
            default: return '';
        }
    };

    const getSubtitle = () => {
        switch (mode) {
            case 'login': return 'Connectez-vous pour accéder à vos recettes';
            case 'signup': return 'Créez votre compte en quelques secondes';
            case 'reset': return 'Entrez votre email pour recevoir un lien de réinitialisation';
            default: return '';
        }
    };

    const getSubmitText = () => {
        if (loading) {
            switch (mode) {
                case 'login': return 'Connexion...';
                case 'signup': return 'Création...';
                case 'reset': return 'Envoi...';
                default: return 'Chargement...';
            }
        } else {
            switch (mode) {
                case 'login': return 'Se connecter';
                case 'signup': return 'Créer mon compte';
                case 'reset': return 'Envoyer le lien';
                default: return 'Valider';
            }
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
                        <h2 className="auth-title">{getTitle()}</h2>
                        <p className="auth-subtitle">{getSubtitle()}</p>
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
                    {mode === 'signup' && (
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

                    {/* Champ mot de passe (login et signup seulement) */}
                    {(mode === 'login' || mode === 'signup') && (
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
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
                    )}

                    {/* Confirmation mot de passe (inscription seulement) */}
                    {mode === 'signup' && (
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
                                {getSubmitText()}
                            </>
                        ) : (
                            <>
                                <span className="submit-icon">🍰</span>
                                {getSubmitText()}
                            </>
                        )}
                    </button>
                </form>

                {/* Navigation entre les modes */}
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
                                Créer un compte
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
                                        Réinitialiser
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
                                Se connecter
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
                                Se connecter
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
