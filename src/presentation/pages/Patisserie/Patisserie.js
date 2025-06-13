import React, { useState, useEffect } from 'react';
import './Patisserie.css';
import '../../components/FeaturedSection/FeaturedSection.css';
import '../../components/RecipeCard/RecipeCard.css';
import Header from '../../components/Header/header';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import { recipeFacade } from '../../../application/facades/recipeFacade';
import { authFacade } from '../../../application/facades/authFacade';

const Patisserie = () => {
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOption, setFilterOption] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    authFacade.getCurrentUser().then(setUser).catch(console.error);
    
    const { data: authListener } = authFacade.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchAllRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await recipeFacade.getAllRecipes({
        category: 'patisserie',
        sortBy: 'created_at',
        order: 'desc'
      });

      if (result && Array.isArray(result.data)) {
        setAllRecipes(result.data);
      } else if (Array.isArray(result)) {
        setAllRecipes(result);
      } else {
        setAllRecipes([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement:', err);
      setError(`Impossible de charger les recettes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRecipes();
  }, []);

  const handleViewDetails = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseModal = () => {
    setSelectedRecipe(null);
  };

  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && selectedRecipe) {
        handleCloseModal();
      }
    };

    if (selectedRecipe) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedRecipe]);

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

  const handleRateRecipe = async (recipeId, rating) => {
    if (!user) {
      alert('Vous devez être connecté pour noter une recette');
      return;
    }

    try {
      await recipeFacade.rateRecipe(recipeId, user.id, {
        gavels: rating,
        comment: 'Notation via le site',
        verdict: rating >= 4 ? 'Acquitté !' : 'À améliorer'
      });

      const result = await recipeFacade.getAllRecipes({ category: 'patisserie' });
      if (result && Array.isArray(result.data)) {
        setAllRecipes(result.data);
      } else if (Array.isArray(result)) {
        setAllRecipes(result);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la notation:', error);
      alert('Erreur lors de la notation: ' + error.message);
    }
  };

  const filteredBySearch = React.useMemo(() => {
    if (searchQuery.trim() === '') return allRecipes;
    
    return allRecipes.filter(recipe => 
      recipe.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allRecipes, searchQuery]);

  const sortedRecipes = React.useMemo(() => {
    return [...filteredBySearch].sort((a, b) => {
      switch(filterOption) {
        case 'recent':
          return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
        case 'rating':
          return (b.average_gavels || b.averageRating || 0) - (a.average_gavels || a.averageRating || 0);
        case 'popular':
          return (b.total_ratings || b.totalRatings || 0) - (a.total_ratings || a.totalRatings || 0);
        default:
          return 0;
      }
    });
  }, [filteredBySearch, filterOption]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  // Préparer les données sécurisées pour le modal
  const getSafeRecipe = (recipe) => {
    if (!recipe) return null;

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
      source: recipe.source || ''
    };

    return safeRecipe;
  };

  const renderRatingStars = (recipe) => {
    const stars = [];
    const rating = Math.round(recipe.average_gavels);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          className={`star ${i <= rating ? 'active' : ''}`}
          onClick={() => handleRateRecipe(recipe.id, i)}
          aria-label={`Noter ${i} marteau${i > 1 ? 'x' : ''}`}
        >
          🔨
        </button>
      );
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="patisserie-page">
        <Header />
        <main className="patisserie-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des recettes de pâtisserie...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patisserie-page">
        <Header />
        <main className="patisserie-container">
          <div className="error-container">
            <h3>Erreur de chargement</h3>
            <p>{error}</p>
            <button onClick={fetchAllRecipes} className="retry-btn">
              Réessayer
            </button>
          </div>
        </main>
      </div>
    );
  }

  const safeSelectedRecipe = getSafeRecipe(selectedRecipe);
  const totalTime = safeSelectedRecipe ? safeSelectedRecipe.preparation_time + safeSelectedRecipe.cooking_time : 0;

  return (
    <>
      <div className="patisserie-page">
        <Header />
        
        <main className="patisserie-container">
          <div className="search-and-filter-bar">
            <form className="search-form">
              <input
                type="text"
                placeholder="Rechercher une recette de pâtisserie..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </form>
            
            <div className="sort-container">
              <span className="sort-label">Trier par:</span>
              <div className="sort-dropdown">
                <select 
                  value={filterOption} 
                  onChange={handleFilterChange}
                  className="sort-select"
                >
                  <option value="recent">Plus récentes</option>
                  <option value="rating">Meilleures notes</option>
                  <option value="popular">Plus populaires</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="page-title">
            Recettes Pâtisserie
            <span className="recipes-count">({allRecipes.length} recette{allRecipes.length > 1 ? 's' : ''})</span>
          </div>
          
          {sortedRecipes.length === 0 && (
            <div className="no-recipes">
              <div className="no-recipes-icon">🧁</div>
              <h3>
                {searchQuery.trim() !== '' 
                  ? 'Aucune recette de pâtisserie trouvée' 
                  : allRecipes.length === 0
                    ? 'Aucune recette de pâtisserie disponible'
                    : 'Aucune recette ne correspond à votre recherche'}
              </h3>
              <p>
                {searchQuery.trim() !== '' 
                  ? 'Essayez de modifier vos critères de recherche.' 
                  : 'Soyez le premier à ajouter une délicieuse recette de pâtisserie !'}
              </p>
              {searchQuery.trim() !== '' && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="clear-search-btn"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          )}

          {sortedRecipes.length > 0 && (
            <div className="featured-section__grid">
              {sortedRecipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id || `recipe-${index}`}
                  recipe={recipe}
                  onRateRecipe={handleRateRecipe}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal détaillé complet */}
      {safeSelectedRecipe && (
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

            {/* Contenu principal */}
            <div className="recipe-modal__content">
              {/* Section image et infos de base */}
              <div className="recipe-modal__hero">
                <div className="recipe-modal__image">
                  <img 
                    src={safeSelectedRecipe.image_url} 
                    alt={safeSelectedRecipe.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                    }}
                  />
                  <div className="recipe-modal__category">
                    {safeSelectedRecipe.category_name}
                  </div>
                </div>
                
                <div className="recipe-modal__intro">
                  <h1 className="recipe-modal__title">{safeSelectedRecipe.title}</h1>
                  <p className="recipe-modal__description">{safeSelectedRecipe.description}</p>
                  
                  {/* Métadonnées */}
                  <div className="recipe-modal__meta">
                    <div className="recipe-modal__meta-grid">
                      <div className="recipe-modal__meta-item">
                        <span className="recipe-modal__meta-icon">👨‍🍳</span>
                        <span className="recipe-modal__meta-label">Chef</span>
                        <span className="recipe-modal__meta-value">{safeSelectedRecipe.author_name}</span>
                      </div>
                      <div className="recipe-modal__meta-item">
                        <span className="recipe-modal__meta-icon">⏱️</span>
                        <span className="recipe-modal__meta-label">Temps total</span>
                        <span className="recipe-modal__meta-value">{totalTime > 0 ? `${totalTime} min` : 'Non spécifié'}</span>
                      </div>
                      <div className="recipe-modal__meta-item">
                        <span className="recipe-modal__meta-icon">📊</span>
                        <span className="recipe-modal__meta-label">Difficulté</span>
                        <span className="recipe-modal__meta-value">{safeSelectedRecipe.difficulty}</span>
                      </div>
                      <div className="recipe-modal__meta-item">
                        <span className="recipe-modal__meta-icon">🍽️</span>
                        <span className="recipe-modal__meta-label">Portions</span>
                        <span className="recipe-modal__meta-value">{safeSelectedRecipe.servings}</span>
                      </div>
                    </div>
                    
                    {/* Temps détaillés */}
                    {(safeSelectedRecipe.preparation_time > 0 || safeSelectedRecipe.cooking_time > 0) && (
                      <div className="recipe-modal__time-details">
                        {safeSelectedRecipe.preparation_time > 0 && (
                          <span>⚡ Préparation: {safeSelectedRecipe.preparation_time} min</span>
                        )}
                        {safeSelectedRecipe.cooking_time > 0 && (
                          <span>🔥 Cuisson: {safeSelectedRecipe.cooking_time} min</span>
                        )}
                      </div>
                    )}

                    {/* Rating */}
                    <div className="recipe-modal__rating">
                      <div className="recipe-modal__stars">
                        {renderRatingStars(safeSelectedRecipe)}
                      </div>
                      <span className="recipe-modal__rating-text">
                        {safeSelectedRecipe.average_gavels.toFixed(1)} marteaux ({safeSelectedRecipe.total_ratings} avis)
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
                    {safeSelectedRecipe.ingredients.map((ingredient) => (
                      <li key={ingredient.key} className="recipe-modal__ingredient">
                        <span className="recipe-modal__ingredient-text">{ingredient.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Matériel nécessaire */}
                {safeSelectedRecipe.equipment.length > 0 && (
                  <div className="recipe-modal__section">
                    <h2 className="recipe-modal__section-title">
                      <span className="recipe-modal__section-icon">🔧</span>
                      Matériel nécessaire
                    </h2>
                    <ul className="recipe-modal__equipment">
                      {safeSelectedRecipe.equipment.map((item, index) => (
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
                    {safeSelectedRecipe.steps.map((step) => (
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
                {safeSelectedRecipe.tips && (
                  <div className="recipe-modal__section">
                    <h2 className="recipe-modal__section-title">
                      <span className="recipe-modal__section-icon">💡</span>
                      Conseils du chef
                    </h2>
                    <div className="recipe-modal__tips">
                      {safeSelectedRecipe.tips}
                    </div>
                  </div>
                )}

                {/* Conservation */}
                {safeSelectedRecipe.storage_instructions && (
                  <div className="recipe-modal__section">
                    <h2 className="recipe-modal__section-title">
                      <span className="recipe-modal__section-icon">🥶</span>
                      Conservation
                    </h2>
                    <div className="recipe-modal__storage">
                      {safeSelectedRecipe.storage_instructions}
                    </div>
                  </div>
                )}

                {/* Allergènes */}
                {safeSelectedRecipe.allergens.length > 0 && (
                  <div className="recipe-modal__section">
                    <h2 className="recipe-modal__section-title">
                      <span className="recipe-modal__section-icon">⚠️</span>
                      Allergènes
                    </h2>
                    <div className="recipe-modal__allergens">
                      {safeSelectedRecipe.allergens.join(', ')}
                    </div>
                  </div>
                )}

                {/* Informations nutritionnelles */}
                {safeSelectedRecipe.nutrition_info && (
                  <div className="recipe-modal__section">
                    <h2 className="recipe-modal__section-title">
                      <span className="recipe-modal__section-icon">📊</span>
                      Informations nutritionnelles
                    </h2>
                    <div className="recipe-modal__nutrition">
                      {typeof safeSelectedRecipe.nutrition_info === 'object' ? (
                        <div className="recipe-modal__nutrition-grid">
                          {Object.entries(safeSelectedRecipe.nutrition_info).map(([key, value]) => (
                            <div key={key} className="recipe-modal__nutrition-item">
                              <span className="recipe-modal__nutrition-label">
                                {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                              </span>
                              <span className="recipe-modal__nutrition-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>{safeSelectedRecipe.nutrition_info}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="recipe-modal__footer">
                <div className="recipe-modal__footer-info">
                  <span>Recette ajoutée le {safeSelectedRecipe.formatted_date}</span>
                  {safeSelectedRecipe.source && (
                    <span> • Source: {safeSelectedRecipe.source}</span>
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

export default Patisserie;
