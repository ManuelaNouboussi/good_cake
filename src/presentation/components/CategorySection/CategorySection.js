import React from 'react';
import './CategorySection.css';

const CategorySection = ({ selectedCategory, onCategoryChange }) => {
    const categories = [
        {
            id: 'all',
            title: 'Toutes les recettes',
            image: '/assets/images/principal.png',
            description: 'Découvrez toutes nos recettes de pâtisseries, chocolats, glaces et confiseries.'
        },
        {
            id: 'patisserie',
            title: 'Pâtisserie',
            image: '/assets/images/gateauCerise.jpg',
            description: 'Des pâtisseries qui méritent d\'être acquittées de tous les péchés de gourmandise.'
        },
        {
            id: 'chocolat',
            title: 'Chocolat',
            image: '/assets/images/texture.jpg',
            description: 'Des chocolats dont la sentence est irrévocable : vous en redemanderez encore.'
        },
        {
            id: 'glaces',
            title: 'Glaces',
            image: '/assets/images/principal.png',
            description: 'Glaces et sorbets qui plaideront toujours en faveur de la fraîcheur.'
        },
        {
            id: 'confiserie',
            title: 'Confiserie',
            image: '/assets/images/tarteAuPomme.jpg',
            description: 'Confiseries et douceurs qui ne laisseront aucun jury indifférent.'
        }
    ];

    return (
        <section id="categories" className="categories">
            <h2 className="section-title">La cour des délices</h2>
            <p className="section-subtitle">Choisissez votre plaidoirie gourmande</p>
            
            <div className="category-grid">
                {categories.map((category) => (
                    <div 
                        key={category.id} 
                        className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => onCategoryChange(category.id)}
                    >
                        <img src={category.image} alt={category.title} className="category-img" />
                        <div className="category-content">
                            <h3>{category.title}</h3>
                            <p>{category.description}</p>
                            <div className="category-link">Sélectionner</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
