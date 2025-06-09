// src/presentation/components/FeaturedSection/FeaturedSection.js
import React, { useState } from 'react';
import RecipeCard from '../RecipeCard/RecipeCard';
import './FeaturedSection.css';

const FeaturedSection = ({ recipes = [], onRateRecipe }) => {
  console.log('🎭 FeaturedSection: Rendu avec', recipes?.length || 0, 'recettes');
  console.log('🎭 FeaturedSection: Première recette:', recipes?.[0]);

  // État pour gérer le modal de détails des recettes
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Validation et nettoyage des recettes
  const safeRecipes = React.useMemo(() => {
    if (!Array.isArray(recipes)) {
      console.warn('🎭 FeaturedSection: recipes n\'est pas un tableau:', typeof recipes, recipes);
      return [];
    }

    return recipes.filter(recipe => {
      if (!recipe) {
        console.warn('🎭 FeaturedSection: Recette null/undefined trouvée');
        return false;
      }
      if (typeof recipe !== 'object') {
        console.warn('🎭 FeaturedSection: Recette invalide (pas un objet):', recipe);
        return false;
      }
      if (!recipe.title && !recipe.id) {
        console.warn('🎭 FeaturedSection: Recette sans titre ni ID:', recipe);
        return false;
      }
      return true;
    });
  }, [recipes]);

  console.log('🎭 FeaturedSection: Recettes sécurisées:', safeRecipes.length);

  // Fonction pour ouvrir le modal de détails
  const handleViewDetails = (recipe) => {
    console.log('🎭 FeaturedSection: Ouverture détails pour:', recipe.title);
    setSelectedRecipe(recipe);
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    console.log('🎭 FeaturedSection: Fermeture du modal');
    setSelectedRecipe(null);
  };

  // Fonction pour formater les ingrédients dans le modal
  const formatIngredients = (ingredients) => {
    if (!ingredients) return [];
    
    if (Array.isArray(ingredients)) {
      return ingredients.map((ingredient, index) => {
        if (typeof ingredient === 'object' && ingredient !== null) {
          return `${ingredient.quantity || ''} ${ingredient.name || ''}${ingredient.note ? ` (${ingredient.note})` : ''}`;
        }
        return String(ingredient);
      });
    }
    
    if (typeof ingredients === 'string') {
      try {
        const parsed = JSON.parse(ingredients);
        return formatIngredients(parsed);
      } catch (e) {
        return [ingredients];
      }
    }
    
    return [];
  };

  // Fonction pour formater les étapes dans le modal
  const formatSteps = (steps) => {
    if (!steps) return [];
    
    if (Array.isArray(steps)) {
      return steps.map((step, index) => {
        if (typeof step === 'object' && step !== null) {
          return {
            number: step.step || index + 1,
            text: step.instruction || '',
            duration: step.duration || '',
            temperature: step.temperature || ''
          };
        }
        return {
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
        return [{ number: 1, text: steps, duration: '', temperature: '' }];
      }
    }
    
    return [];
  };

  // Gestion des événements clavier pour fermer le modal
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && selectedRecipe) {
        handleCloseModal();
      }
    };

    if (selectedRecipe) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Empêcher le scroll de la page
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedRecipe]);

  // Si aucune recette n'est disponible
  if (safeRecipes.length === 0) {
    return (
      <section className="featured-section">
        <div className="container">
          <header className="featured-section__header">
            <h2 className="featured-section__title">Recettes en Vedette</h2>
            <p className="featured-section__subtitle">
              Découvrez nos meilleures créations culinaires
            </p>
          </header>
          
          <div className="featured-section__empty">
            <div className="featured-section__empty-icon">👨‍🍳</div>
            <h3>Aucune recette disponible</h3>
            <p>Les recettes sont en cours de chargement ou la base de données est vide.</p>
            <div className="featured-section__loading">
              <div className="loading-spinner"></div>
              <span>Chargement en cours...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="featured-section">
        <div className="container">
          <header className="featured-section__header">
            <h2 className="featured-section__title">Recettes en Vedette</h2>
            <p className="featured-section__subtitle">
              Découvrez nos {safeRecipes.length} meilleures créations culinaires
            </p>
          </header>

          <div className="featured-section__grid">
            {safeRecipes.map((recipe, index) => {
              try {
                return (
                  <RecipeCard
                    key={recipe.id || `recipe-${index}`}
                    recipe={recipe}
                    onRateRecipe={onRateRecipe}
                    onViewDetails={handleViewDetails}
                  />
                );
              } catch (error) {
                console.error('🎭 FeaturedSection: Erreur lors du rendu de la recette:', recipe?.title || 'inconnue', error);
                return (
                  <div key={`error-${index}`} className="recipe-card-error">
                    <h3>Erreur d'affichage</h3>
                    <p>Impossible d'afficher la recette "{recipe?.title || 'Sans titre'}"</p>
                    <details>
                      <summary>Détails techniques</summary>
                      <pre>{JSON.stringify(recipe, null, 2)}</pre>
                    </details>
                  </div>
                );
              }
            })}
          </div>

          {/* Informations de debug en mode développement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="featured-section__debug">
              <details>
                <summary>🔍 Informations de debug</summary>
                <div className="debug-info">
                  <p><strong>Nombre de recettes reçues:</strong> {recipes?.length || 0}</p>
                  <p><strong>Nombre de recettes valides:</strong> {safeRecipes.length}</p>
                  <p><strong>Type de données reçues:</strong> {Array.isArray(recipes) ? 'Array' : typeof recipes}</p>
                  <p><strong>Modal ouvert:</strong> {selectedRecipe ? selectedRecipe.title : 'Non'}</p>
                  {safeRecipes.length > 0 && (
                    <details>
                      <summary>Structure de la première recette</summary>
                      <pre>{JSON.stringify(safeRecipes[0], null, 2)}</pre>
                    </details>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>
      </section>

      {/* Modal de détails de recette */}
      {selectedRecipe && (
        <div className="recipe-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseModal();
          }
        }}>
          <div className="recipe-modal">
            {/* Header avec bouton fermer */}
            <div className="recipe-modal__header">
              <button 
                className="recipe-modal__close" 
                onClick={handleCloseModal}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="recipe-modal__content">
              {/* Section hero */}
              <div className="recipe-modal__hero">
                <div className="recipe-modal__image">
                  <img 
                    src={selectedRecipe.image_url || selectedRecipe.imageUrl || 'https://via.placeholder.com/400x300?text=Image+non+disponible'} 
                    alt={selectedRecipe.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                    }}
                  />
                  <div className="recipe-modal__category">
                    {selectedRecipe.category_name || selectedRecipe.category || 'Non catégorisé'}
                  </div>
                </div>
                
                <div className="recipe-modal__intro">
                  <h1 className="recipe-modal__title">{selectedRecipe.title}</h1>
                  <p className="recipe-modal__description">{selectedRecipe.description}</p>
                  
                  <div className="recipe-modal__meta">
                    <div className="recipe-modal__meta-grid">
                      <div className="recipe-modal__meta-item">
                        <span className="recipe-modal__meta-icon">👨‍🍳</span>
                        <span className="recipe-modal__meta-label">Chef</span>
                        <span className="recipe-modal__meta-value">{selectedRecipe.author_name || 'Auteur inconnu'}</span>
                      </div>
                      <div className="recipe-modal__meta-item">
                        <span className="recipe-modal__meta-icon">⏱️</span>
                        <span className="recipe-modal__meta-label">Temps total</span>
                        <span className="recipe-modal__meta-value">
                          {((selectedRecipe.preparation_time || selectedRecipe.prepTime || 0) + (selectedRecipe.cooking_time || selectedRecipe.cookTime || 0)) > 0 
                            ? `${(selectedRecipe.preparation_time || selectedRecipe.prepTime || 0) + (selectedRecipe.cooking_time || selectedRecipe.cookTime || 0)} min` 
                            : 'Non spécifié'}
                        </span>
                      </div>
                      <div className="recipe-modal__meta-item">
                        <span className="recipe-modal__meta-icon">📊</span>
                        <span className="recipe-modal__meta-label">Difficulté</span>
                        <span className="recipe-modal__meta-value">{selectedRecipe.difficulty || 'Non spécifié'}</span>
                      </div>
                      <div className="recipe-modal__meta-item">
                        <span className="recipe-modal__meta-icon">🍽️</span>
                        <span className="recipe-modal__meta-label">Portions</span>
                        <span className="recipe-modal__meta-value">{selectedRecipe.servings || 1}</span>
                      </div>
                    </div>
                    
                    {/* Temps détaillés */}
                    {((selectedRecipe.preparation_time || selectedRecipe.prepTime || 0) > 0 || (selectedRecipe.cooking_time || selectedRecipe.cookTime || 0) > 0) && (
                      <div className="recipe-modal__time-details">
                        {(selectedRecipe.preparation_time || selectedRecipe.prepTime || 0) > 0 && (
                          <span>⚡ Préparation: {selectedRecipe.preparation_time || selectedRecipe.prepTime} min</span>
                        )}
                        {(selectedRecipe.cooking_time || selectedRecipe.cookTime || 0) > 0 && (
                          <span>🔥 Cuisson: {selectedRecipe.cooking_time || selectedRecipe.cookTime} min</span>
                        )}
                      </div>
                    )}

                    {/* Rating */}
                    <div className="recipe-modal__rating">
                      <div className="recipe-modal__stars">
                        {[1, 2, 3, 4, 5].map(i => (
                          <button
                            key={i}
                            className={`star ${i <= Math.round(selectedRecipe.average_gavels || selectedRecipe.averageRating || 0) ? 'active' : ''}`}
                            onClick={() => onRateRecipe && onRateRecipe(selectedRecipe.id, i)}
                            aria-label={`Noter ${i} marteau${i > 1 ? 'x' : ''}`}
                          >
                            🔨
                          </button>
                        ))}
                      </div>
                      <span className="recipe-modal__rating-text">
                        {(selectedRecipe.average_gavels || selectedRecipe.averageRating || 0).toFixed(1)} marteaux ({selectedRecipe.total_ratings || selectedRecipe.totalRatings || 0} avis)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section principale */}
              <div className="recipe-modal__main">
                {/* Ingrédients */}
                <div className="recipe-modal__section">
                  <h2 className="recipe-modal__section-title">
                    <span className="recipe-modal__section-icon">🛒</span>
                    Ingrédients
                  </h2>
                  <ul className="recipe-modal__ingredients">
                    {formatIngredients(selectedRecipe.ingredients).map((ingredient, index) => (
                      <li key={index} className="recipe-modal__ingredient">
                        <span className="recipe-modal__ingredient-text">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Matériel nécessaire */}
                {selectedRecipe.equipment && selectedRecipe.equipment.length > 0 && (
                  <div className="recipe-modal__section">
                    <h2 className="recipe-modal__section-title">
                      <span className="recipe-modal__section-icon">🔧</span>
                      Matériel nécessaire
                    </h2>
                    <ul className="recipe-modal__equipment">
                      {selectedRecipe.equipment.map((item, index) => (
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
                    {formatSteps(selectedRecipe.steps).map((step, index) => (
                      <li key={index} className="recipe-modal__step">
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
                {selectedRecipe.tips && (
                  <div className="recipe-modal__section">
                    <h2 className="recipe-modal__section-title">
                      <span className="recipe-modal__section-icon">💡</span>
                      Conseils du chef
                    </h2>
                    <div className="recipe-modal__tips">
                      {selectedRecipe.tips}
                    </div>
                  </div>
                )}

                {/* Conservation */}
                {selectedRecipe.storage_instructions && (
                  <div className="recipe-modal__section">
                    <h2 className="recipe-modal__section-title">
                      <span className="recipe-modal__section-icon">🥶</span>
                      Conservation
                    </h2>
                    <div className="recipe-modal__storage">
                      {selectedRecipe.storage_instructions}
                    </div>
                  </div>
                )}

                {/* Allergènes */}
                {selectedRecipe.allergens && selectedRecipe.allergens.length > 0 && (
                  <div className="recipe-modal__section">
                    <h2 className="recipe-modal__section-title">
                      <span className="recipe-modal__section-icon">⚠️</span>
                      Allergènes
                    </h2>
                    <div className="recipe-modal__allergens">
                      {selectedRecipe.allergens.join(', ')}
                    </div>
                  </div>
                )}

                {/* Informations nutritionnelles */}
                {selectedRecipe.nutrition_info && (
                  <div className="recipe-modal__section">
                    <h2 className="recipe-modal__section-title">
                      <span className="recipe-modal__section-icon">📊</span>
                      Informations nutritionnelles
                    </h2>
                    <div className="recipe-modal__nutrition">
                      {typeof selectedRecipe.nutrition_info === 'object' ? (
                        <div className="recipe-modal__nutrition-grid">
                          {Object.entries(selectedRecipe.nutrition_info).map(([key, value]) => (
                            <div key={key} className="recipe-modal__nutrition-item">
                              <span className="recipe-modal__nutrition-label">
                                {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                              </span>
                              <span className="recipe-modal__nutrition-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>{selectedRecipe.nutrition_info}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="recipe-modal__footer">
                <div className="recipe-modal__footer-info">
                  <span>
                    Recette ajoutée le {selectedRecipe.formatted_date || new Date(selectedRecipe.created_at || Date.now()).toLocaleDateString('fr-FR')}
                  </span>
                  {selectedRecipe.source && (
                    <span> • Source: {selectedRecipe.source}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturedSection;