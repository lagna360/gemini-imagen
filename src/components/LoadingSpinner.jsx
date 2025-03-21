import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p className="spinner-text">Generating AI image...</p>
    </div>
  );
};

export default LoadingSpinner;
