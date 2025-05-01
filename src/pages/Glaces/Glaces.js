import React from 'react';
import './Glaces.css';

const Glaces = () => {
    return (
        <div className="glaces-page">
            <main className="glaces-content">
                <section className="hero-section">
                    <h1>Nos Glaces Artisanales</h1>
                    <p>Découvrez nos glaces et sorbets artisanaux, fabriqués avec des ingrédients frais et de saison.</p>
                </section>
                
                <section className="glaces-gallery">
                    <h2>Nos Parfums</h2>
                    <div className="gallery-grid">
                        <div className="glace-item">
                            <div className="glace-image">
                                <div className="placeholder-image"></div>
                            </div>
                            <h3>Vanille de Madagascar</h3>
                            <p>Crème glacée onctueuse à la vanille de Madagascar aux notes délicates.</p>
                            <span className="price">3,50 € / boule</span>
                        </div>
                        
                        <div className="glace-item">
                            <div className="glace-image">
                                <div className="placeholder-image"></div>
                            </div>
                            <h3>Chocolat Grand Cru</h3>
                            <p>Glace au chocolat intense élaborée avec notre chocolat noir Grand Cru.</p>
                            <span className="price">3,50 € / boule</span>
                        </div>
                        
                        <div className="glace-item">
                            <div className="glace-image">
                                <div className="placeholder-image"></div>
                            </div>
                            <h3>Sorbet Fraise</h3>
                            <p>Sorbet rafraîchissant aux fraises fraîches de saison.</p>
                            <span className="price">3,50 € / boule</span>
                        </div>
                        
                        <div className="glace-item">
                            <div className="glace-image">
                                <div className="placeholder-image"></div>
                            </div>
                            <h3>Pistache de Sicile</h3>
                            <p>Crème glacée à la pistache de Sicile, onctueuse et parfumée.</p>
                            <span className="price">3,80 € / boule</span>
                        </div>
                    </div>
                </section>
                
                <section className="formules-section">
                    <h2>Nos Formules</h2>
                    <div className="formules-grid">
                        <div className="formule-item">
                            <h3>Coupe Découverte</h3>
                            <p>2 boules au choix, chantilly maison</p>
                            <span className="price">7,50 €</span>
                        </div>
                        
                        <div className="formule-item">
                            <h3>Coupe Gourmande</h3>
                            <p>3 boules au choix, sauce chocolat, chantilly, amandes caramélisées</p>
                            <span className="price">9,90 €</span>
                        </div>
                        
                        <div className="formule-item">
                            <h3>Café Glacé</h3>
                            <p>Expresso, 1 boule vanille, 1 boule café, chantilly</p>
                            <span className="price">8,50 €</span>
                        </div>
                        
                        <div className="formule-item">
                            <h3>Chocolat Liégeois</h3>
                            <p>2 boules chocolat, sauce chocolat chaud, chantilly</p>
                            <span className="price">8,90 €</span>
                        </div>
                    </div>
                </section>
                
                <section className="glaces-info">
                    <h2>Notre Savoir-faire</h2>
                    <p>Chez Cake Lawyer, nos glaces sont fabriquées artisanalement dans notre laboratoire. Nous utilisons des ingrédients de première qualité et respectons les saisons pour vous offrir des saveurs authentiques et intenses.</p>
                    <p>Nos sorbets contiennent plus de 50% de fruits et sont élaborés sans colorants ni arômes artificiels. Nos crèmes glacées sont préparées avec du lait entier et de la crème fraîche de producteurs locaux.</p>
                </section>
            </main>
        </div>
    );
};

export default Glaces;
