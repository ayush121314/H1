import React from 'react';

interface LoadingComponentProps {
  message?: string;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({ 
  message = 'Loading...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-700">{message}</p>
    </div>
  );
};

export default LoadingComponent; 