import React from 'react';
import ErrorBoundary from '../common/ErrorBoundary';
import FeesList from './FeesList';

const FeesListWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <FeesList />
    </ErrorBoundary>
  );
};

export default FeesListWithErrorBoundary;
