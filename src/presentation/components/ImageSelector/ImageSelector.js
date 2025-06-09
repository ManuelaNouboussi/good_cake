import React, { useState, useEffect } from 'react';
import './ImageSelector.css';

const ImageSelector = ({ onImageSelect, recipeName = '', category = '' }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    
    const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;
    const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
    
    const pastryTranslations = {
        'gâteau': 'cake',
        'gâteau chocolat': 'chocolate cake',
        'gâteau vanille': 'vanilla cake',
        'gâteau fraise': 'strawberry cake',
        'gâteau carotte': 'carrot cake',
        'gâteau citron': 'lemon cake',
        'fondant': 'chocolate lava cake',
        'génoise': 'sponge cake',
        'quatre-quarts': 'pound cake',
        'madeleine': 'madeleine cake',
        'financier': 'financier cake',
        'tarte': 'tart',
        'tarte pomme': 'apple tart',
        'tarte chocolat': 'chocolate tart',
        'tarte citron': 'lemon tart',
        'tarte fraise': 'strawberry tart',
        'tarte tatin': 'apple tatin',
        'quiche': 'quiche',
        'pie': 'pie',
        'éclair': 'eclair pastry',
        'profiterole': 'profiterole',
        'chou': 'cream puff',
        'paris-brest': 'paris brest pastry',
        'saint-honoré': 'saint honore pastry',
        'millefeuille': 'mille feuille napoleon',
        'religieuse': 'religieuse pastry',
        'cookie': 'chocolate chip cookie',
        'sablé': 'shortbread cookie',
        'macaron': 'french macaron',
        'macarons': 'colorful macarons',
        'biscuit': 'biscuit cookie',
        'chocolat': 'chocolate dessert',
        'truffe': 'chocolate truffle',
        'bonbon': 'chocolate bonbon',
        'praline': 'chocolate praline',
        'tiramisu': 'tiramisu dessert',
        'mousse': 'chocolate mousse',
        'crème brûlée': 'creme brulee',
        'flan': 'caramel flan',
        'panna cotta': 'panna cotta',
        'soufflé': 'chocolate souffle',
        'pain': 'artisan bread',
        'baguette': 'french baguette',
        'croissant': 'french croissant',
        'pain chocolat': 'pain au chocolat',
        'brioche': 'brioche bread',
        'crème': 'pastry cream',
        'ganache': 'chocolate ganache',
        'caramel': 'caramel sauce',
        'confiture': 'fruit jam',
        'glace': 'ice cream',
        'sorbet': 'fruit sorbet',
        'feuilleté': 'puff pastry',
        'meringue': 'meringue dessert'
    };
    
    const pastryContext = [
        'pastry', 'dessert', 'bakery', 'cake', 'sweet', 'baking'
    ];
    
    const generatePastryKeywords = (recipeName) => {
        if (!recipeName) return ['pastry', 'dessert', 'cake'];
        
        const cleanName = recipeName.toLowerCase()
            .replace(/de|du|des|le|la|les|au|aux|à|et|en|avec|pour|grand-mère|maison/g, ' ')
            .replace(/[^\w\sàâäéèêëïîôöùûüÿç-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        let translatedTerms = [];
        Object.entries(pastryTranslations).forEach(([french, english]) => {
            if (cleanName.includes(french)) {
                translatedTerms.push(english);
            }
        });
        
        if (translatedTerms.length === 0) {
            const words = cleanName.split(' ').filter(word => word.length > 2);
            words.forEach(word => {
                if (pastryTranslations[word]) {
                    translatedTerms.push(pastryTranslations[word]);
                }
            });
        }
        
        const contextTerms = pastryContext.slice(0, 2);
        const finalTerms = [...new Set([...translatedTerms, ...contextTerms])];
        
        return finalTerms.length > 0 ? finalTerms : ['pastry', 'dessert', 'cake'];
    };
    
    const generateSearchVariations = (keywords) => {
        const mainTerms = keywords.slice(0, 2);
        const contextTerm = keywords.includes('cake') ? 'cake' : 'pastry';
        
        return [
            `${mainTerms.join(' ')} ${contextTerm}`,
            `${mainTerms[0]} ${contextTerm} professional`,
            `${mainTerms.join(' ')} bakery`,
            `homemade ${mainTerms.join(' ')}`,
            `gourmet ${mainTerms[0]} ${contextTerm}`,
            `${contextTerm} ${mainTerms[0]} delicious`,
            `french ${mainTerms.join(' ')}`,
            `artisan ${mainTerms[0]} ${contextTerm}`,
            `${contextTerm} photography professional`,
            `bakery ${contextTerm} display`
        ];
    };
    
    const searchPexels = async (searchTerms) => {
        if (!PEXELS_API_KEY) return [];
        
        let allImages = [];
        
        for (const term of searchTerms.slice(0, 3)) {
            try {
                const response = await fetch(
                    `https://api.pexels.com/v1/search?query=${encodeURIComponent(term)}&per_page=6&orientation=landscape&size=medium`,
                    {
                        headers: { 'Authorization': PEXELS_API_KEY }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const images = data.photos?.map(photo => ({
                        id: `pexels_${photo.id}`,
                        url: photo.src.medium,
                        thumb: photo.src.small,
                        large: photo.src.large,
                        photographer: photo.photographer,
                        source: 'Pexels',
                        attribution: `Photo by ${photo.photographer} on Pexels`,
                        alt: photo.alt || term
                    })) || [];
                    
                    allImages.push(...images);
                }
                
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                console.error('Erreur Pexels:', error);
            }
        }
        
        return allImages;
    };
    
    const searchUnsplash = async (searchTerms) => {
        if (!UNSPLASH_ACCESS_KEY) return [];
        
        let allImages = [];
        
        for (const term of searchTerms.slice(0, 3)) {
            try {
                const response = await fetch(
                    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=6&orientation=landscape`,
                    {
                        headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const images = data.results?.map(photo => ({
                        id: `unsplash_${photo.id}`,
                        url: photo.urls.regular,
                        thumb: photo.urls.thumb,
                        large: photo.urls.full,
                        photographer: photo.user.name,
                        source: 'Unsplash',
                        attribution: `Photo by ${photo.user.name} on Unsplash`,
                        alt: photo.alt_description || term
                    })) || [];
                    
                    allImages.push(...images);
                }
                
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                console.error('Erreur Unsplash:', error);
            }
        }
        
        return allImages;
    };
    
    const generateUnsplashSource = (searchTerms) => {
        return searchTerms.slice(0, 5).map((term, index) => ({
            id: `source_${index}`,
            url: `https://source.unsplash.com/600x400/?${term.replace(' ', ',')}&sig=${Date.now() + index}`,
            thumb: `https://source.unsplash.com/300x200/?${term.replace(' ', ',')}&sig=${Date.now() + index}`,
            large: `https://source.unsplash.com/1200x800/?${term.replace(' ', ',')}&sig=${Date.now() + index}`,
            photographer: 'Unsplash Community',
            source: 'Unsplash Source',
            attribution: `Photo from Unsplash for "${term}"`,
            alt: `${term} photography`
        }));
    };
    
    const performHybridSearch = async (recipeName, category) => {
        setLoading(true);
        
        try {
            const keywords = generatePastryKeywords(recipeName);
            const searchVariations = generateSearchVariations(keywords);
            
            const [pexelsImages, unsplashImages] = await Promise.all([
                searchPexels(searchVariations),
                searchUnsplash(searchVariations)
            ]);
            
            let allImages = [...pexelsImages, ...unsplashImages];
            
            if (allImages.length < 6) {
                const sourceImages = generateUnsplashSource(searchVariations);
                allImages.push(...sourceImages);
            }
            
            const uniqueImages = allImages.filter((image, index, self) => 
                index === self.findIndex(i => i.url === image.url)
            );
            
            const shuffled = uniqueImages
                .sort(() => Math.random() - 0.5)
                .slice(0, 12);
            
            setImages(shuffled);
            
        } catch (error) {
            console.error('Erreur recherche hybride:', error);
            
            const emergencyImages = generateUnsplashSource([
                'chocolate cake pastry',
                'french pastry bakery',
                'dessert patisserie',
                'homemade cake',
                'artisan pastry'
            ]);
            setImages(emergencyImages);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (recipeName && recipeName.trim()) {
            performHybridSearch(recipeName, category);
        } else {
            performHybridSearch('pâtisserie française', 'dessert');
        }
    }, [recipeName, category]);
    
    const handleImageSelect = (image) => {
        setSelectedImage(image);
        onImageSelect(image);
    };
    
    const refreshSearch = () => {
        performHybridSearch(recipeName, category);
    };
    
    return (
        <div className="image-selector">
            <div className="image-selector-header">
                <h3>🎂 Galerie d'images spécialisée</h3>
                <p>Images de pâtisserie sélectionnées automatiquement pour votre recette</p>
                {recipeName && (
                    <div style={{ 
                        background: 'rgba(139, 69, 19, 0.1)', 
                        padding: '1rem', 
                        borderRadius: '8px',
                        marginTop: '1rem',
                        fontSize: '0.9rem',
                        color: '#8B4513'
                    }}>
                        🔍 <strong>Recette :</strong> "{recipeName}"
                        <br />
                        <button 
                            onClick={refreshSearch}
                            disabled={loading}
                            style={{
                                marginTop: '0.8rem',
                                padding: '0.6rem 1.2rem',
                                background: '#8B4513',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                            }}
                        >
                            {loading ? '⏳ Recherche...' : '🔄 Voir d\'autres images'}
                        </button>
                    </div>
                )}
            </div>

            {selectedImage && (
                <div className="selected-image-preview">
                    <h4>✅ Image sélectionnée</h4>
                    <div className="preview-container">
                        <img 
                            src={selectedImage.url} 
                            alt={selectedImage.alt}
                            onError={(e) => {
                                e.target.src = '/assets/images/placeholder.jpg';
                            }}
                        />
                        <div className="preview-info">
                            <p><strong>Source :</strong> {selectedImage.source}</p>
                            <p><strong>Photographe :</strong> {selectedImage.photographer}</p>
                            <p className="legal-notice">
                                ⚖️ <strong>Attribution :</strong> {selectedImage.attribution}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="images-grid">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner">🎂</div>
                        <p>Recherche d'images en cours...</p>
                        <p>Sélection des meilleures photos pour votre recette</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="empty-state">
                        <p>🎂 Aucune image trouvée</p>
                        <p>Essayez de modifier le nom de votre recette</p>
                        <button onClick={refreshSearch} className="default-image-btn">
                            🔄 Réessayer
                        </button>
                    </div>
                ) : (
                    images.map((image) => (
                        <div 
                            key={image.id} 
                            className={`image-card ${selectedImage?.id === image.id ? 'selected' : ''}`}
                            onClick={() => handleImageSelect(image)}
                        >
                            <div className="image-container">
                                <img 
                                    src={image.thumb || image.url} 
                                    alt={image.alt}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = '/assets/images/placeholder.jpg';
                                    }}
                                />
                                <div className="image-overlay">
                                    <div className="image-actions">
                                        <button className="select-btn">
                                            ✓ Sélectionner
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="image-info">
                                <div className="photographer-credit">
                                    📸 {image.photographer}
                                </div>
                                <div className="source-badge">
                                    {image.source}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="advanced-options">
                <details>
                    <summary>ℹ️ À propos des images</summary>
                    <div className="options-content">
                        <div className="legal-info">
                            <strong>🎯 Galerie spécialisée pâtisserie :</strong>
                            <br />
                            • Images haute qualité spécialement sélectionnées pour la pâtisserie
                            <br />
                            • Sources multiples pour une grande variété d'images
                            <br />
                            • Correspondance automatique avec le nom de votre recette
                            <br />
                            • Toutes les images respectent les droits d'auteur
                        </div>
                        
                        <button 
                            onClick={() => {
                                setSelectedImage(null);
                                onImageSelect({
                                    url: '/assets/images/placeholder.jpg',
                                    attribution: 'Image par défaut',
                                    photographer: 'Cake Lawyer',
                                    source: 'Local'
                                });
                            }}
                            className="default-image-btn"
                            style={{ marginTop: '1rem' }}
                        >
                            🖼️ Utiliser l'image par défaut
                        </button>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default ImageSelector;
