import React from 'react';
import './HeroSection.css';

const HeroSection = ({ onExplore }) => {
    return (
        <section className="hero">
            <div className="hero-content">
                <h1>CAKE LAWYER</h1>
                <p>La justice pâtissière à votre service</p>
                <div className="hero-buttons">
                    <a href="#recettes" className="hero-btn">Découvrir nos verdicts</a>
                    <button className="hero-btn explore" onClick={onExplore}>Explorer notre univers 3D</button>
                </div>
                <div className="hero-tagline">
                    <p>"Où chaque recette mérite un procès équitable"</p>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
