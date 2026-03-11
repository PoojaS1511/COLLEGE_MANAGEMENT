import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-gray-900 ${sizes[size]}`}
        style={{
          borderColor: 'transparent',
          borderTopColor: 'currentColor',
          borderRightColor: 'currentColor',
          borderBottomColor: 'currentColor',
        }}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;
