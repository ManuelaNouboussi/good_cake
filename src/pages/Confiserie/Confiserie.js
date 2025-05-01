import React from 'react';
import './Confiserie.css';

const Confiserie = () => {
    return (
        <div className="confiserie-page">
            <main className="confiserie-content">
                <section className="hero-section">
                    <h1>Notre Confiserie</h1>
                    <p>Découvrez nos confiseries artisanales, des douceurs pour petits et grands.</p>
                </section>
                
                <section className="confiserie-gallery">
                    <h2>Nos Créations Sucrées</h2>
                    <div className="gallery-grid">
                        <div className="confiserie-item">
                            <div className="confiserie-image">
                                <div className="placeholder-image"></div>
                            </div>
                            <h3>Guimauves Artisanales</h3>
                            <p>Guimauves moelleuses à la vanille et aux fruits rouges.</p>
                            <span className="price">8,90 € / 200g</span>
                        </div>
                        
                        <div className="confiserie-item">
                            <div className="confiserie-image">
                                <div className="placeholder-image"></div>
                            </div>
                            <h3>Caramels au Beurre Salé</h3>
                            <p>Caramels fondants au beurre salé de Guérande.</p>
                            <span className="price">9,50 € / 200g</span>
                        </div>
                        
                        <div className="confiserie-item">
                            <div className="confiserie-image">
                                <div className="placeholder-image"></div>
                            </div>
                            <h3>Pâtes de Fruits</h3>
                            <p>Assortiment de pâtes de fruits aux saveurs variées.</p>
                            <span className="price">10,90 € / 200g</span>
                        </div>
                        
                        <div className="confiserie-item">
                            <div className="confiserie-image">
                                <div className="placeholder-image"></div>
                            </div>
                            <h3>Nougat aux Amandes</h3>
                            <p>Nougat tendre aux amandes et au miel de lavande.</p>
                            <span className="price">12,50 € / 200g</span>
                        </div>
                    </div>
                </section>
                
                <section className="confiserie-specialites">
                    <h2>Nos Spécialités</h2>
                    <div className="specialites-grid">
                        <div className="specialite-item">
                            <div className="specialite-image">
                                <div className="placeholder-image"></div>
                            </div>
                            <div className="specialite-content">
                                <h3>Calissons Maison</h3>
                                <p>Nos calissons sont préparés selon la recette traditionnelle d'Aix-en-Provence, avec des amandes finement broyées, du melon confit et des écorces d'oranges confites. Une délicieuse spécialité du Sud de la France.</p>
                                <span className="price">14,90 € / boîte de 12</span>
                            </div>
                        </div>
                        
                        <div className="specialite-item">
                            <div className="specialite-image">
                                <div className="placeholder-image"></div>
                            </div>
                            <div className="specialite-content">
                                <h3>Marrons Glacés</h3>
                                <p>Nos marrons glacés sont confits lentement dans un sirop de sucre vanillé, puis glacés à la main. Un travail minutieux pour cette confiserie d'exception, idéale pour les fêtes de fin d'année.</p>
                                <span className="price">22,50 € / boîte de 8</span>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="confiserie-info">
                    <h2>L'Art de la Confiserie</h2>
                    <p>La confiserie est un art ancestral qui demande patience et précision. Chez Cake Lawyer, nous perpétuons ces traditions en y ajoutant notre touche de créativité.</p>
                    <p>Toutes nos confiseries sont fabriquées à partir d'ingrédients naturels, sans conservateurs ni colorants artificiels. Nous sélectionnons les meilleurs fruits, les amandes les plus savoureuses et les miels les plus parfumés pour vous offrir des confiseries d'exception.</p>
                    <p>Nos confiseries sont disponibles en boutique et peuvent être conditionnées en coffrets cadeaux sur demande.</p>
                </section>
            </main>
        </div>
    );
};

export default Confiserie;
