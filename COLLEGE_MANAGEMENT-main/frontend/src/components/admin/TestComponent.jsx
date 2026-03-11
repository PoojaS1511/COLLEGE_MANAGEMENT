import React from 'react';

const TestComponent = () => {
  console.log('TestComponent is rendering!');
  
  return (
    <div className="p-6 bg-yellow-100 border border-yellow-500 rounded-lg">
      <h2 className="text-2xl font-bold text-yellow-700 mb-4">Test Component</h2>
      <p className="mb-4">This is a test component to verify routing is working.</p>
      <button 
        onClick={() => console.log('Test button clicked!')}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        Test Button
      </button>
    </div>
  );
};

export default TestComponent;
