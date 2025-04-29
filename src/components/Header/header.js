import React from 'react';
import './header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">CAKE LAWYER</div>
            <nav>
                <ul className="choice">
                    <li><a href="#patisserie">patisserie</a></li>
                    <li><a href="#chocolat">chocolat</a></li>
                    <li><a href="#glaces">glaces</a></li>
                    <li><a href="#confisserie">confisserie</a></li>
                    <li><a href="#contact">contact</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
