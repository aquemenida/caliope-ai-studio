
import React from 'react';

export const LoadingSpinner: React.FC<{ size?: number; text?: string }> = ({ size = 10, text }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div
        className={`w-${size} h-${size} animate-spin rounded-full border-4 border-gray-300 border-t-primary`}
        role="status"
      >
        <span className="sr-only">Cargando...</span>
      </div>
      {text && <p className="text-primary animate-pulse">{text}</p>}
    </div>
  );
};
