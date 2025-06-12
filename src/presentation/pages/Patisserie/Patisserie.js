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

  if (loading) {
    return (
      <div className="patisserie-page">
        <Header />
        <main className="patisserie-container">
          <h1 className="page-title">Pâtisseries</h1>
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
          <h1 className="page-title">Pâtisseries</h1>
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

  return (
    <>
      <div className="patisserie-page">
        <Header />
        
        <main className="patisserie-container">
          <h1 className="page-title">
            Pâtisseries 
            <span className="recipes-count">({allRecipes.length} recette{allRecipes.length > 1 ? 's' : ''})</span>
          </h1>
          
          <div className="toolbar">
            <div className="filter-search-container">
              <div className="search-box">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Rechercher une recette de pâtisserie..." 
                  className="search-input"
                />
              </div>
              
              <div className="filter-options">
                <span className="filter-label">Trier par:</span>
                <select 
                  value={filterOption} 
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="recent">Plus récentes</option>
                  <option value="rating">Meilleures notes</option>
                  <option value="popular">Plus populaires</option>
                </select>
              </div>
            </div>
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

      {selectedRecipe && (
        <div className="recipe-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseModal();
          }
        }}>
          <div className="recipe-modal">
            <div className="recipe-modal__header">
              <button 
                className="recipe-modal__close" 
                onClick={handleCloseModal}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="recipe-modal__content">
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

                    <div className="recipe-modal__rating">
                      <div className="recipe-modal__stars">
                        {[1, 2, 3, 4, 5].map(i => (
                          <button
                            key={i}
                            className={`star ${i <= Math.round(selectedRecipe.average_gavels || selectedRecipe.averageRating || 0) ? 'active' : ''}`}
                            onClick={() => handleRateRecipe(selectedRecipe.id, i)}
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

              <div className="recipe-modal__main">
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
              </div>

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

export default Patisserie;