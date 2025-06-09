// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeFacade } from '../application/facades/recipeFacade';
import FeaturedSection from '../components/home/FeaturedSection';
import CategoryFilter from '../components/recipe/CategoryFilter';
import SortFilter from '../components/recipe/SortFilter';
import RecipeGrid from '../components/recipe/RecipeGrid';
import DatabaseStatus from '../components/common/DatabaseStatus';

const Home = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState(null);
  
  // Filtres
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState('desc');

  // Charger les recettes depuis Supabase
  const loadRecipes = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      console.log('🏠 Home: Chargement des recettes...');
      
      // Vérifier le statut de la base de données
      const dbStatus = await recipeFacade.getDatabaseStatus();
      setDatabaseStatus(dbStatus);
      console.log('🏠 Home: Statut DB:', dbStatus);

      // Charger les recettes si la DB est OK
      if (dbStatus.status === 'success' || dbStatus.status === 'warning') {
        const result = await recipeFacade.getAllRecipes({
          category: selectedCategory,
          sortBy: sortBy,
          order: sortOrder,
          limit: 50
        });

        console.log('🏠 Home: Résultat chargement:', result);

        if (result.success) {
          setRecipes(result.data || []);
          console.log('🏠 Home: Recettes chargées:', result.data?.length || 0);
        } else {
          throw new Error(result.error || 'Erreur lors du chargement des recettes');
        }
      } else {
        // Base de données vide ou erreur
        setRecipes([]);
      }
    } catch (err) {
      console.error('❌ Home: Erreur loadRecipes:', err);
      setError(err.message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage et quand les filtres changent
  useEffect(() => {
    loadRecipes();
  }, [selectedCategory, sortBy, sortOrder]);

  // Gestionnaires d'événements
  const handleCategoryChange = (category) => {
    console.log('🏠 Home: Changement catégorie:', category);
    setSelectedCategory(category);
  };

  const handleSortChange = (newSortBy, newOrder) => {
    console.log('🏠 Home: Changement tri:', newSortBy, newOrder);
    setSortBy(newSortBy);
    setSortOrder(newOrder);
  };

  const handleRecipeClick = (recipeId) => {
    console.log('🏠 Home: Clic sur recette:', recipeId);
    navigate(`/recipe/${recipeId}`);
  };

  const handleRetry = () => {
    console.log('🏠 Home: Nouvelle tentative de chargement');
    loadRecipes();
  };

  // Filtrer les recettes en vedette pour la section hero
  const featuredRecipes = recipes.filter(recipe => 
    recipe.is_featured || recipe.isFeatured || false
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec hero */}
      <div className="relative">
        {/* Image de fond */}
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl font-bold mb-4">
                🧑‍⚖️ Good Cake
              </h1>
              <p className="text-xl mb-8">
                Découvrez des recettes jugées par des experts gourmands
              </p>
              <button
                onClick={() => navigate('/recipes')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200"
              >
                Explorer les recettes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Statut de la base de données */}
        <DatabaseStatus 
          status={databaseStatus?.status}
          message={databaseStatus?.message}
          error={databaseStatus?.error}
          suggestion={databaseStatus?.suggestion}
          recipesCount={databaseStatus?.recipesCount}
          onRetry={handleRetry}
        />

        {/* Section des recettes en vedette */}
        {featuredRecipes.length > 0 && (
          <FeaturedSection 
            recipes={featuredRecipes}
            onRecipeClick={handleRecipeClick}
          />
        )}

        {/* Filtres et tri */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Toutes nos recettes
            </h2>
            <p className="text-gray-600">
              {loading ? 'Chargement...' : `${recipes.length} recette(s) disponible(s)`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
            <SortFilter 
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* Affichage des recettes */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="mt-4 text-gray-600">Chargement des recettes depuis Supabase...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">❌ Erreur de chargement</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              🔄 Réessayer
            </button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍰</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedCategory === 'all' ? 'Aucune recette trouvée' : `Aucune recette dans "${selectedCategory}"`}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory === 'all' 
                ? 'La base de données semble vide. Ajoutez des recettes pour commencer !'
                : 'Essayez une autre catégorie ou supprimez les filtres.'
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Voir toutes les recettes
              </button>
            )}
          </div>
        ) : (
          <RecipeGrid 
            recipes={recipes}
            onRecipeClick={handleRecipeClick}
          />
        )}

        {/* Section statistiques si on a des recettes */}
        {recipes.length > 0 && (
          <div className="mt-16 bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              📊 Statistiques de Good Cake
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">
                  {recipes.length}
                </div>
                <div className="text-gray-600">
                  Recette{recipes.length > 1 ? 's' : ''} disponible{recipes.length > 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">
                  {Math.round(recipes.reduce((sum, recipe) => sum + (recipe.average_gavels || recipe.averageRating || 0), 0) / recipes.length * 10) / 10 || 0}
                </div>
                <div className="text-gray-600">
                  Marteaux en moyenne
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">
                  {new Set(recipes.map(r => r.category_name || r.category)).size}
                </div>
                <div className="text-gray-600">
                  Catégorie{new Set(recipes.map(r => r.category_name || r.category)).size > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;