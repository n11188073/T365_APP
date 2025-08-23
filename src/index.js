import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App';
import reportWebVitals from './reportWebVitals';

// If you want to use Main.js as your entry point, import it and use it below
// import Main from './Main';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* Or use <Main /> instead of <App /> if that's your main component */}
  </React.StrictMode>
);

reportWebVitals();

console.log("Rendering App...");