import React, { useState, useEffect } from 'react';
import './Glaces.css';

// Composant de barre de recherche et de tri
const SearchAndFilterBar = ({ onSearch, sortOrder, onSortChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  return (
    <div className="search-and-filter-bar">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          placeholder="Rechercher une recette..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </form>
      
      <div className="sort-container">
        <span className="sort-label">Trier par:</span>
        <div className="sort-dropdown">
          <select 
            value={sortOrder} 
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Plus récentes</option>
            <option value="popular">Plus populaires</option>
            <option value="rating">Meilleures notes</option>
          </select>
        </div>
      </div>
      
      <button className="add-recipe-small-btn">
        Ajouter une recette
      </button>
    </div>
  );
};

// Composant pour l'en-tête stylisé avec éléments judiciaires
const JudicialHeader = () => {
  return (
    <div className="judicial-header">
      <div className="decorative-line">
        <div className="line"></div>
        <div className="scale-icon">⚖️</div>
        <div className="line"></div>
      </div>
      
      <h1>Glaces</h1>
      
      <div className="decorative-elements">
        <span className="hammer-icon">🔨</span>
        <div className="small-line"></div>
        <span className="icecream-icon">🍦</span>
        <div className="small-line"></div>
        <span className="hammer-icon">🔨</span>
      </div>
      
      <p className="subtitle">Nos créations glacées plaidées avec gourmandise</p>
    </div>
  );
};

// Composant pour afficher les marteaux de notation avec effet visuel
const JudicialRating = ({ rating, votes }) => {
  return (
    <div className="judicial-rating">
      <div className="hammers-container">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="hammer-wrapper">
            <span className={`hammer ${index < rating ? 'active' : ''}`}>
              🔨
            </span>
            {index < rating && <div className="hammer-shadow"></div>}
          </div>
        ))}
      </div>
      <span className="votes-count">({votes} votes)</span>
    </div>
  );
};

// Composant pour les étiquettes de catégorie avec style judiciaire
const CategoryBadge = ({ category }) => {
  let bgColorClass = '';
  
  switch(category) {
    case 'Crèmes glacées':
      bgColorClass = 'bg-creme';
      break;
    case 'Sorbets':
      bgColorClass = 'bg-sorbet';
      break;
    case 'Parfaits':
      bgColorClass = 'bg-parfait';
      break;
    case 'Glaces maison':
      bgColorClass = 'bg-maison';
      break;
    default:
      bgColorClass = 'bg-default';
  }
  
  return (
    <div className={`category-badge ${bgColorClass}`}>
      <span className="category-icon">⚖️</span>
      {category}
    </div>
  );
};

// Composant carte de recette amélioré
const RecipeCard = ({ recipe }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Fonction pour générer un verdict basé sur la note
  const getVerdict = (rating) => {
    switch(rating) {
      case 5:
        return "Acquittement unanime !";
      case 4:
        return "Circonstances favorables";
      case 3:
        return "Délibération en cours";
      case 2:
        return "Mise en examen";
      case 1:
        return "Coupable de médiocrité";
      default:
        return "";
    }
  };
  
  return (
    <div 
      className={`recipe-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CategoryBadge category={recipe.category} />
      
      <div className="recipe-image-container">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="recipe-image"
        />
        {isHovered && (
          <div className="verdict-overlay">
            <div className="verdict-bubble">
              <p>{getVerdict(recipe.rating)}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>
        
        <JudicialRating rating={recipe.rating} votes={recipe.votes} />
        
        <p className="recipe-description">
          {recipe.description}
        </p>
        
        <div className="recipe-footer">
          <div className="recipe-date">Ajoutée le {recipe.date}</div>
          <div className="recipe-time">Temps: {recipe.prepTime} min</div>
        </div>
        
        <div className="recipe-actions">
          <button className="btn-consult">Consulter</button>
          <button className="btn-judge">
            <span className="judge-icon">🔨</span> Juger
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant pour les filtres stylisés comme un formulaire judiciaire
const JudicialFilters = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="judicial-filters">
      <div className="filters-header">
        <div className="small-line"></div>
        <h3>Tribunal des Desserts Glacés</h3>
        <div className="small-line"></div>
      </div>
      
      <div className="filter-buttons">
        <button 
          className={`filter-btn ${activeCategory === 'Toutes' ? 'active' : ''}`}
          onClick={() => onCategoryChange('Toutes')}
        >
          Toutes les preuves
        </button>
        
        {categories.map(category => (
          <button 
            key={category}
            className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

// Nouveau composant pour une bannière décorative
const DecorativeBanner = () => {
  return (
    <div className="decorative-banner">
      <div className="banner-content">
        <h3>Délices glacés sous jugement</h3>
        <p>
          Découvrez notre sélection de desserts glacés, jugés par nos experts pâtissiers 
          et soumis à l'appréciation de tous les gourmands jurés.
        </p>
        
        <div className="background-icon">⚖️</div>
      </div>
    </div>
  );
};

// Composant principal de la page Glaces
const GlacesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const categories = ['Crèmes glacées', 'Sorbets', 'Parfaits', 'Glaces maison'];

  // Simuler le chargement des données
  useEffect(() => {
    // Ici, vous feriez normalement un appel API pour récupérer les recettes
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simuler un délai de récupération des données
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Données fictives des recettes
        const mockRecipes = [
          {
            id: 1,
            title: 'Glace à la Vanille Maison',
            description: 'Une glace onctueuse avec de véritables gousses de vanille. La recette parfaite pour les chaudes journées d\'été.',
            image: '/images/glaces/vanille-maison.jpg',
            category: 'Crèmes glacées',
            rating: 5,
            votes: 6,
            date: '10 mars 2025',
            prepTime: 40,
            popularity: 120
          },
          {
            id: 2,
            title: 'Sorbet aux Fruits Rouges',
            description: 'Un sorbet rafraîchissant aux fruits rouges, parfait pour les journées d\'été. Sans produits laitiers et débordant de saveurs naturelles.',
            image: '/images/glaces/sorbet-fruits-rouges.jpg',
            category: 'Sorbets',
            rating: 4,
            votes: 8,
            date: '15 avril 2025',
            prepTime: 35,
            popularity: 95
          },
          {
            id: 3,
            title: 'Parfait au Café',
            description: 'Un dessert élégant au café, avec une texture légère et aérée. À servir lors de vos dîners pour impressionner vos invités.',
            image: '/images/glaces/parfait-cafe.jpg',
            category: 'Parfaits',
            rating: 5,
            votes: 7,
            date: '5 février 2025',
            prepTime: 45,
            popularity: 110
          },
          {
            id: 4,
            title: 'Glace au Chocolat Noir Intense',
            description: 'Une glace riche et intense au chocolat noir, avec des morceaux de chocolat fondants. Pour les vrais amateurs de chocolat.',
            image: '/images/glaces/chocolat-noir.jpg',
            category: 'Crèmes glacées',
            rating: 5,
            votes: 9,
            date: '20 mars 2025',
            prepTime: 50,
            popularity: 150
          },
          {
            id: 5,
            title: 'Sorbet au Citron',
            description: 'Un sorbet au citron rafraîchissant et légèrement acidulé. Parfait comme dessert léger après un repas ou comme pause fraîcheur.',
            image: '/images/glaces/sorbet-citron.jpg',
            category: 'Sorbets',
            rating: 4,
            votes: 5,
            date: '12 avril 2025',
            prepTime: 30,
            popularity: 85
          },
          {
            id: 6,
            title: 'Glace à la Pistache Gourmande',
            description: 'Une crème glacée à la pistache avec des morceaux croquants. Un délice pour les amateurs de saveurs authentiques et gourmandes.',
            image: '/images/glaces/pistache.jpg',
            category: 'Glaces maison',
            rating: 4,
            votes: 4,
            date: '3 mars 2025',
            prepTime: 60,
            popularity: 70
          }
        ];
        
        setRecipes(mockRecipes);
      } catch (error) {
        console.error('Erreur lors du chargement des recettes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Appliquer les filtres, la recherche et le tri chaque fois que les dépendances changent
  useEffect(() => {
    let result = [...recipes];
    
    // Filtrer par catégorie
    if (activeCategory !== 'Toutes') {
      result = result.filter(recipe => recipe.category === activeCategory);
    }
    
    // Filtrer par recherche
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(recipe => 
        recipe.title.toLowerCase().includes(query) || 
        recipe.description.toLowerCase().includes(query)
      );
    }
    
    // Trier les résultats
    switch (sortOrder) {
      case 'recent':
        // Tri par date (du plus récent au plus ancien)
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'popular':
        // Tri par popularité (décroissante)
        result.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'rating':
        // Tri par note (décroissante), puis par nombre de votes (décroissant)
        result.sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return b.votes - a.votes;
        });
        break;
      default:
        break;
    }
    
    setFilteredRecipes(result);
  }, [recipes, activeCategory, searchQuery, sortOrder]);

  // Gestionnaire de recherche
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  // Gestionnaire de changement de catégorie
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  // Gestionnaire de changement de tri
  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  return (
    <div className="glaces-page">
      <JudicialHeader />
      
      <SearchAndFilterBar 
        onSearch={handleSearch}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
      
      <DecorativeBanner />
      
      <JudicialFilters 
        categories={categories} 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange} 
      />

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des recettes...</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <div className="no-recipes">
              <p className="no-recipes-title">Aucune preuve à présenter</p>
              <p className="no-recipes-subtitle">
                {searchQuery ? 
                  `Aucune recette ne correspond à votre recherche "${searchQuery}"` : 
                  "Aucune recette ne correspond à ces critères."
                }
              </p>
              <button 
                className="view-all-btn"
                onClick={() => {
                  setActiveCategory('Toutes');
                  setSearchQuery('');
                }}
              >
                Voir toutes les recettes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlacesPage;
