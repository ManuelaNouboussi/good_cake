// src/presentation/components/RecipeList/RecipeList.js
import React, { useState } from 'react';
import { useRecipes } from '../../hooks/useRecipes';
import RecipeCard from '../RecipeCard/RecipeCard';
import RecipeSearch from '../RecipeSearch/RecipeSearch';
import './RecipeList.css';

const RecipeList = () => {
  const {
    recipes,
    loading,
    error,
    loadAllRecipes,
    loadRecipesByCategory,
    searchRecipes,
    filterAndSearch,
    clearError
  } = useRecipes();

  const [currentSearch, setCurrentSearch] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');

  // Gérer la recherche
  const handleSearch = async (searchTerm) => {
    setCurrentSearch(searchTerm);
    await filterAndSearch(searchTerm, currentCategory);
  };

  // Gérer le filtre par catégorie
  const handleCategoryFilter = async (category) => {
    setCurrentCategory(category);
    await filterAndSearch(currentSearch, category);
  };

  // Rafraîchir après une action (vote, etc.)
  const handleRefresh = async () => {
    if (currentSearch || currentCategory) {
      await filterAndSearch(currentSearch, currentCategory);
    } else {
      await loadAllRecipes();
    }
  };

  if (error) {
    return (
      <div className="recipe-list-error">
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={() => {
          clearError();
          loadAllRecipes();
        }}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      <div className="recipe-list-header">
        <h1>Nos Recettes</h1>
        <RecipeSearch 
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
        />
      </div>

      {loading && (
        <div className="recipe-list-loading">
          <p>Chargement des recettes...</p>
        </div>
      )}

      <div className="recipe-list-content">
        {recipes.length === 0 && !loading ? (
          <div className="recipe-list-empty">
            <h3>Aucune recette trouvée</h3>
            <p>
              {currentSearch || currentCategory 
                ? 'Essayez d\'autres critères de recherche.'
                : 'Aucune recette disponible pour le moment.'
              }
            </p>
          </div>
        ) : (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeList;
