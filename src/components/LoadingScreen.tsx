import React from 'react';
import { Brain, Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 animate-ping"></div>
          <div className="relative bg-blue-600 p-6 rounded-full shadow-lg">
            <Brain className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">QuizAI</h1>
        <p className="text-gray-600 mb-6">AI-Powered Quiz Generator</p>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading...</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-64 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
