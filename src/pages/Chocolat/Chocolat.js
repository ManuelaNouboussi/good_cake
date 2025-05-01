import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Chocolat.css';

// Données de recettes fictives pour la démo
const initialRecipes = [
  {
    id: 'choc1',
    title: 'Truffes au Chocolat Noir',
    description: 'Des truffes au chocolat noir onctueuses, enrobées de cacao en poudre. Un classique irrésistible pour les amateurs de chocolat.',
    difficulty: 'Facile',
    time: '45 min',
    ingredients: [
      '200g de chocolat noir', 
      '100ml de crème fraîche épaisse', 
      '30g de beurre', 
      '1 c. à café d\'extrait de vanille', 
      'Cacao en poudre pour l\'enrobage'
    ],
    rating: 4.7,
    votes: 35,
    author: 'Philippe M.',
    date: '2023-02-05'
  },
  {
    id: 'choc2',
    title: 'Mousse au Chocolat Classique',
    description: 'Une mousse au chocolat légère et aérienne, préparée avec du chocolat noir de qualité et des œufs frais.',
    difficulty: 'Intermédiaire',
    time: '30 min + 4h de repos',
    ingredients: [
      '200g de chocolat noir', 
      '6 œufs', 
      '50g de sucre', 
      '1 pincée de sel'
    ],
    rating: 4.9,
    votes: 48,
    author: 'Claire D.',
    date: '2023-04-12'
  },
  {
    id: 'choc3',
    title: 'Ganache Montée au Chocolat',
    description: 'Une ganache aérienne parfaite pour garnir vos gâteaux ou pour être dégustée nature comme une mousse légère.',
    difficulty: 'Intermédiaire',
    time: '20 min + 3h de repos',
    ingredients: [
      '200g de chocolat noir ou au lait', 
      '400ml de crème fraîche liquide', 
      '20g de miel'
    ],
    rating: 4.6,
    votes: 27,
    author: 'Antoine L.',
    date: '2023-06-23'
  },
  {
    id: 'choc4',
    title: 'Mendiants au Chocolat et Fruits Secs',
    description: 'De délicieux disques de chocolat garnis de fruits secs et confits. Une confiserie élégante et facile à réaliser.',
    difficulty: 'Facile',
    time: '30 min',
    ingredients: [
      '200g de chocolat noir', 
      '200g de chocolat au lait', 
      'Amandes entières', 
      'Pistaches', 
      'Noisettes', 
      'Écorces d\'orange confites'
    ],
    rating: 4.5,
    votes: 19,
    author: 'Émilie R.',
    date: '2023-01-18'
  }
];

const Chocolat = () => {
    const [recipes, setRecipes] = useState(initialRecipes);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    
    // Filtrer les recettes par terme de recherche et difficulté
    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = filterDifficulty === 'all' || 
                               recipe.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
        
        return matchesSearch && matchesDifficulty;
    });
    
    return (
        <div className="chocolat-page">
            <main className="chocolat-content">
                <section className="hero-section">
                    <h1>Recettes au Chocolat</h1>
                    <p>Explorez notre collection de recettes au chocolat, des classiques intemporels aux créations innovantes. Le plaisir du chocolat dans toute sa splendeur.</p>
                </section>
                
                <section className="search-section">
                    <div className="search-container">
                        <input 
                            type="text" 
                            placeholder="Rechercher une recette..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <div className="filter-dropdown">
                            <select 
                                value={filterDifficulty} 
                                onChange={(e) => setFilterDifficulty(e.target.value)}
                            >
                                <option value="all">Toutes difficultés</option>
                                <option value="facile">Facile</option>
                                <option value="intermédiaire">Intermédiaire</option>
                                <option value="avancé">Avancé</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                    </div>
                    <button className="add-recipe-button">Partager une Recette</button>
                </section>
                
                <section className="recipes-section">
                    <h2>Nos Recettes au Chocolat</h2>
                    <div className="recipes-list">
                        {filteredRecipes.map(recipe => (
                            <div key={recipe.id} className="recipe-card">
                                <div className="recipe-header">
                                    <div className="recipe-image">
                                        <div className="placeholder-image"></div>
                                    </div>
                                    <div className="recipe-overlay">
                                        <span className="recipe-difficulty">{recipe.difficulty}</span>
                                        <span className="recipe-time">{recipe.time}</span>
                                    </div>
                                </div>
                                <div className="recipe-body">
                                    <h3 className="recipe-title">{recipe.title}</h3>
                                    <p className="recipe-description">{recipe.description}</p>
                                    <div className="recipe-rating">
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <span 
                                                    key={i} 
                                                    className={`star ${i < Math.floor(recipe.rating) ? 'filled' : ''}`}
                                                >★</span>
                                            ))}
                                        </div>
                                        <span className="rating-number">{recipe.rating.toFixed(1)}</span>
                                        <span className="votes-number">({recipe.votes})</span>
                                    </div>
                                    <div className="recipe-footer">
                                        <span className="recipe-author">Par {recipe.author}</span>
                                        <button className="view-recipe-btn">Voir la recette</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
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
                
                <section className="community-section">
                    <h2>Rejoignez Notre Communauté</h2>
                    <p>Partagez vos propres recettes, posez des questions et échangez avec d'autres passionnés de chocolat. Que vous soyez débutant ou expert, votre contribution est précieuse.</p>
                    <div className="community-actions">
                        <button className="primary-button">Créer un Compte</button>
                        <Link to="/contact" className="secondary-link">En Savoir Plus</Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Chocolat;
