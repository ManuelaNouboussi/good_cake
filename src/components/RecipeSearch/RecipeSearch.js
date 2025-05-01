import React, { useState } from 'react';
import './RecipeSearch.css';

const RecipeSearch = ({ searchTerm, onSearchChange, sortOption, onSortChange, onAddRecipeClick }) => {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
        <section className="recipe-search">
            <div className="search-container">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Rechercher une recette..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="search-input"
                        aria-label="Rechercher une recette"
                    />
                </div>
                
                <div className="filter-group">
                    <label htmlFor="sort-select" className="sort-label">Trier par:</label>
                    <select
                        id="sort-select"
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="sort-select"
                        aria-label="Options de tri"
                    >
                        <option value="newest">Plus récentes</option>
                        <option value="highest">Meilleures notes</option>
                        <option value="popular">Plus populaires</option>
                    </select>
                </div>
                
                <button 
                    className="add-recipe-btn" 
                    onClick={onAddRecipeClick}
                    aria-label="Ajouter une nouvelle recette"
                >
                    <span className="add-icon">+</span>
                    Ajouter une recette
                </button>
            </div>
            
            <div className="search-tagline">
                <p>La justice pâtissière n'attend pas. Trouvez la recette parfaite pour votre prochain verdict gourmand.</p>
            </div>
        </section>
    );
};

export default RecipeSearch;