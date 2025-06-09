// src/presentation/components/RecipeDetailModal/RecipeDetailModal.js
import React from 'react';
import './RecipeDetailModal.css';

const RecipeDetailModal = ({ recipe, isOpen, onClose, onRateRecipe }) => {
  if (!isOpen || !recipe) return null;

  // Mêmes fonctions de formatage que RecipeCard pour la cohérence
  const formatIngredients = (ingredients) => {
    if (!ingredients) return [];
    
    if (Array.isArray(ingredients)) {
      return ingredients.map((ingredient, index) => {
        if (typeof ingredient === 'object' && ingredient !== null) {
          return {
            key: `ingredient-${index}`,
            text: `${ingredient.quantity || ''} ${ingredient.name || ''}${ingredient.note ? ` (${ingredient.note})` : ''}`
          };
        }
        return {
          key: `ingredient-${index}`,
          text: String(ingredient)
        };
      });
    }
    
    if (typeof ingredients === 'string') {
      try {
        const parsed = JSON.parse(ingredients);
        return formatIngredients(parsed);
      } catch (e) {
        return [{ key: 'ingredient-0', text: ingredients }];
      }
    }
    
    return [];
  };

  const formatSteps = (steps) => {
    if (!steps) return [];
    
    if (Array.isArray(steps)) {
      return steps.map((step, index) => {
        if (typeof step === 'object' && step !== null) {
          return {
            key: `step-${index}`,
            number: step.step || index + 1,
            text: step.instruction || '',
            duration: step.duration || '',
            temperature: step.temperature || ''
          };
        }
        return {
          key: `step-${index}`,
          number: index + 1,
          text: String(step),
          duration: '',
          temperature: ''
        };
      });
    }
    
    if (typeof steps === 'string') {
      try {
        const parsed = JSON.parse(steps);
        return formatSteps(parsed);
      } catch (e) {
        return [{ key: 'step-0', number: 1, text: steps, duration: '', temperature: '' }];
      }
    }
    
    return [];
  };

  const safeRecipe = {
    id: recipe.id || 'unknown',
    title: recipe.title || 'Titre non disponible',
    description: recipe.description || 'Description non disponible',
    image_url: recipe.image_url || recipe.imageUrl || 'https://via.placeholder.com/400x300?text=Image+non+disponible',
    category_name: recipe.category_name || recipe.category || 'Non catégorisé',
    author_name: recipe.author_name || 'Auteur inconnu',
    preparation_time: recipe.preparation_time || recipe.prepTime || 0,
    cooking_time: recipe.cooking_time || recipe.cookTime || 0,
    difficulty: recipe.difficulty || 'Non spécifié',
    servings: recipe.servings || 1,
    average_gavels: recipe.average_gavels || recipe.averageRating || 0,
    total_ratings: recipe.total_ratings || recipe.totalRatings || 0,
    formatted_date: recipe.formatted_date || new Date(recipe.created_at || Date.now()).toLocaleDateString('fr-FR'),
    ingredients: formatIngredients(recipe.ingredients),
    steps: formatSteps(recipe.steps),
    equipment: recipe.equipment || [],
    tips: recipe.tips || '',
    storage_instructions: recipe.storage_instructions || '',
    allergens: recipe.allergens || [],
    nutrition_info: recipe.nutrition_info || null,
    video_url: recipe.video_url || '',
    source: recipe.source || '',
    yield_info: recipe.yield_info || recipe.yield || ''
  };

  const totalTime = safeRecipe.preparation_time + safeRecipe.cooking_time;

  const handleRating = (rating) => {
    if (onRateRecipe && typeof onRateRecipe === 'function') {
      onRateRecipe(safeRecipe.id, rating);
    }
  };

  const renderRatingStars = () => {
    const stars = [];
    const rating = Math.round(safeRecipe.average_gavels);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          className={`star ${i <= rating ? 'active' : ''}`}
          onClick={() => handleRating(i)}
          aria-label={`Noter ${i} marteau${i > 1 ? 'x' : ''}`}
        >
          🔨
        </button>
      );
    }
    
    return stars;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="recipe-modal-overlay" onClick={handleBackdropClick}>
      <div className="recipe-modal">
        {/* Header avec bouton fermer */}
        <div className="recipe-modal__header">
          <button 
            className="recipe-modal__close" 
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Contenu principal */}
        <div className="recipe-modal__content">
          {/* Section image et infos de base */}
          <div className="recipe-modal__hero">
            <div className="recipe-modal__image">
              <img 
                src={safeRecipe.image_url} 
                alt={safeRecipe.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                }}
              />
              <div className="recipe-modal__category">
                {safeRecipe.category_name}
              </div>
            </div>
            
            <div className="recipe-modal__intro">
              <h1 className="recipe-modal__title">{safeRecipe.title}</h1>
              <p className="recipe-modal__description">{safeRecipe.description}</p>
              
              {/* Métadonnées */}
              <div className="recipe-modal__meta">
                <div className="recipe-modal__meta-grid">
                  <div className="recipe-modal__meta-item">
                    <span className="recipe-modal__meta-icon">👨‍🍳</span>
                    <span className="recipe-modal__meta-label">Chef</span>
                    <span className="recipe-modal__meta-value">{safeRecipe.author_name}</span>
                  </div>
                  <div className="recipe-modal__meta-item">
                    <span className="recipe-modal__meta-icon">⏱️</span>
                    <span className="recipe-modal__meta-label">Temps total</span>
                    <span className="recipe-modal__meta-value">{totalTime > 0 ? `${totalTime} min` : 'Non spécifié'}</span>
                  </div>
                  <div className="recipe-modal__meta-item">
                    <span className="recipe-modal__meta-icon">📊</span>
                    <span className="recipe-modal__meta-label">Difficulté</span>
                    <span className="recipe-modal__meta-value">{safeRecipe.difficulty}</span>
                  </div>
                  <div className="recipe-modal__meta-item">
                    <span className="recipe-modal__meta-icon">🍽️</span>
                    <span className="recipe-modal__meta-label">Portions</span>
                    <span className="recipe-modal__meta-value">{safeRecipe.servings}</span>
                  </div>
                </div>
                
                {/* Temps détaillés */}
                {(safeRecipe.preparation_time > 0 || safeRecipe.cooking_time > 0) && (
                  <div className="recipe-modal__time-details">
                    {safeRecipe.preparation_time > 0 && (
                      <span>⚡ Préparation: {safeRecipe.preparation_time} min</span>
                    )}
                    {safeRecipe.cooking_time > 0 && (
                      <span>🔥 Cuisson: {safeRecipe.cooking_time} min</span>
                    )}
                  </div>
                )}

                {/* Rating */}
                <div className="recipe-modal__rating">
                  <div className="recipe-modal__stars">
                    {renderRatingStars()}
                  </div>
                  <span className="recipe-modal__rating-text">
                    {safeRecipe.average_gavels.toFixed(1)} marteaux ({safeRecipe.total_ratings} avis)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section principale : ingrédients et étapes */}
          <div className="recipe-modal__main">
            {/* Ingrédients */}
            <div className="recipe-modal__section">
              <h2 className="recipe-modal__section-title">
                <span className="recipe-modal__section-icon">🛒</span>
                Ingrédients
              </h2>
              <ul className="recipe-modal__ingredients">
                {safeRecipe.ingredients.map((ingredient) => (
                  <li key={ingredient.key} className="recipe-modal__ingredient">
                    <span className="recipe-modal__ingredient-text">{ingredient.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Matériel nécessaire */}
            {safeRecipe.equipment.length > 0 && (
              <div className="recipe-modal__section">
                <h2 className="recipe-modal__section-title">
                  <span className="recipe-modal__section-icon">🔧</span>
                  Matériel nécessaire
                </h2>
                <ul className="recipe-modal__equipment">
                  {safeRecipe.equipment.map((item, index) => (
                    <li key={index} className="recipe-modal__equipment-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Étapes de préparation */}
            <div className="recipe-modal__section">
              <h2 className="recipe-modal__section-title">
                <span className="recipe-modal__section-icon">📝</span>
                Étapes de préparation
              </h2>
              <ol className="recipe-modal__steps">
                {safeRecipe.steps.map((step) => (
                  <li key={step.key} className="recipe-modal__step">
                    <div className="recipe-modal__step-number">{step.number}</div>
                    <div className="recipe-modal__step-content">
                      <p className="recipe-modal__step-text">{step.text}</p>
                      {(step.duration || step.temperature) && (
                        <div className="recipe-modal__step-meta">
                          {step.duration && (
                            <span className="recipe-modal__step-duration">⏱️ {step.duration}</span>
                          )}
                          {step.temperature && (
                            <span className="recipe-modal__step-temperature">🌡️ {step.temperature}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Conseils et astuces */}
            {safeRecipe.tips && (
              <div className="recipe-modal__section">
                <h2 className="recipe-modal__section-title">
                  <span className="recipe-modal__section-icon">💡</span>
                  Conseils du chef
                </h2>
                <div className="recipe-modal__tips">
                  {safeRecipe.tips}
                </div>
              </div>
            )}

            {/* Conservation */}
            {safeRecipe.storage_instructions && (
              <div className="recipe-modal__section">
                <h2 className="recipe-modal__section-title">
                  <span className="recipe-modal__section-icon">🥶</span>
                  Conservation
                </h2>
                <div className="recipe-modal__storage">
                  {safeRecipe.storage_instructions}
                </div>
              </div>
            )}

            {/* Allergènes */}
            {safeRecipe.allergens.length > 0 && (
              <div className="recipe-modal__section">
                <h2 className="recipe-modal__section-title">
                  <span className="recipe-modal__section-icon">⚠️</span>
                  Allergènes
                </h2>
                <div className="recipe-modal__allergens">
                  {safeRecipe.allergens.join(', ')}
                </div>
              </div>
            )}

            {/* Informations nutritionnelles */}
            {safeRecipe.nutrition_info && (
              <div className="recipe-modal__section">
                <h2 className="recipe-modal__section-title">
                  <span className="recipe-modal__section-icon">📊</span>
                  Informations nutritionnelles
                </h2>
                <div className="recipe-modal__nutrition">
                  {typeof safeRecipe.nutrition_info === 'object' ? (
                    <div className="recipe-modal__nutrition-grid">
                      {Object.entries(safeRecipe.nutrition_info).map(([key, value]) => (
                        <div key={key} className="recipe-modal__nutrition-item">
                          <span className="recipe-modal__nutrition-label">
                            {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </span>
                          <span className="recipe-modal__nutrition-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>{safeRecipe.nutrition_info}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="recipe-modal__footer">
            <div className="recipe-modal__footer-info">
              <span>Recette ajoutée le {safeRecipe.formatted_date}</span>
              {safeRecipe.source && (
                <span> • Source: {safeRecipe.source}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;
