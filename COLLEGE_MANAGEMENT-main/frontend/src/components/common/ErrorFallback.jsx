import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert" className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
    <div className="bg-white rounded-lg shadow-md p-6 max-w-xl w-full text-left">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-700 mb-4">An error occurred while loading this section. You can retry or return to the Quality dashboard.</p>
      <pre className="text-xs text-red-600 mb-4 overflow-auto">{error?.message}</pre>
      <div className="flex space-x-2">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
        <a
          href="/quality/dashboard"
          className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
        >
          Go to Quality Dashboard
        </a>
      </div>
    </div>
  </div>
);

export default ErrorFallback;
