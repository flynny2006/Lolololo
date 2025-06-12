import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Removed React.StrictMode as per user feedback that it helped with previous issues
// (e.g., black screen) potentially related to libraries like react-beautiful-dnd.
root.render(
  <App />
);