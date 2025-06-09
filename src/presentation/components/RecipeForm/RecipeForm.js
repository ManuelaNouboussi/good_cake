import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recipeFacade } from '../../../application/facades/recipeFacade';
import ImageSelector from '../ImageSelector/ImageSelector';
import './RecipeForm.css';

const RecipeForm = ({ onAddRecipe, onCancel }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // États pour la gestion d'images
    const [showImageSelector, setShowImageSelector] = useState(false);
    const [selectedImageData, setSelectedImageData] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        ingredients: [''],
        steps: [''],
        imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400',
        preparationTime: '',
        cookingTime: '',
        difficulty: 'moyen',
        servings: '',
        equipment: [''],
        tips: '',
        storageInstructions: '',
        allergens: [],
        nutritionInfo: {
            calories_par_part: '',
            proteines: '',
            glucides: '',
            lipides: ''
        },
        videoUrl: '',
        source: '',
        yieldInfo: ''
    });
    
    const [errors, setErrors] = useState({});
    
    const commonAllergens = [
        'Gluten', 'Œufs', 'Lactose', 'Fruits à coque', 'Arachides', 
        'Soja', 'Poisson', 'Crustacés', 'Sésame', 'Sulfites'
    ];
    
    // Chargement automatique d'une image par défaut depuis Pexels basée sur le titre
    useEffect(() => {
        const loadDefaultImageFromTitle = async () => {
            // Si pas de titre, garder placeholder
            if (!formData.title || formData.title.trim() === '') {
                if (formData.imageUrl !== 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400') {
                    setFormData(prev => ({
                        ...prev,
                        imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400'
                    }));
                    setSelectedImageData(null);
                }
                return;
            }

            // Si on a déjà une image sélectionnée manuellement, ne pas la changer
            if (selectedImageData && !selectedImageData.attribution?.includes('Image automatique')) {
                return;
            }

            // Chercher automatiquement une image correspondante dans Pexels
            try {
                const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;
                
                if (PEXELS_API_KEY) {
                    const titleKeywords = formData.title.toLowerCase()
                        .replace(/[^a-zA-ZÀ-ÿ\s]/g, ' ')
                        .split(' ')
                        .filter(word => word.length > 2)
                        .slice(0, 2)
                        .join(' ');
                    
                    const searchQuery = `${titleKeywords} dessert sweet pastry`;
                    
                    const response = await fetch(
                        `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
                        {
                            headers: { 'Authorization': PEXELS_API_KEY }
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.photos && data.photos.length > 0) {
                            const photo = data.photos[0];
                            setFormData(prev => ({
                                ...prev,
                                imageUrl: photo.src.medium
                            }));
                            setSelectedImageData({
                                url: photo.src.medium,
                                attribution: `Image automatique pour "${formData.title}" - Photo by ${photo.photographer} on Pexels`,
                                photographer: photo.photographer,
                                source: 'Pexels (Auto)'
                            });
                            return;
                        }
                    }
                }
                
                const titleForUnsplash = formData.title.toLowerCase()
                    .replace(/[^a-zA-ZÀ-ÿ\s]/g, ' ')
                    .split(' ')
                    .filter(word => word.length > 2)
                    .slice(0, 3)
                    .join(',');
                
                const unsplashUrl = `https://source.unsplash.com/600x400/?${titleForUnsplash},dessert,sweet&sig=${Date.now()}`;
                
                setFormData(prev => ({
                    ...prev,
                    imageUrl: unsplashUrl
                }));
                setSelectedImageData({
                    url: unsplashUrl,
                    attribution: `Image automatique pour "${formData.title}" - Unsplash`,
                    photographer: 'Unsplash Community',
                    source: 'Unsplash (Auto)'
                });
                
            } catch (error) {
                setFormData(prev => ({
                    ...prev,
                    imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400'
                }));
                setSelectedImageData(null);
            }
        };

        const timeoutId = setTimeout(loadDefaultImageFromTitle, 1000);
        return () => clearTimeout(timeoutId);
    }, [formData.title]);

    // Charger les catégories
    useEffect(() => {
        async function loadCategories() {
            try {
                const cats = await recipeFacade.getAllCategories();
                
                if (!cats || !Array.isArray(cats)) {
                    throw new Error('Catégories invalides reçues de la facade');
                }
                
                setCategories(cats);
                
                // Définir la première catégorie par défaut
                if (cats.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        categoryId: cats[0].id
                    }));
                }
            } catch (err) {
                alert('Erreur lors du chargement des catégories: ' + err.message);
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
        
        // Effacer l'erreur si l'utilisateur corrige le champ
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Gestion de la sélection d'image manuelle
    const handleImageSelection = (imageData) => {
        setFormData(prev => ({
            ...prev,
            imageUrl: imageData.url
        }));
        setSelectedImageData(imageData);
        setShowImageSelector(false);
    };
    
    const handleNutritionChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            nutritionInfo: {
                ...prev.nutritionInfo,
                [field]: value
            }
        }));
    };
    
    // Gestion des ingrédients
    const handleIngredientChange = (index, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = value;
        setFormData(prev => ({
            ...prev,
            ingredients: newIngredients
        }));
    };
    
    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, '']
        }));
    };
    
    const removeIngredient = (index) => {
        if (formData.ingredients.length > 1) {
            const newIngredients = formData.ingredients.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                ingredients: newIngredients
            }));
        }
    };
    
    // Gestion des étapes
    const handleStepChange = (index, value) => {
        const newSteps = [...formData.steps];
        newSteps[index] = value;
        setFormData(prev => ({
            ...prev,
            steps: newSteps
        }));
    };
    
    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, '']
        }));
    };
    
    const removeStep = (index) => {
        if (formData.steps.length > 1) {
            const newSteps = formData.steps.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                steps: newSteps
            }));
        }
    };
    
    // Gestion du matériel
    const handleEquipmentChange = (index, value) => {
        const newEquipment = [...formData.equipment];
        newEquipment[index] = value;
        setFormData(prev => ({
            ...prev,
            equipment: newEquipment
        }));
    };
    
    const addEquipment = () => {
        setFormData(prev => ({
            ...prev,
            equipment: [...prev.equipment, '']
        }));
    };
    
    const removeEquipment = (index) => {
        if (formData.equipment.length > 1) {
            const newEquipment = formData.equipment.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                equipment: newEquipment
            }));
        }
    };
    
    const toggleAllergen = (allergen) => {
        setFormData(prev => ({
            ...prev,
            allergens: prev.allergens.includes(allergen)
                ? prev.allergens.filter(a => a !== allergen)
                : [...prev.allergens, allergen]
        }));
    };
    
    // Validation et soumission
    const validateForm = () => {
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
        
        return newErrors;
    };
    
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            categoryId: categories.length > 0 ? categories[0].id : '',
            ingredients: [''],
            steps: [''],
            imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400',
            preparationTime: '',
            cookingTime: '',
            difficulty: 'moyen',
            servings: '',
            equipment: [''],
            tips: '',
            storageInstructions: '',
            allergens: [],
            nutritionInfo: {
                calories_par_part: '',
                proteines: '',
                glucides: '',
                lipides: ''
            },
            videoUrl: '',
            source: '',
            yieldInfo: ''
        });
        setErrors({});
        setSelectedImageData(null);
        setShowImageSelector(false);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Vérification de la connexion
        if (!user || !user.id) {
            alert('Vous devez être connecté pour ajouter une recette. Veuillez vous reconnecter.');
            return;
        }
        
        // Validation
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setSubmitting(true);
        
        try {
            // Préparation des données avec attribution d'image si disponible
            const recipeData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                categoryId: formData.categoryId,
                userId: user.id,
                
                ingredients: formData.ingredients
                    .filter(ing => ing.trim())
                    .map(ing => ({
                        name: ing.split(' - ')[0] || ing,
                        quantity: ing.split(' - ')[1] || ing,
                        note: ''
                    })),
                
                steps: formData.steps
                    .filter(step => step.trim())
                    .map((step, index) => ({
                        step: index + 1,
                        instruction: step,
                        duration: '',
                        temperature: ''
                    })),
                
                imageUrl: formData.imageUrl,
                // Ajouter l'attribution d'image dans les métadonnées si disponible
                imageAttribution: selectedImageData ? selectedImageData.attribution : null,
                imageSource: selectedImageData ? selectedImageData.source : null,
                
                preparationTime: parseInt(formData.preparationTime),
                cookingTime: parseInt(formData.cookingTime),
                difficulty: formData.difficulty,
                servings: parseInt(formData.servings),
                equipment: formData.equipment.filter(eq => eq.trim()),
                tips: formData.tips.trim() || null,
                storageInstructions: formData.storageInstructions.trim() || null,
                allergens: formData.allergens,
                nutritionInfo: Object.values(formData.nutritionInfo).some(v => v.trim()) 
                    ? formData.nutritionInfo 
                    : null,
                videoUrl: formData.videoUrl.trim() || null,
                source: formData.source.trim() || null,
                yieldInfo: formData.yieldInfo.trim() || null
            };
            
            // Création de la recette
            const result = await recipeFacade.createCompleteRecipe(recipeData);
            
            // Succès
            alert('✅ Recette créée avec succès !');
            resetForm();
            
            // Fermer le formulaire après 1 seconde
            if (onCancel) {
                setTimeout(() => onCancel(), 1000);
            }
            
        } catch (error) {
            alert('Erreur lors de la création de la recette: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };
    
    if (loading) {
        return <div className="loading">Chargement ...</div>;
    }
    
    if (!user) {
        return (
            <div className="recipe-form-container">
                <div className="auth-warning">
                    <h2>🔐 Connexion requise</h2>
                    <p>Vous devez être connecté pour ajouter une recette.</p>
                    <button onClick={onCancel} className="cancel-btn">
                        Retour
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="recipe-form-container">
            <div className="recipe-form-header">
                <h2>⚖️ Déposer une nouvelle recette</h2>
                <p>Soumettez votre chef-d'œuvre culinaire au tribunal gastronomique</p>
            </div>
            
            <form className="recipe-form" onSubmit={handleSubmit}>
                {/* Section Information de base */}
                <div className="form-section">
                    <h3>📋 Informations générales</h3>
                    
                    <div className="form-group">
                        <label htmlFor="title">Titre de la recette</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={errors.title ? 'error' : ''}
                            placeholder="ex: Tarte au chocolat de grand-mère"
                            required
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className={errors.description ? 'error' : ''}
                            placeholder="Décrivez votre création culinaire..."
                            required
                        ></textarea>
                        {errors.description && <span className="error-message">{errors.description}</span>}
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="categoryId">Catégorie</label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className={errors.categoryId ? 'error' : ''}
                                required
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
                            <label htmlFor="difficulty">Niveau de complexité</label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                            >
                                <option value="facile">🟢 Facile</option>
                                <option value="moyen">🟡 Moyen</option>
                                <option value="difficile">🔴 Difficile</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section Temps et portions */}
                <div className="form-section">
                    <h3>⏱️ Temps et portions</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="preparationTime">Préparation (min)</label>
                            <input
                                type="number"
                                id="preparationTime"
                                name="preparationTime"
                                value={formData.preparationTime}
                                onChange={handleChange}
                                min="1"
                                className={errors.preparationTime ? 'error' : ''}
                                placeholder="30"
                                required
                            />
                            {errors.preparationTime && <span className="error-message">{errors.preparationTime}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="cookingTime">Cuisson (min)</label>
                            <input
                                type="number"
                                id="cookingTime"
                                name="cookingTime"
                                value={formData.cookingTime}
                                onChange={handleChange}
                                min="0"
                                className={errors.cookingTime ? 'error' : ''}
                                placeholder="45"
                                required
                            />
                            {errors.cookingTime && <span className="error-message">{errors.cookingTime}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="servings">Portions</label>
                            <input
                                type="number"
                                id="servings"
                                name="servings"
                                value={formData.servings}
                                onChange={handleChange}
                                min="1"
                                className={errors.servings ? 'error' : ''}
                                placeholder="6"
                                required
                            />
                            {errors.servings && <span className="error-message">{errors.servings}</span>}
                        </div>
                    </div>
                </div>

                {/* Section Image CORRIGÉE */}
                <div className="form-section">
                    <h3>🖼️ Présentation visuelle</h3>
                    
                    <div className="form-group">
                        <label>Image de la recette</label>
                        
                        {/* Aperçu de l'image actuelle */}
                        {formData.imageUrl && (
                            <div className="current-image-preview" style={{ marginBottom: '1.5rem' }}>
                                <img 
                                    src={formData.imageUrl} 
                                    alt="Aperçu de la recette"
                                    style={{
                                        width: '250px',
                                        height: '167px',
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                        border: '3px solid #D4AF37',
                                        marginBottom: '1rem',
                                        boxShadow: '0 6px 20px rgba(139, 69, 19, 0.2)',
                                        display: 'block'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400';
                                    }}
                                />
                                {selectedImageData && (
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: '#654321',
                                        fontStyle: 'italic',
                                        marginBottom: '1rem',
                                        padding: '1rem',
                                        background: 'rgba(212, 175, 55, 0.1)',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #D4AF37',
                                        fontFamily: 'Georgia, serif'
                                    }}>
                                        📸 <strong>Crédit photo :</strong> {selectedImageData.attribution}
                                        <br />
                                        🌐 <strong>Source :</strong> {selectedImageData.source} (100% légal)
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Bouton d'action */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                type="button"
                                onClick={() => setShowImageSelector(!showImageSelector)}
                                style={{
                                    background: showImageSelector 
                                        ? 'linear-gradient(135deg, #DC143C, #B22222)'
                                        : 'linear-gradient(135deg, #8B4513, #654321)',
                                    color: '#F4E4BC',
                                    border: '3px solid #654321',
                                    padding: '1rem 1.5rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontFamily: 'Georgia, serif',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)'
                                }}
                            >
                                {showImageSelector ? '🔒 Fermer la galerie' : '🎨 Explorer la galerie'}
                            </button>
                        </div>
                        
                        {/* Message d'information */}
                        <div style={{
                            background: 'rgba(139, 69, 19, 0.1)',
                            padding: '1.2rem',
                            borderRadius: '10px',
                            borderLeft: '4px solid #8B4513',
                            marginBottom: '1.5rem',
                            fontFamily: 'Georgia, serif'
                        }}>
                            <p style={{
                                margin: '0 0 0.5rem 0',
                                fontWeight: '600',
                                color: '#654321',
                                fontSize: '0.95rem'
                            }}>
                                ⚖️ <strong>Sécurité juridique garantie</strong>
                            </p>
                            <p style={{
                                margin: 0,
                                color: '#654321',
                                fontSize: '0.9rem',
                                lineHeight: '1.5'
                            }}>
                                {formData.title ? 
                                    `Image chargée automatiquement pour "${formData.title}". Explorez la galerie pour d'autres options.` :
                                    'Ajoutez un titre et une image correspondante apparaîtra automatiquement.'
                                }
                            </p>
                        </div>
                        
                        {/* Sélecteur d'images intelligent */}
                        {showImageSelector && (
                            <div>
                                <ImageSelector
                                    onImageSelect={handleImageSelection}
                                    recipeName={formData.title}
                                    category={categories.find(cat => cat.id === formData.categoryId)?.name?.toLowerCase()}
                                />
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Section Ingrédients */}
                <div className="form-section">
                    <h3>🥄 Liste des pièces à conviction</h3>
                    
                    <div className="form-group">
                        <label>Ingrédients</label>
                        {formData.ingredients.map((ingredient, index) => (
                            <div key={index} className="list-item">
                                <input
                                    type="text"
                                    value={ingredient}
                                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                                    placeholder="ex: 200g de farine T55"
                                />
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeIngredient(index)}
                                    disabled={formData.ingredients.length <= 1}
                                    aria-label="Supprimer l'ingrédient"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {errors.ingredients && <span className="error-message">{errors.ingredients}</span>}
                        <button type="button" className="add-btn" onClick={addIngredient}>
                            Ajouter un ingrédient
                        </button>
                    </div>
                </div>
                
                {/* Section Étapes */}
                <div className="form-section">
                    <h3>📝 Procédure judiciaire</h3>
                    
                    <div className="form-group">
                        <label>Étapes de préparation</label>
                        {formData.steps.map((step, index) => (
                            <div key={index} className="step-row">
                                <div className="step-number">{index + 1}</div>
                                <div className="step-fields">
                                    <textarea
                                        value={step}
                                        onChange={(e) => handleStepChange(index, e.target.value)}
                                        placeholder={`Décrivez l'étape ${index + 1}...`}
                                        rows="3"
                                        className="step-instruction"
                                    ></textarea>
                                </div>
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeStep(index)}
                                    disabled={formData.steps.length <= 1}
                                    aria-label="Supprimer l'étape"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {errors.steps && <span className="error-message">{errors.steps}</span>}
                        <button type="button" className="add-btn" onClick={addStep}>
                            Ajouter une étape
                        </button>
                    </div>
                </div>
                
                {/* Section Matériel */}
                <div className="form-section">
                    <h3>🔧 Équipement du cabinet</h3>
                    
                    <div className="form-group">
                        <label>Matériel nécessaire</label>
                        {formData.equipment.map((item, index) => (
                            <div key={index} className="list-item">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleEquipmentChange(index, e.target.value)}
                                    placeholder="ex: Moule à tarte 24cm"
                                />
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeEquipment(index)}
                                    disabled={formData.equipment.length <= 1}
                                    aria-label="Supprimer l'équipement"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={addEquipment}>
                            Ajouter du matériel
                        </button>
                    </div>
                </div>
                
                {/* Section Conseils et informations */}
                <div className="form-section">
                    <h3>💡 Conseils de l'expert</h3>
                    
                    <div className="form-group">
                        <label htmlFor="tips">Conseils et astuces</label>
                        <textarea
                            id="tips"
                            name="tips"
                            value={formData.tips}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Partagez vos secrets pour réussir cette recette..."
                        ></textarea>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="storageInstructions">Instructions de conservation</label>
                        <textarea
                            id="storageInstructions"
                            name="storageInstructions"
                            value={formData.storageInstructions}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Comment conserver cette création..."
                        ></textarea>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="yieldInfo">Rendement</label>
                            <input
                                type="text"
                                id="yieldInfo"
                                name="yieldInfo"
                                value={formData.yieldInfo}
                                onChange={handleChange}
                                placeholder="ex: Pour 8 parts généreuses"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="source">Source de la recette</label>
                            <input
                                type="text"
                                id="source"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                placeholder="ex: Héritage familial"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="videoUrl">URL vidéo (optionnel)</label>
                        <input
                            type="url"
                            id="videoUrl"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>
                </div>
                
                {/* Section Allergènes */}
                <div className="form-section">
                    <h3>⚠️ Avertissements légaux</h3>
                    
                    <div className="form-group">
                        <label>Allergènes présents</label>
                        <div className="allergens-grid">
                            {commonAllergens.map(allergen => (
                                <label key={allergen} className="allergen-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.allergens.includes(allergen)}
                                        onChange={() => toggleAllergen(allergen)}
                                    />
                                    <span>{allergen}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Section Nutrition */}
                <div className="form-section">
                    <h3>📊 Analyse nutritionnelle</h3>
                    
                    <div className="form-group">
                        <label>Informations nutritionnelles (par portion)</label>
                        <div className="nutrition-grid">
                            <div className="form-group">
                                <label>Calories</label>
                                <input
                                    type="number"
                                    value={formData.nutritionInfo.calories_par_part}
                                    onChange={(e) => handleNutritionChange('calories_par_part', e.target.value)}
                                    placeholder="385"
                                />
                            </div>
                            <div className="form-group">
                                <label>Protéines (g)</label>
                                <input
                                    type="text"
                                    value={formData.nutritionInfo.proteines}
                                    onChange={(e) => handleNutritionChange('proteines', e.target.value)}
                                    placeholder="6g"
                                />
                            </div>
                            <div className="form-group">
                                <label>Glucides (g)</label>
                                <input
                                    type="text"
                                    value={formData.nutritionInfo.glucides}
                                    onChange={(e) => handleNutritionChange('glucides', e.target.value)}
                                    placeholder="32g"
                                />
                            </div>
                            <div className="form-group">
                                <label>Lipides (g)</label>
                                <input
                                    type="text"
                                    value={formData.nutritionInfo.lipides}
                                    onChange={(e) => handleNutritionChange('lipides', e.target.value)}
                                    placeholder="26g"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="form-actions">
                    <button 
                        type="button" 
                        className="cancel-btn" 
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={submitting}
                    >
                        {submitting ? '⏳ Instruction en cours...' : '⚖️ Soumettre au tribunal'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RecipeForm;
