import React from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../../components/common/ErrorFallback';
import { logError } from '../../utils/errorLogger';
import DebugPanel from '../../components/common/DebugPanel';
import QualityNavigation from '../../components/quality/Navigation';
import { useState } from 'react';

const QualityLayout = ({ children }) => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Send the error to the logging endpoint
        logError({ error, info });
        // Keep a console trace for local debugging
        console.error('QualityLayout caught an error:', error, info);
      }}
    >
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar navigation */}
        <QualityNavigation isOpen={navOpen} onClose={() => setNavOpen(false)} />

        {/* Main content area */}
        <div className="flex-1 min-h-screen">
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 p-3">
            <button
              onClick={() => setNavOpen(true)}
              className="lg:hidden px-3 py-2 bg-blue-600 text-white rounded-md"
            >
              Open Quality Menu
            </button>
          </div>

          <main className="p-6">
            {children || <Outlet />}
          </main>
        </div>

        <DebugPanel />
      </div>
    </ErrorBoundary>
  );
};

export default QualityLayout;
