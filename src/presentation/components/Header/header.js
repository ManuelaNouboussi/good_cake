import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authFacade } from '../../../application/facades/authFacade';
import './header.css';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // Gestion du scroll
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
    
    // Gestion de l'authentification
    useEffect(() => {
        // Vérifier si un utilisateur est connecté
        authFacade.getCurrentUser().then(setUser);
        
        // Écouter les changements d'état d'authentification
        const { data: authListener } = authFacade.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });
        
        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);
    
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    
    const handleLogout = async () => {
        try {
            await authFacade.signOut();
            setUser(null);
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };
    
    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <Link to="/" className="logo">CAKE LAWYER</Link>
                
                <nav className={menuOpen ? 'open' : ''}>
                    <ul className="choice">
                        <li><Link to="/patisserie">Pâtisserie</Link></li>
                        <li><Link to="/chocolat">Chocolat</Link></li>
                        <li><Link to="/glaces">Glaces</Link></li>
                        <li><Link to="/confiserie">Confiserie</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </nav>
                
                <div className="auth-section">
                    {user ? (
                        <div className="user-menu">
                            <span className="user-name">
                                {user.username || user.email?.split('@')[0]}
                            </span>
                            <button onClick={handleLogout} className="logout-btn">
                                Déconnexion
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setShowAuthModal(true)} className="login-btn">
                            Connexion
                        </button>
                    )}
                </div>
                
                <div className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            
            {/* Modal d'authentification */}
            {showAuthModal && (
                <AuthModal onClose={() => setShowAuthModal(false)} />
            )}
        </header>
    );
};

// Dans le Header.js, modifier AuthModal
const AuthModal = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                console.log('Logging in with:', email);
                await authFacade.signIn({ email, password });
                console.log('Login successful');
                onClose();
            } else {
                console.log('Signing up with:', email, username);
                await authFacade.signUp({ email, password, username });
                setSuccessMessage('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
                setIsLogin(true);
                setPassword('');
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                
                <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
                
                {successMessage && <div className="success-message">{successMessage}</div>}
                
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Nom d'utilisateur</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Chargement...' : (isLogin ? 'Connexion' : 'S\'inscrire')}
                    </button>
                    
                    <button 
                        type="button" 
                        className="toggle-btn"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setSuccessMessage('');
                        }}
                    >
                        {isLogin ? 'Créer un compte' : 'Déjà inscrit ?'}
                    </button>
                </form>
            </div>
        </div>
    );
};


export default Header;
