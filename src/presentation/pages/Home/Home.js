import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ showScene, setShowScene }) => {
    const categories = [
        {
            id: 'patisserie',
            title: 'Pâtisseries',
            description: 'Gâteaux, tartes, viennoiseries et autres douceurs sucrées.',
            recipeCount: 24,
            path: '/patisserie'
        },
        {
            id: 'chocolat',
            title: 'Chocolats',
            description: 'Ganaches, pralinés, tablettes et autres créations chocolatées.',
            recipeCount: 18,
            path: '/chocolat'
        },
        {
            id: 'glaces',
            title: 'Glaces',
            description: 'Crèmes glacées, sorbets, parfaits et desserts glacés.',
            recipeCount: 12,
            path: '/glaces'
        },
        {
            id: 'confiserie',
            title: 'Confiseries',
            description: 'Caramels, guimauves, pâtes de fruits et autres sucreries.',
            recipeCount: 15,
            path: '/confiserie'
        }
    ];

    const featuredRecipes = [
        {
            id: 'r1',
            title: 'Fondant au Chocolat',
            category: 'patisserie',
            author: 'Marie Dupont',
            date: '12/04/2025',
            rating: 4.8
        },
        {
            id: 'r2',
            title: 'Sorbet à la Framboise',
            category: 'glaces',
            author: 'Pierre Martin',
            date: '08/04/2025',
            rating: 4.7
        },
        {
            id: 'r3',
            title: 'Caramels au Beurre Salé',
            category: 'confiserie',
            author: 'Sophie Lefèvre',
            date: '15/04/2025',
            rating: 4.9
        }
    ];

    return (
        <div className="home-page">
            <main className="home-content">
                <section className="hero-banner">
                    {showScene ? (
                        <div className="scene-container">
                            <button className="toggle-scene" onClick={() => setShowScene(false)}>
                                Masquer l'animation 3D
                            </button>
                        </div>
                    ) : (
                        <div className="hero-content">
                            <h1>CAKE LAWYER</h1>
                            <p>Partagez, découvrez et collectionnez vos meilleures recettes de pâtisserie</p>
                            <button className="cta-button" onClick={() => setShowScene(true)}>
                                Voir l'animation 3D
                            </button>
                        </div>
                    )}
                </section>

                <section className="intro-section">
                    <h2>Bienvenue sur Cake Lawyer</h2>
                    <p>
                        Cake Lawyer est une plateforme communautaire dédiée aux passionnés de pâtisserie. 
                        Parcourez notre collection de recettes, partagez vos créations et découvrez 
                        de nouvelles inspirations pour ravir vos papilles.
                    </p>
                </section>
                
                <section className="categories-section">
                    <h2>Catégories de Recettes</h2>
                    <div className="categories-grid">
                        {categories.map(category => (
                            <Link to={category.path} className="category-card" key={category.id}>
                                <div className="category-content">
                                    <h3>{category.title}</h3>
                                    <p>{category.description}</p>
                                    <span className="recipe-count">{category.recipeCount} recettes</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
                
                <section className="featured-section">
                    <h2>Recettes à Découvrir</h2>
                    <div className="featured-grid">
                        {featuredRecipes.map(recipe => (
                            <div className="featured-card" key={recipe.id}>
                                <div className="featured-image">
                                    <div className="placeholder-image"></div>
                                </div>
                                <div className="featured-content">
                                    <h3>{recipe.title}</h3>
                                    <div className="featured-meta">
                                        <span className="category-tag">{recipe.category}</span>
                                        <span className="rating">★ {recipe.rating}</span>
                                    </div>
                                    <p className="author">Par {recipe.author} • {recipe.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="view-all">
                        <Link to="/patisserie" className="view-all-link">Explorer toutes les recettes</Link>
                    </div>
                </section>
                
                <section className="join-section">
                    <div className="join-content">
                        <h2>Partagez vos recettes</h2>
                        <p>
                            Vous avez une recette secrète de gâteau au chocolat ou une technique innovante 
                            pour réaliser des macarons parfaits? Rejoignez notre communauté et partagez 
                            votre savoir-faire avec des passionnés du monde entier.
                        </p>
                        <Link to="/contact" className="cta-button">Nous contacter</Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
