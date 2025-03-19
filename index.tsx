import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const App = () => {
  return (
    <div className="container">
      <h1>Single File React App</h1>
      <p>This is a simplified version with just one index.tsx file.</p>
      <div className="card">
        <button onClick={() => alert('Button clicked!')}>
          Click me
        </button>
      </div>
    </div>
  );
};

// Create root element if it doesn't exist
if (typeof document !== 'undefined') {
  const rootElement = document.getElementById('root') || document.createElement('div');
  
  if (!rootElement.id) {
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
  }
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

export default App; 