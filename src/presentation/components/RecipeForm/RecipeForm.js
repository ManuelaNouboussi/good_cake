import React, { useState } from 'react';
import './RecipeForm.css';

const RecipeForm = ({ onAddRecipe, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'patisserie',
        ingredients: [''],
        steps: [''],
        image: '/assets/images/placeholder.jpg' // Image par défaut
    });
    
    const [errors, setErrors] = useState({});
    
    // Gérer les changements dans les champs simples
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Effacer l'erreur quand l'utilisateur commence à corriger
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };
    
    // Gérer les changements dans les ingrédients
    const handleIngredientChange = (index, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = value;
        
        setFormData(prev => ({
            ...prev,
            ingredients: newIngredients
        }));
    };
    
    // Ajouter un nouvel ingrédient
    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, '']
        }));
    };
    
    // Supprimer un ingrédient
    const removeIngredient = (index) => {
        if (formData.ingredients.length > 1) {
            const newIngredients = formData.ingredients.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                ingredients: newIngredients
            }));
        }
    };
    
    // Gérer les changements dans les étapes
    const handleStepChange = (index, value) => {
        const newSteps = [...formData.steps];
        newSteps[index] = value;
        
        setFormData(prev => ({
            ...prev,
            steps: newSteps
        }));
    };
    
    // Ajouter une nouvelle étape
    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, '']
        }));
    };
    
    // Supprimer une étape
    const removeStep = (index) => {
        if (formData.steps.length > 1) {
            const newSteps = formData.steps.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                steps: newSteps
            }));
        }
    };
    
    // Gérer la soumission du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Le titre est requis';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'La description est requise';
        }
        
        const emptyIngredients = formData.ingredients.some(ing => !ing.trim());
        if (emptyIngredients) {
            newErrors.ingredients = 'Tous les ingrédients doivent être remplis';
        }
        
        const emptySteps = formData.steps.some(step => !step.trim());
        if (emptySteps) {
            newErrors.steps = 'Toutes les étapes doivent être remplies';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // Si la validation est réussie, ajouter la recette
        onAddRecipe(formData);
    };
    
    return (
        <div className="recipe-form-container">
            <div className="recipe-form-header">
                <h2>Ajouter une nouvelle recette</h2>
                <p>Partagez votre chef-d'œuvre culinaire avec la communauté</p>
            </div>
            
            <form className="recipe-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Titre de la recette *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={errors.title ? 'error' : ''}
                    />
                    {errors.title && <span className="error-message">{errors.title}</span>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className={errors.description ? 'error' : ''}
                    ></textarea>
                    {errors.description && <span className="error-message">{errors.description}</span>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="category">Catégorie *</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="patisserie">Pâtisserie</option>
                        <option value="chocolat">Chocolat</option>
                        <option value="glaces">Glaces</option>
                        <option value="confiserie">Confiserie</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Ingrédients *</label>
                    {formData.ingredients.map((ingredient, index) => (
                        <div key={index} className="list-item">
                            <input
                                type="text"
                                value={ingredient}
                                onChange={(e) => handleIngredientChange(index, e.target.value)}
                                placeholder="ex: 200g de farine"
                            />
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeIngredient(index)}
                                disabled={formData.ingredients.length <= 1}
                            >
                                -
                            </button>
                        </div>
                    ))}
                    {errors.ingredients && <span className="error-message">{errors.ingredients}</span>}
                    <button type="button" className="add-btn" onClick={addIngredient}>
                        + Ajouter un ingrédient
                    </button>
                </div>
                
                <div className="form-group">
                    <label>Étapes de préparation *</label>
                    {formData.steps.map((step, index) => (
                        <div key={index} className="list-item">
                            <textarea
                                value={step}
                                onChange={(e) => handleStepChange(index, e.target.value)}
                                placeholder={`Étape ${index + 1}`}
                                rows="2"
                            ></textarea>
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeStep(index)}
                                disabled={formData.steps.length <= 1}
                            >
                                -
                            </button>
                        </div>
                    ))}
                    {errors.steps && <span className="error-message">{errors.steps}</span>}
                    <button type="button" className="add-btn" onClick={addStep}>
                        + Ajouter une étape
                    </button>
                </div>
                
                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onCancel}>
                        Annuler
                    </button>
                    <button type="submit" className="submit-btn">
                        Soumettre la recette
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RecipeForm;
