import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // App doit être importé correctement
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Ajoute la fonction onGameEnd dans l'appel du composant App
root.render(
  <React.StrictMode>
    <App onGameEnd={() => console.log('Game ended')} />
  </React.StrictMode>
);
