import React from 'react';
import './App.css';

const dispositionsRedBall = [
  { id: 'maisonDeLaPatisserie', label: 'Maison de la Patisserie' },
  { id: 'mesSecretsSucres', label: 'Mes Secrets Sucrés' },
  { id: 'mesSecretsSucresPartages', label: 'Mes Secrets Sucrés Partagés' },
  { id: 'tribunalDesAdjuges', label: 'Tribunal des Adjugés' },
];

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <h1>Ma Barre de Navigation</h1>
      </nav>
      <div className="diagonal-container">
        {dispositionsRedBall.map(({ id, label }) => (
          <div key={id} id={id} className="red-ball">
            <h2>{label}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
