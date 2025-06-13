import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../infrastructure/api/supabase/client';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isRecoverySession, setIsRecoverySession] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);
    
    const navigate = useNavigate();

    // Écouter les événements d'authentification
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                setIsRecoverySession(true);
                setSessionChecked(true);
            } else if (event === 'SIGNED_OUT') {
                setIsRecoverySession(false);
                setSessionChecked(true);
            }
        });

        // Vérifier immédiatement s'il y a une session
        const checkInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setIsRecoverySession(!!session);
                setSessionChecked(true);
            } catch (error) {
                setIsRecoverySession(false);
                setSessionChecked(true);
            }
        };

        checkInitialSession();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Redirection si pas de session de récupération
    useEffect(() => {
        if (sessionChecked && !isRecoverySession) {
            setTimeout(() => {
                navigate('/', { 
                    state: { 
                        message: 'Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.' 
                    }
                });
            }, 3000);
        }
    }, [sessionChecked, isRecoverySession, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Nettoyer les erreurs
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setErrors({});
        setSuccessMessage('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: formData.password
            });
            
            if (error) throw error;
            
            setSuccessMessage('Mot de passe mis à jour avec succès !');
            
            // Redirection après succès
            setTimeout(() => {
                navigate('/', { 
                    state: { 
                        message: 'Mot de passe mis à jour ! Vous pouvez maintenant vous connecter.' 
                    }
                });
            }, 2000);
            
        } catch (err) {
            setErrors({ submit: err.message || 'Une erreur est survenue' });
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        return formData.password && 
               formData.confirmPassword && 
               formData.password === formData.confirmPassword && 
               formData.password.length >= 6;
    };

    // Page de chargement
    if (!sessionChecked) {
        return (
            <div className="reset-password-page">
                <div className="reset-password-container">
                    <div className="reset-password-card loading-state">
                        <div className="reset-loading-spinner"></div>
                        <h2 className="reset-title">Vérification en cours...</h2>
                        <p className="reset-subtitle">Validation de votre lien de réinitialisation</p>
                    </div>
                </div>
            </div>
        );
    }

    // Page d'erreur si pas de session de récupération
    if (!isRecoverySession) {
        return (
            <div className="reset-password-page">
                <div className="reset-password-container">
                    <div className="reset-password-card error-state">
                        <div className="reset-error-icon">⚠️</div>
                        <h2 className="reset-title error-title">Lien invalide ou expiré</h2>
                        <p className="reset-subtitle">Ce lien de réinitialisation n'est plus valide.</p>
                        <p className="reset-subtitle">Redirection en cours...</p>
                        <div className="reset-countdown-bar"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Page principale
    return (
        <div className="reset-password-page">
            <div className="reset-password-container">
                <div className="reset-password-card">
                    <div className="reset-password-header">
                        <div className="reset-password-logo">
                            <span className="reset-logo-icon">🍰</span>
                            <span className="reset-logo-text">CAKE LAWYER</span>
                            <span className="reset-logo-icon">⚖️</span>
                        </div>
                        <div className="reset-lock-icon">🔐</div>
                        <p className="reset-main-subtitle">Choisissez un mot de passe sécurisé pour continuer à partager vos créations culinaires</p>
                    </div>

                    {successMessage && (
                        <div className="reset-success-banner">
                            <span className="reset-success-icon">✅</span>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {errors.submit && (
                        <div className="reset-error-banner">
                            <span className="reset-error-icon">⚠️</span>
                            <span>{errors.submit}</span>
                        </div>
                    )}

                    <form className="reset-password-form" onSubmit={handleSubmit}>
                        <div className="reset-form-group">
                            <label htmlFor="password" className="reset-form-label">
                                Nouveau mot de passe
                            </label>
                            <div className="reset-password-input-container">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`reset-form-input ${errors.password ? 'error' : ''}`}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="reset-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="reset-error-text">{errors.password}</span>
                            )}
                        </div>

                        <div className="reset-form-group">
                            <label htmlFor="confirmPassword" className="reset-form-label">
                                Confirmer le mot de passe
                            </label>
                            <div className="reset-password-input-container">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`reset-form-input ${errors.confirmPassword ? 'error' : ''}`}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    className="reset-password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={loading}
                                    aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <span className="reset-error-text">{errors.confirmPassword}</span>
                            )}
                        </div>

                        <div className="reset-security-tips">
                            <h3 className="reset-tips-title">💡 Conseils pour un mot de passe sécurisé</h3>
                            <ul className="reset-tips-list">
                                <li>Au moins 6 caractères</li>
                                <li>Mélange de lettres et chiffres</li>
                                <li>Évitez les mots trop simples</li>
                            </ul>
                        </div>

                        <button 
                            type="submit" 
                            className={`reset-submit-button ${loading ? 'loading' : ''} ${!isFormValid() ? 'disabled' : ''}`}
                            disabled={loading || !isFormValid()}
                        >
                            {loading ? (
                                <>
                                    <span className="reset-button-spinner"></span>
                                    <span>Mise à jour en cours...</span>
                                </>
                            ) : (
                                <>
                                    <span className="reset-submit-icon">🔒</span>
                                    <span>Mettre à jour le mot de passe</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="reset-password-footer">
                        <button 
                            type="button"
                            className="reset-back-home-button"
                            onClick={() => navigate('/')}
                            disabled={loading}
                        >
                            ← Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
