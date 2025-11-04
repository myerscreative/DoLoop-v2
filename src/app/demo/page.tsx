'use client';

import { useState } from 'react';
import CircularProgress from '@/components/ui/CircularProgress';

export default function CircularProgressDemo() {
  const [progress, setProgress] = useState(75);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          CircularProgress Component
        </h1>
        <p className="text-gray-600 mb-8">
          The signature DoLoop progress indicator
        </p>
        
        {/* Interactive Demo */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Interactive Demo</h2>
          
          <div className="flex flex-col items-center gap-6">
            <CircularProgress
              progress={progress}
              size={200}
              strokeWidth={12}
              showPercentage
            />
            
            <div className="w-full max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress: {progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>
        </div>
        
        {/* Size Variations */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Size Variations</h2>
          <div className="flex items-center justify-around gap-4 flex-wrap">
            <div className="text-center">
              <CircularProgress progress={75} size={80} strokeWidth={6} />
              <p className="text-sm text-gray-600 mt-2">Small (80px)</p>
            </div>
            <div className="text-center">
              <CircularProgress progress={75} size={120} strokeWidth={8} />
              <p className="text-sm text-gray-600 mt-2">Medium (120px)</p>
            </div>
            <div className="text-center">
              <CircularProgress progress={75} size={160} strokeWidth={10} />
              <p className="text-sm text-gray-600 mt-2">Large (160px)</p>
            </div>
          </div>
        </div>
        
        {/* Loop Type Colors */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Loop Type Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <CircularProgress
                progress={60}
                size={120}
                gradientColors={['#FFB800', '#FF8C00']}
                showPercentage
              />
              <p className="text-sm font-medium text-gray-700 mt-3">Daily</p>
              <p className="text-xs text-gray-500">Orange/Gold</p>
            </div>
            
            <div className="text-center">
              <CircularProgress
                progress={80}
                size={120}
                gradientColors={['#00BCD4', '#0097A7']}
                showPercentage
              />
              <p className="text-sm font-medium text-gray-700 mt-3">Work</p>
              <p className="text-xs text-gray-500">Cyan</p>
            </div>
            
            <div className="text-center">
              <CircularProgress
                progress={45}
                size={120}
                gradientColors={['#F44336', '#D32F2F']}
                showPercentage
              />
              <p className="text-sm font-medium text-gray-700 mt-3">Personal</p>
              <p className="text-xs text-gray-500">Red</p>
            </div>
          </div>
        </div>
        
        {/* Completion States */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Completion States</h2>
          <div className="flex items-center justify-around gap-4 flex-wrap">
            <div className="text-center">
              <CircularProgress
                progress={0}
                size={100}
                showPercentage
              />
              <p className="text-sm text-gray-600 mt-2">Not Started</p>
            </div>
            <div className="text-center">
              <CircularProgress
                progress={25}
                size={100}
                showPercentage
              />
              <p className="text-sm text-gray-600 mt-2">25% Complete</p>
            </div>
            <div className="text-center">
              <CircularProgress
                progress={50}
                size={100}
                showPercentage
              />
              <p className="text-sm text-gray-600 mt-2">Half Way</p>
            </div>
            <div className="text-center">
              <CircularProgress
                progress={100}
                size={100}
                gradientColors={['#4CAF50', '#388E3C']}
                showPercentage
              />
              <p className="text-sm text-gray-600 mt-2">Complete!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

