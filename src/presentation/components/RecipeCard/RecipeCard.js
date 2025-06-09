// src/presentation/components/RecipeCard/RecipeCard.js
import React from 'react';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onRateRecipe, onViewDetails }) => {
  console.log('🎭 RecipeCard: Rendu de la recette:', recipe?.title);
  console.log('🎭 RecipeCard: onViewDetails function:', typeof onViewDetails);

  // Protection contre les valeurs nulles/undefined
  if (!recipe) {
    console.warn('🎭 RecipeCard: Recette null ou undefined');
    return null;
  }

  // Fonction pour formater les ingrédients de manière sécurisée
  const formatIngredients = (ingredients) => {
    if (!ingredients) return [];
    
    // Si c'est déjà un tableau d'objets
    if (Array.isArray(ingredients)) {
      return ingredients.map((ingredient, index) => {
        if (typeof ingredient === 'object' && ingredient !== null) {
          return {
            key: `ingredient-${index}`,
            text: `${ingredient.quantity || ''} ${ingredient.name || ''}${ingredient.note ? ` (${ingredient.note})` : ''}`
          };
        }
        // Si c'est juste une string
        return {
          key: `ingredient-${index}`,
          text: String(ingredient)
        };
      });
    }
    
    // Si c'est une string, essayer de parser
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

  // Fonction pour formater les étapes de manière sécurisée
  const formatSteps = (steps) => {
    if (!steps) return [];
    
    // Si c'est déjà un tableau d'objets
    if (Array.isArray(steps)) {
      return steps.map((step, index) => {
        if (typeof step === 'object' && step !== null) {
          return {
            key: `step-${index}`,
            number: step.step || index + 1,
            text: step.instruction || '',
            duration: step.duration || ''
          };
        }
        // Si c'est juste une string
        return {
          key: `step-${index}`,
          number: index + 1,
          text: String(step),
          duration: ''
        };
      });
    }
    
    // Si c'est une string, essayer de parser
    if (typeof steps === 'string') {
      try {
        const parsed = JSON.parse(steps);
        return formatSteps(parsed);
      } catch (e) {
        return [{ key: 'step-0', number: 1, text: steps, duration: '' }];
      }
    }
    
    return [];
  };

  // Formater les données de la recette de manière sécurisée
  const safeRecipe = {
    id: recipe.id || 'unknown',
    title: recipe.title || 'Titre non disponible',
    description: recipe.description || 'Description non disponible',
    image_url: recipe.image_url || recipe.imageUrl || 'https://via.placeholder.com/300x200?text=Image+non+disponible',
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
    steps: formatSteps(recipe.steps)
  };

  // Calculer le temps total
  const totalTime = safeRecipe.preparation_time + safeRecipe.cooking_time;

  // Fonction pour gérer la notation
  const handleRating = (rating) => {
    if (onRateRecipe && typeof onRateRecipe === 'function') {
      onRateRecipe(safeRecipe.id, rating);
    }
  };

  // Fonction pour gérer l'affichage des détails
  const handleViewDetails = () => {
    console.log('🎭 RecipeCard: Clic sur voir détails pour:', safeRecipe.title);
    if (onViewDetails && typeof onViewDetails === 'function') {
      console.log('🎭 RecipeCard: Appel de onViewDetails avec recipe:', recipe);
      onViewDetails(recipe);
    } else {
      console.warn('🎭 RecipeCard: onViewDetails non disponible ou pas une fonction');
    }
  };

  // Rendu des étoiles (marteaux) pour la notation
  const renderRatingStars = () => {
    const stars = [];
    const rating = Math.round(safeRecipe.average_gavels);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          className={`star ${i <= rating ? 'active' : ''}`}
          onClick={() => handleRating(i)}
          aria-label={`Noter ${i} étoile${i > 1 ? 's' : ''}`}
        >
          🔨
        </button>
      );
    }
    
    return stars;
  };

  return (
    <article className="recipe-card">
      {/* Image de la recette */}
      <div className="recipe-card__image">
        <img 
          src={safeRecipe.image_url} 
          alt={safeRecipe.title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
          }}
        />
        <div className="recipe-card__category">
          {safeRecipe.category_name}
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="recipe-card__content">
        {/* Titre et description */}
        <header className="recipe-card__header">
          <h3 className="recipe-card__title">{safeRecipe.title}</h3>
          <p className="recipe-card__description">
            {safeRecipe.description.length > 120 
              ? `${safeRecipe.description.substring(0, 120)}...` 
              : safeRecipe.description
            }
          </p>
        </header>

        {/* Informations de base */}
        <div className="recipe-card__meta">
          <div className="recipe-card__meta-item">
            <span className="recipe-card__meta-icon">👨‍🍳</span>
            <span>{safeRecipe.author_name}</span>
          </div>
          <div className="recipe-card__meta-item">
            <span className="recipe-card__meta-icon">⏱️</span>
            <span>{totalTime > 0 ? `${totalTime} min` : 'Temps non spécifié'}</span>
          </div>
          <div className="recipe-card__meta-item">
            <span className="recipe-card__meta-icon">📊</span>
            <span>{safeRecipe.difficulty}</span>
          </div>
          <div className="recipe-card__meta-item">
            <span className="recipe-card__meta-icon">🍽️</span>
            <span>{safeRecipe.servings} portion{safeRecipe.servings > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Ingrédients (aperçu) */}
        <div className="recipe-card__ingredients">
          <h4>Ingrédients principaux :</h4>
          <ul className="recipe-card__ingredients-list">
            {safeRecipe.ingredients.slice(0, 3).map((ingredient) => (
              <li key={ingredient.key} className="recipe-card__ingredient">
                {ingredient.text}
              </li>
            ))}
            {safeRecipe.ingredients.length > 3 && (
              <li className="recipe-card__ingredient recipe-card__ingredient--more">
                ... et {safeRecipe.ingredients.length - 3} autres ingrédients
              </li>
            )}
          </ul>
        </div>

        {/* Première étape (aperçu) */}
        {safeRecipe.steps.length > 0 && (
          <div className="recipe-card__steps-preview">
            <h4>Première étape :</h4>
            <p className="recipe-card__step-text">
              {safeRecipe.steps[0].text}
              {safeRecipe.steps[0].duration && (
                <span className="recipe-card__step-duration"> ({safeRecipe.steps[0].duration})</span>
              )}
            </p>
          </div>
        )}

        {/* Rating et footer */}
        <footer className="recipe-card__footer">
          <div className="recipe-card__rating">
            <div className="recipe-card__stars">
              {renderRatingStars()}
            </div>
            <span className="recipe-card__rating-text">
              {safeRecipe.average_gavels.toFixed(1)} ({safeRecipe.total_ratings} avis)
            </span>
          </div>
          
          <div className="recipe-card__actions">
            <button 
              className="recipe-card__details-btn"
              onClick={handleViewDetails}
              type="button"
            >
              📖 Voir la recette complète
            </button>
            <div className="recipe-card__date">
              Ajouté le {safeRecipe.formatted_date}
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default RecipeCard;