import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-logo">
                    <Link to="/" className="footer-logo-text">CAKE LAWYER</Link>
                    <p>L'excellence pâtissière à votre service</p>
                </div>
                
                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Nos créations</h4>
                        <ul>
                            <li><Link to="/patisserie">Pâtisserie</Link></li>
                            <li><Link to="/chocolat">Chocolat</Link></li>
                            <li><Link to="/glaces">Glaces</Link></li>
                            <li><Link to="/confiserie">Confiserie</Link></li>
                        </ul>
                    </div>
                    
                    <div className="footer-col">
                        <h4>Informations</h4>
                        <ul>
                            <li><Link to="/about">À propos</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/legal">Mentions légales</Link></li>
                        </ul>
                    </div>
                    
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <address>
                            <p>123 Rue de la Pâtisserie</p>
                            <p>75001 Paris, France</p>
                            <p>Tél: +33 1 23 45 67 89</p>
                            <p>Email: info@cakelawyer.fr</p>
                        </address>
                    </div>
                </div>
            </div>
            
            <div className="footer-bottom">
                <div className="social-links">
                    <a href="https://facebook.com" className="social-link">Facebook</a>
                    <a href="https://instagram.com" className="social-link">Instagram</a>
                    <a href="https://twitter.com" className="social-link">Twitter</a>
                </div>
                <p className="copyright">© {new Date().getFullYear()} CAKE LAWYER. Tous droits réservés.</p>
            </div>
        </footer>
    );
};

export default Footer;
