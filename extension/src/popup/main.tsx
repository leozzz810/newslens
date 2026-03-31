import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './Popup.js';
import '../styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
