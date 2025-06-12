import React, { useState, useEffect } from 'react';
import './Chocolat.css';
import '../../components/FeaturedSection/FeaturedSection.css';
import '../../components/RecipeCard/RecipeCard.css';
import Header from '../../components/Header/header';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import RecipeDetailModal from '../../components/RecipeDetailModal/RecipeDetailModal';
import { recipeFacade } from '../../../application/facades/recipeFacade';
import { authFacade } from '../../../application/facades/authFacade';

const JudicialHeader = () => {
  return (
    <div className="judicial-header">
      <div className="decorative-line">
        <div className="line"></div>
        <div className="scale-icon">⚖️</div>
        <div className="line"></div>
      </div>
      
      <h1>Chocolat</h1>
      
      <div className="decorative-elements">
        <span className="hammer-icon">🔨</span>
        <div className="small-line"></div>
        <span className="chocolate-icon">🍫</span>
        <div className="small-line"></div>
        <span className="hammer-icon">🔨</span>
      </div>
      
      <p className="subtitle">Nos créations chocolatées plaidées avec gourmandise</p>
    </div>
  );
};

const DecorativeBanner = () => {
  return (
    <div className="decorative-banner chocolate-banner">
      <div className="banner-content">
        <h3>Délices chocolatés sous jugement</h3>
        <p>
          Découvrez notre sélection de recettes au chocolat, jugées par nos experts pâtissiers 
          et soumises à l'appréciation de tous les gourmands jurés.
        </p>
        <div className="background-icon">⚖️</div>
      </div>
    </div>
  );
};

const ChocolateTips = () => {
  return (
    <section className="tips-section">
      <h2>Conseils pour Réussir vos Recettes au Chocolat</h2>
      <div className="tips-container">
        <div className="tip-card">
          <div className="tip-icon">🍫</div>
          <h3>Choix du Chocolat</h3>
          <p>Utilisez du chocolat de bonne qualité, avec un minimum de 60% de cacao pour un goût riche et intense.</p>
        </div>
        <div className="tip-card">
          <div className="tip-icon">🌡️</div>
          <h3>Température</h3>
          <p>Faites fondre le chocolat à basse température, idéalement au bain-marie, pour éviter qu'il ne brûle ou ne devienne granuleux.</p>
        </div>
        <div className="tip-card">
          <div className="tip-icon">💧</div>
          <h3>Humidité</h3>
          <p>Évitez tout contact avec l'eau : une seule goutte peut faire figer votre chocolat fondu.</p>
        </div>
      </div>
    </section>
  );
};

const Chocolat = () => {
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOption, setFilterOption] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        category: 'chocolat',
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

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

      // Recharger les recettes pour mettre à jour les notes
      await fetchAllRecipes();
      
      // Mettre à jour la recette sélectionnée si elle est ouverte
      if (selectedRecipe && selectedRecipe.id === recipeId) {
        const updatedRecipes = await recipeFacade.getAllRecipes({ category: 'chocolat' });
        const recipesArray = updatedRecipes?.data || updatedRecipes || [];
        const updatedRecipe = recipesArray.find(r => r.id === recipeId);
        if (updatedRecipe) {
          setSelectedRecipe(updatedRecipe);
        }
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
      <div className="chocolat-page">
        <Header />
        <main className="chocolat-container">
          <JudicialHeader />
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des recettes chocolat...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chocolat-page">
        <Header />
        <main className="chocolat-container">
          <JudicialHeader />
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
      <div className="chocolat-page">
        <Header />
        
        <main className="chocolat-container">
          <JudicialHeader />
          
          <div className="search-and-filter-bar">
            <form className="search-form">
              <input
                type="text"
                placeholder="Rechercher une recette chocolat..."
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
          
          <DecorativeBanner />
          <ChocolateTips />
          
          <div className="page-title">
            Recettes Chocolat
            <span className="recipes-count">({allRecipes.length} recette{allRecipes.length > 1 ? 's' : ''})</span>
          </div>
          
          {sortedRecipes.length === 0 && (
            <div className="no-recipes">
              <div className="no-recipes-icon">🍫</div>
              <h3>
                {searchQuery.trim() !== '' 
                  ? 'Aucune recette chocolat trouvée' 
                  : allRecipes.length === 0
                    ? 'Aucune recette chocolat disponible'
                    : 'Aucune recette ne correspond à votre recherche'}
              </h3>
              <p>
                {searchQuery.trim() !== '' 
                  ? 'Essayez de modifier vos critères de recherche.' 
                  : 'Soyez le premier à ajouter une délicieuse recette chocolat !'}
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

      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRateRecipe={handleRateRecipe}
      />
    </>
  );
};

export default Chocolat;
