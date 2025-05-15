// src/presentation/components/Auth/Auth.js
import React, { useState } from 'react';
import { authFacade } from '../../../application/facades/authFacade';

const Auth = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await authFacade.signIn({ email, password });
      } else {
        await authFacade.signUp({ email, password, username });
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Chargement...' : (isLogin ? 'Connexion' : 'Inscription')}
        </button>
        
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Créer un compte' : 'Déjà inscrit ?'}
        </button>
      </form>
      
      <button onClick={onClose}>Fermer</button>
    </div>
  );
};

export default Auth;
