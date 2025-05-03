import React, { useState } from 'react';
import './FeaturedSection.css';
import RecipeCard from '../RecipeCard/RecipeCard';

const FeaturedSection = ({ recipes, onRateRecipe }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 6;
    
    // Calcul pour la pagination
    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
    const totalPages = Math.ceil(recipes.length / recipesPerPage);
    
    // Changement de page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    return (
        <section className="featured" id="recettes">
            <h2 className="section-title">Le verdict est tombé</h2>
            <p className="section-subtitle">Nos recettes plaidées avec gourmandise</p>
            
            {recipes.length === 0 ? (
                <div className="no-recipes">
                    <h3>Aucune recette trouvée</h3>
                    <p>Essayez de modifier vos critères de recherche ou ajoutez une nouvelle recette.</p>
                </div>
            ) : (
                <>
                    <div className="recipe-grid">
                        {currentRecipes.map((recipe) => (
                            <RecipeCard 
                                key={recipe.id} 
                                recipe={recipe} 
                                onRateRecipe={onRateRecipe} 
                            />
                        ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => paginate(currentPage - 1)} 
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                &laquo; Précédent
                            </button>
                            
                            <div className="page-numbers">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                    <button 
                                        key={num} 
                                        onClick={() => paginate(num)}
                                        className={`page-number ${currentPage === num ? 'active' : ''}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => paginate(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Suivant &raquo;
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default FeaturedSection;
