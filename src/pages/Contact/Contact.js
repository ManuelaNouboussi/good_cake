import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Ici, vous implémenteriez l'envoi réel du formulaire
        console.log('Formulaire soumis:', formData);
        setFormSubmitted(true);
        
        // Réinitialiser le formulaire après soumission
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });
        
        // Afficher le message de confirmation pendant 5 secondes
        setTimeout(() => {
            setFormSubmitted(false);
        }, 5000);
    };
    
    return (
        <div className="contact-page">
            <main className="contact-content">
                <section className="hero-section">
                    <h1>Contactez-nous</h1>
                    <p>Nous sommes à votre écoute pour toute demande d'information ou de devis.</p>
                </section>
                
                <section className="contact-info-section">
                    <div className="contact-grid">
                        <div className="contact-details">
                            <h2>Nos Coordonnées</h2>
                            <div className="contact-item">
                                <h3>Adresse</h3>
                                <address>
                                    123 Rue de la Pâtisserie<br />
                                    75001 Paris, France
                                </address>
                            </div>
                            
                            <div className="contact-item">
                                <h3>Horaires d'ouverture</h3>
                                <p>Du mardi au samedi : 9h30 - 19h30<br />
                                Dimanche : 9h30 - 13h00<br />
                                Fermé le lundi</p>
                            </div>
                            
                            <div className="contact-item">
                                <h3>Téléphone</h3>
                                <p>+33 1 23 45 67 89</p>
                            </div>
                            
                            <div className="contact-item">
                                <h3>Email</h3>
                                <p>info@cakelawyer.fr</p>
                            </div>
                        </div>
                        
                        <div className="contact-map">
                            <div className="map-placeholder">
                                <div className="placeholder-image"></div>
                                <p className="map-note">Carte interactive - à implémenter</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="contact-form-section">
                    <h2>Envoyez-nous un message</h2>
                    
                    {formSubmitted ? (
                        <div className="form-success">
                            <p>Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.</p>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Nom *</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="phone">Téléphone</label>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                />
                            </div>
                            
                            <div className="form-group full-width">
                                <label htmlFor="subject">Sujet *</label>
                                <input 
                                    type="text" 
                                    id="subject" 
                                    name="subject" 
                                    value={formData.subject} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            
                            <div className="form-group full-width">
                                <label htmlFor="message">Message *</label>
                                <textarea 
                                    id="message" 
                                    name="message" 
                                    rows="6" 
                                    value={formData.message} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            
                            <div className="form-group full-width">
                                <button type="submit" className="submit-button">Envoyer</button>
                            </div>
                        </form>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Contact;
