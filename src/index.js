import React from 'react';
import ReactDOM from 'react-dom/client'; // ← notice `.client` here!
import Main from './Main';

// NEW WAY (React 18+)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);


console.log("Rendering App...");