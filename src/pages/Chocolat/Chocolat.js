import React, { useState, useEffect } from 'react';
import './Chocolat.css';

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
    case 'Gâteaux':
      bgColorClass = 'bg-gateau';
      break;
    case 'Mousses':
      bgColorClass = 'bg-mousse';
      break;
    case 'Truffes':
      bgColorClass = 'bg-truffe';
      break;
    case 'Fondants':
      bgColorClass = 'bg-fondant';
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
        return "Intensité exceptionnelle !";
      case 4:
        return "Fondant approuvé";
      case 3:
        return "Saveur en délibération";
      case 2:
        return "Accusé de manque d'onctuosité";
      case 1:
        return "Coupable d'amertume excessive";
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
        <h3>Tribunal du Chocolat</h3>
        <div className="small-line"></div>
      </div>
      
      <div className="filter-buttons">
        <button 
          className={`filter-btn ${activeCategory === 'Toutes' ? 'active' : ''}`}
          onClick={() => onCategoryChange('Toutes')}
        >
          Toutes les recettes
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

// Composant pour les conseils de chocolat
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

// Nouveau composant pour une bannière décorative
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

// Composant principal de la page Chocolat
const ChocolatPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const categories = ['Gâteaux', 'Mousses', 'Truffes', 'Fondants'];

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
            title: 'Fondant au Chocolat',
            description: 'Un dessert incontournable avec un cœur coulant au chocolat noir intense. À servir tiède avec une boule de glace vanille.',
            image: '/images/chocolat/fondant-chocolat.jpg',
            category: 'Fondants',
            rating: 5,
            votes: 12,
            date: '5 février 2025',
            prepTime: 30,
            popularity: 160
          },
          {
            id: 2,
            title: 'Mousse au Chocolat Classique',
            description: 'Une mousse aérienne et légère au chocolat noir. Le dessert parfait pour terminer un repas sur une note gourmande.',
            image: '/images/chocolat/mousse-chocolat.jpg',
            category: 'Mousses',
            rating: 4,
            votes: 8,
            date: '15 mars 2025',
            prepTime: 25,
            popularity: 120
          },
          {
            id: 3,
            title: 'Truffes au Chocolat et Grand Marnier',
            description: 'Des truffes délicates au chocolat noir parfumées au Grand Marnier. Idéales pour les fêtes ou comme cadeau gourmand.',
            image: '/images/chocolat/truffes-chocolat.jpg',
            category: 'Truffes',
            rating: 5,
            votes: 7,
            date: '20 mars 2025',
            prepTime: 45,
            popularity: 95
          },
          {
            id: 4,
            title: 'Gâteau au Chocolat Sans Farine',
            description: 'Un gâteau au chocolat intense et moelleux, sans farine mais avec des amandes moulues. Parfait pour les intolérants au gluten.',
            image: '/images/chocolat/gateau-sans-farine.jpg',
            category: 'Gâteaux',
            rating: 5,
            votes: 9,
            date: '10 avril 2025',
            prepTime: 40,
            popularity: 130
          },
          {
            id: 5,
            title: 'Mousse au Chocolat Blanc et Framboises',
            description: 'Une mousse légère au chocolat blanc parsemée de framboises fraîches. Un dessert élégant pour vos dîners.',
            image: '/images/chocolat/mousse-chocolat-blanc.jpg',
            category: 'Mousses',
            rating: 4,
            votes: 6,
            date: '2 avril 2025',
            prepTime: 35,
            popularity: 85
          },
          {
            id: 6,
            title: 'Fondant Chocolat-Caramel',
            description: 'Un fondant au chocolat avec un cœur de caramel coulant. L\'alliance parfaite entre l\'amertume du chocolat et la douceur du caramel.',
            image: '/images/chocolat/fondant-caramel.jpg',
            category: 'Fondants',
            rating: 5,
            votes: 10,
            date: '25 février 2025',
            prepTime: 40,
            popularity: 145
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
    <div className="chocolat-page">
      <JudicialHeader />
      
      <SearchAndFilterBar 
        onSearch={handleSearch}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
      
      <DecorativeBanner />
      
      <ChocolateTips />
      
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
              <p className="no-recipes-title">Aucune recette à présenter</p>
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

export default ChocolatPage;
