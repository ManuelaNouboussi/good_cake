import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-logo">
                    <div className="footer-logo-text">CAKE LAWYER</div>
                    <p>L'excellence pâtissière à votre service</p>
                </div>
                
                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Nos créations</h4>
                        <ul>
                            <li><a href="#patisserie">Pâtisserie</a></li>
                            <li><a href="#chocolat">Chocolat</a></li>
                            <li><a href="#glaces">Glaces</a></li>
                            <li><a href="#confisserie">Confiserie</a></li>
                        </ul>
                    </div>
                    
                    <div className="footer-col">
                        <h4>Informations</h4>
                        <ul>
                            <li><a href="#about">À propos</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#faq">FAQ</a></li>
                            <li><a href="#legal">Mentions légales</a></li>
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
                    <a href="#" className="social-link">Facebook</a>
                    <a href="#" className="social-link">Instagram</a>
                    <a href="#" className="social-link">Twitter</a>
                </div>
                <p className="copyright">© {new Date().getFullYear()} CAKE LAWYER. Tous droits réservés.</p>
            </div>
        </footer>
    );
};

export default Footer;
