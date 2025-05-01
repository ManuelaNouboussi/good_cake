import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './NavigationButtons.css';

const NavigationButtons = () => {
    const navigate = useNavigate();
    
    return (
        <div className="navigation-buttons">
            <button 
                className="back-button" 
                onClick={() => navigate(-1)}
                aria-label="Retour à la page précédente"
            >
                <span className="icon">&#8592;</span>
                <span className="text">Retour</span>
            </button>
            
            <Link to="/" className="home-button">
                <span className="icon">&#8962;</span>
                <span className="text">Accueil</span>
            </Link>
            
            <div className="category-buttons">
                <Link to="/patisserie" className="category-button">Pâtisseries</Link>
                <Link to="/chocolat" className="category-button">Chocolats</Link>
                <Link to="/glaces" className="category-button">Glaces</Link>
                <Link to="/confiserie" className="category-button">Confiseries</Link>
            </div>
        </div>
    );
};

export default NavigationButtons;
