import React from 'react';
import ReactDOM from 'react-dom/client'; // ← notice `.client` here!
import App from './App';

// NEW WAY (React 18+)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


console.log("Rendering App...");