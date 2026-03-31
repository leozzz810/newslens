import React from 'react';
import ReactDOM from 'react-dom/client';
import Options from './Options.js';
import '../styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
