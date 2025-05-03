import React, { useState } from 'react';
import './Patisserie.css';
import Header from '../../components/Header/header';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import RecipeForm from '../../components/RecipeForm/RecipeForm';

const Patisserie = () => {
  const [filterOption, setFilterOption] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // État pour les recettes
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      title: "Tarte au Citron Meringuée",
      category: "Patisserie",
      description: "Une tarte acidulée avec une meringue légère et fondante. Un équilibre parfait entre douceur et acidité.",
      date: "2025-01-15",
      averageRating: 5,
      voteCount: 5,
      image: "/assets/images/lemon-tart.jpg",
      ingredients: [
        "1 pâte sablée",
        "4 citrons bio",
        "150g de sucre",
        "3 œufs",
        "100g de beurre",
        "4 blancs d'œufs",
        "200g de sucre pour la meringue"
      ],
      steps: [
        "Étaler la pâte dans un moule à tarte et la faire précuire 10 minutes à 180°C.",
        "Mélanger le jus et le zeste des citrons avec le sucre et les œufs.",
        "Faire chauffer le mélange à feu doux en ajoutant le beurre, jusqu'à épaississement.",
        "Verser sur le fond de tarte et laisser refroidir.",
        "Monter les blancs en neige en ajoutant progressivement le sucre.",
        "Recouvrir la tarte avec la meringue et faire dorer au four ou au chalumeau."
      ]
    },
    {
      id: 2,
      title: "Paris-Brest",
      category: "Patisserie",
      description: "Un classique de la pâtisserie française avec une délicieuse crème pralinée et une pâte à choux croustillante.",
      date: "2025-02-05",
      averageRating: 4,
      voteCount: 3,
      image: "/assets/images/paris-brest.jpg",
      ingredients: [
        "250ml d'eau",
        "100g de beurre",
        "150g de farine",
        "4 œufs",
        "1 pincée de sel",
        "500ml de lait",
        "125g de sucre",
        "100g de pralin",
        "6 jaunes d'œufs"
      ],
      steps: [
        "Préparer la pâte à choux et la dresser en couronne sur une plaque.",
        "Cuire au four à 200°C pendant 25-30 minutes.",
        "Préparer une crème pâtissière, y incorporer le pralin.",
        "Couper la pâte à choux refroidie en deux horizontalement.",
        "Garnir de crème pralinée et refermer.",
        "Saupoudrer de sucre glace et de quelques amandes effilées."
      ]
    },
    {
      id: 3,
      title: "Éclair au Café",
      category: "Patisserie",
      description: "L'éclair au café, une pâtisserie élégante avec une pâte à choux légère, garnie d'une crème pâtissière au café et recouverte d'un glaçage café.",
      date: "2025-03-10",
      averageRating: 4.5,
      voteCount: 6,
      image: "/assets/images/coffee-eclair.jpg",
      ingredients: [
        "125ml d'eau",
        "50g de beurre",
        "75g de farine",
        "2 œufs",
        "1 pincée de sel",
        "250ml de lait",
        "2 jaunes d'œufs",
        "60g de sucre",
        "20g de farine",
        "15g d'extrait de café",
        "150g de sucre glace",
        "30ml de café fort"
      ],
      steps: [
        "Préparer la pâte à choux et la dresser en forme d'éclair.",
        "Cuire au four à 180°C pendant 25 minutes.",
        "Préparer une crème pâtissière et y incorporer l'extrait de café.",
        "Percer les éclairs refroidis et les garnir de crème.",
        "Préparer un glaçage au café et l'appliquer sur les éclairs.",
        "Réfrigérer au moins 1 heure avant de servir."
      ]
    }
  ]);

  const handleRateRecipe = (recipeId, rating) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => {
        if (recipe.id === recipeId) {
          const newVoteCount = recipe.voteCount + 1;
          const newTotalRating = (recipe.averageRating * recipe.voteCount) + rating;
          const newAverageRating = newTotalRating / newVoteCount;
          
          return {
            ...recipe,
            voteCount: newVoteCount,
            averageRating: newAverageRating
          };
        }
        return recipe;
      })
    );
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };
  
  const handleAddRecipe = (recipeData) => {
    const newRecipe = {
      ...recipeData,
      id: recipes.length + 1,
      date: new Date().toISOString().split('T')[0],
      averageRating: 0,
      voteCount: 0
    };
    
    setRecipes([...recipes, newRecipe]);
    setShowAddForm(false);
  };
  
  // Filtrage des recettes en fonction de la recherche
  const filteredBySearch = searchQuery.trim() === '' 
    ? recipes 
    : recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Tri des recettes en fonction du filtre sélectionné
  const sortedRecipes = [...filteredBySearch].sort((a, b) => {
    switch(filterOption) {
      case 'recent':
        return new Date(b.date) - new Date(a.date);
      case 'rating':
        return b.averageRating - a.averageRating;
      case 'popular':
        return b.voteCount - a.voteCount;
      default:
        return 0;
    }
  });

  return (
    <div className="patisserie-page">
      <Header />
      
      <main className="patisserie-container">
        <h1 className="page-title">Pâtisseries</h1>
        
        <div className="toolbar">
          <div className="filter-search-container">
            <div className="search-box">
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Rechercher une recette..." 
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
          
          <button 
            className="add-recipe-btn" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Annuler' : 'Ajouter une recette'}
          </button>
        </div>
        
        {showAddForm ? (
          <RecipeForm 
            onAddRecipe={handleAddRecipe} 
            onCancel={() => setShowAddForm(false)} 
          />
        ) : (
          <>
            {sortedRecipes.length === 0 ? (
              <div className="no-recipes">
                <h3>Aucune recette trouvée</h3>
                <p>Essayez de modifier vos critères de recherche ou ajoutez une nouvelle recette.</p>
              </div>
            ) : (
              <div className="recipe-grid">
                {sortedRecipes.map(recipe => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    onRateRecipe={handleRateRecipe} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Patisserie;
