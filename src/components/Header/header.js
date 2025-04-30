import React, { useState, useEffect } from 'react';
import './header.css';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <div className="logo">CAKE LAWYER</div>
                
                <nav className={menuOpen ? 'open' : ''}>
                    <ul className="choice">
                        <li><a href="#patisserie">patisserie</a></li>
                        <li><a href="#chocolat">chocolat</a></li>
                        <li><a href="#glaces">glaces</a></li>
                        <li><a href="#confisserie">confisserie</a></li>
                        <li><a href="#contact">contact</a></li>
                    </ul>
                </nav>
                
                <div className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </header>
    );
};

export default Header;
