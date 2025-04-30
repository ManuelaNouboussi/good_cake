// src/components/RecipeCard/RecipeCard.js
import React, { useState } from 'react';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onRateRecipe }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showRatingPanel, setShowRatingPanel] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    
    // Formater la date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };
    
    // Gestion du vote
    const handleRating = (rating) => {
        onRateRecipe(recipe.id, rating);
        setShowRatingPanel(false);
    };

    // Gestion du survol des marteaux
    const handleHoverRating = (rating) => {
        setHoverRating(rating);
    };

    // Réinitialiser le survol
    const resetHoverRating = () => {
        setHoverRating(0);
    };
    
    return (
        <>
            <div className="recipe-card">
                <div className="recipe-img-container">
                    <img 
                        src={recipe.image || '/assets/images/placeholder.jpg'} 
                        alt={recipe.title} 
                        className="recipe-img" 
                    />
                    <div className="recipe-category-tag">{recipe.category}</div>
                </div>
                <div className="recipe-info">
                    <h3>{recipe.title}</h3>
                    
                    <div className="recipe-rating">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <span 
                                key={index} 
                                className={`rating-gavel ${index < Math.round(recipe.averageRating) ? 'filled' : ''}`}
                            >
                                🔨
                            </span>
                        ))}
                        <span className="rating-count">
                            ({recipe.voteCount} {recipe.voteCount === 1 ? 'vote' : 'votes'})
                        </span>
                    </div>
                    
                    <p className="recipe-description">{recipe.description}</p>
                    
                    <div className="recipe-footer">
                        <span className="recipe-date">Ajoutée le {formatDate(recipe.date)}</span>
                        <div className="recipe-actions">
                            <button 
                                className="recipe-btn view-btn" 
                                onClick={() => setIsModalOpen(true)}
                            >
                                Consulter
                            </button>
                            <button 
                                className="recipe-btn rate-btn" 
                                onClick={() => setShowRatingPanel(prev => !prev)}
                            >
                                Juger
                            </button>
                        </div>
                    </div>
                    
                    {showRatingPanel && (
                        <div className="verdict-panel">
                            <div className="verdict-header">
                                <h4>Rendez votre verdict</h4>
                                <button 
                                    className="close-verdict-btn"
                                    onClick={() => setShowRatingPanel(false)}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="verdict-content">
                                <div className="verdict-gavels">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <div 
                                            key={rating} 
                                            className={`verdict-gavel ${hoverRating >= rating ? 'hovered' : ''}`}
                                            onClick={() => handleRating(rating)}
                                            onMouseEnter={() => handleHoverRating(rating)}
                                            onMouseLeave={resetHoverRating}
                                        >
                                            <div className="gavel-icon">🔨</div>
                                            <div className="gavel-number">{rating}</div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="verdict-explanation">
                                    <div className="verdict-scale">
                                        <div className="scale-line"></div>
                                        <div className="scale-marker bad">1</div>
                                        <div className="scale-marker neutral">3</div>
                                        <div className="scale-marker good">5</div>
                                    </div>
                                    
                                    <div className="verdict-labels">
                                        <div className="verdict-label">Coupable de mauvais goût!</div>
                                        <div className="verdict-label">En procédure ...</div>
                                        <div className="verdict-label">Mérite d'être acquitté!</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="verdict-actions">
                                <button 
                                    className="cancel-verdict-btn"
                                    onClick={() => setShowRatingPanel(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {isModalOpen && (
                <div className="recipe-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="recipe-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                            &times;
                        </button>
                        <div className="recipe-modal-header">
                            <h2>{recipe.title}</h2>
                            <div className="recipe-modal-rating">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <span 
                                        key={index} 
                                        className={`rating-gavel ${index < Math.round(recipe.averageRating) ? 'filled' : ''}`}
                                    >
                                        🔨
                                    </span>
                                ))}
                                <span className="rating-count">
                                    ({recipe.voteCount} {recipe.voteCount === 1 ? 'vote' : 'votes'})
                                </span>
                            </div>
                        </div>
                        
                        {recipe.image && (
                            <div className="recipe-modal-img-container">
                                <img src={recipe.image} alt={recipe.title} className="recipe-modal-img" />
                            </div>
                        )}
                        
                        <div className="recipe-modal-content">
                            <p className="recipe-modal-description">{recipe.description}</p>
                            
                            <div className="recipe-modal-section">
                                <h3>Ingrédients</h3>
                                <ul className="ingredients-list">
                                    {recipe.ingredients.map((ingredient, index) => (
                                        <li key={index}>{ingredient}</li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="recipe-modal-section">
                                <h3>Préparation</h3>
                                <ol className="steps-list">
                                    {recipe.steps.map((step, index) => (
                                        <li key={index}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                            
                            <div className="recipe-modal-footer">
                                <p>Catégorie: <span className="modal-category">{recipe.category}</span></p>
                                <p>Ajoutée le {formatDate(recipe.date)}</p>
                                <button 
                                    className="recipe-btn rate-btn" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowRatingPanel(prev => !prev);
                                        setIsModalOpen(false);
                                    }}
                                >
                                    Juger cette recette
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RecipeCard;
