import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between p-4 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-xl">
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
        <p className="font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-200 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
