import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue' }}>Test Page - If you see this, React is working!</h1>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ 
        width: '100px', 
        height: '100px', 
        backgroundColor: 'lightblue', 
        margin: '20px 0',
        borderRadius: '10px'
      }}>
        Test Box
      </div>
    </div>
  );
}

export default App;
