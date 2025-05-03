import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
                <Link to="/" className="logo">CAKE LAWYER</Link>
                
                <nav className={menuOpen ? 'open' : ''}>
                    <ul className="choice">
                        <li><Link to="/patisserie">Pâtisserie</Link></li>
                        <li><Link to="/chocolat">Chocolat</Link></li>
                        <li><Link to="/glaces">Glaces</Link></li>
                        <li><Link to="/confiserie">Confisserie</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
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