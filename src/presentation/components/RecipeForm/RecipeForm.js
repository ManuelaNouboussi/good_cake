import React, { useState, useEffect } from 'react';
import { recipeFacade } from '../../../application/facades/recipeFacade';
import './RecipeForm.css';

const RecipeForm = ({ onAddRecipe, onCancel }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        ingredients: [''],
        steps: [''],
        imageUrl: '/assets/images/placeholder.jpg',
        preparationTime: '',
        cookingTime: '',
        difficulty: 'moyen',
        servings: ''
    });
    
    const [errors, setErrors] = useState({});
    
    // Charger les catégories depuis Supabase
    useEffect(() => {
        async function loadCategories() {
            try {
                const cats = await recipeFacade.getAllCategories();
                setCategories(cats);
                // Définir la première catégorie par défaut
                if (cats.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        categoryId: cats[0].id
                    }));
                }
            } catch (err) {
                console.error('Erreur chargement catégories:', err);
                alert('Erreur lors du chargement des catégories');
            } finally {
                setLoading(false);
            }
        }
        loadCategories();
    }, []);
    
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Le titre est requis';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'La description est requise';
        }
        
        if (!formData.categoryId) {
            newErrors.categoryId = 'La catégorie est requise';
        }
        
        if (!formData.preparationTime) {
            newErrors.preparationTime = 'Le temps de préparation est requis';
        }
        
        if (!formData.cookingTime) {
            newErrors.cookingTime = 'Le temps de cuisson est requis';
        }
        
        if (!formData.servings) {
            newErrors.servings = 'Le nombre de portions est requis';
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
        
        // Préparer les données pour Supabase
        const recipeData = {
            title: formData.title,
            description: formData.description,
            categoryId: formData.categoryId,
            ingredients: formData.ingredients.filter(ing => ing.trim()),
            steps: formData.steps.filter(step => step.trim()),
            imageUrl: formData.imageUrl,
            preparationTime: parseInt(formData.preparationTime),
            cookingTime: parseInt(formData.cookingTime),
            difficulty: formData.difficulty,
            servings: parseInt(formData.servings)
        };
        
        // Appeler la fonction onAddRecipe avec les données formatées
        onAddRecipe(recipeData);
    };
    
    if (loading) {
        return <div className="loading">Chargement des catégories...</div>;
    }
    
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
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="categoryId">Catégorie *</label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            className={errors.categoryId ? 'error' : ''}
                        >
                            <option value="">Sélectionnez une catégorie</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="difficulty">Difficulté *</label>
                        <select
                            id="difficulty"
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                        >
                            <option value="facile">Facile</option>
                            <option value="moyen">Moyen</option>
                            <option value="difficile">Difficile</option>
                        </select>
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="preparationTime">Temps de préparation (min) *</label>
                        <input
                            type="number"
                            id="preparationTime"
                            name="preparationTime"
                            value={formData.preparationTime}
                            onChange={handleChange}
                            min="1"
                            className={errors.preparationTime ? 'error' : ''}
                        />
                        {errors.preparationTime && <span className="error-message">{errors.preparationTime}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="cookingTime">Temps de cuisson (min) *</label>
                        <input
                            type="number"
                            id="cookingTime"
                            name="cookingTime"
                            value={formData.cookingTime}
                            onChange={handleChange}
                            min="0"
                            className={errors.cookingTime ? 'error' : ''}
                        />
                        {errors.cookingTime && <span className="error-message">{errors.cookingTime}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="servings">Portions *</label>
                        <input
                            type="number"
                            id="servings"
                            name="servings"
                            value={formData.servings}
                            onChange={handleChange}
                            min="1"
                            className={errors.servings ? 'error' : ''}
                        />
                        {errors.servings && <span className="error-message">{errors.servings}</span>}
                    </div>
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
