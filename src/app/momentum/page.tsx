'use client';

import { useState } from 'react';
import MomentumVisualization from '@/components/ui/MomentumVisualization';
import { MomentumData } from '@/types/loop';

export default function MomentumDemo() {
  // Sample data sets
  const perfectWeek: MomentumData[] = [
    { date: '2025-10-24', intensity: 0.9, loopsCompleted: 5 },
    { date: '2025-10-25', intensity: 1.0, loopsCompleted: 6 },
    { date: '2025-10-26', intensity: 0.95, loopsCompleted: 5 },
    { date: '2025-10-27', intensity: 1.0, loopsCompleted: 6 },
    { date: '2025-10-28', intensity: 0.85, loopsCompleted: 4 },
    { date: '2025-10-29', intensity: 0.9, loopsCompleted: 5 },
    { date: '2025-10-30', intensity: 1.0, loopsCompleted: 6 },
  ];
  
  const buildingMomentum: MomentumData[] = [
    { date: '2025-10-24', intensity: 0.2, loopsCompleted: 1 },
    { date: '2025-10-25', intensity: 0.3, loopsCompleted: 2 },
    { date: '2025-10-26', intensity: 0.4, loopsCompleted: 2 },
    { date: '2025-10-27', intensity: 0.6, loopsCompleted: 3 },
    { date: '2025-10-28', intensity: 0.7, loopsCompleted: 4 },
    { date: '2025-10-29', intensity: 0.85, loopsCompleted: 5 },
    { date: '2025-10-30', intensity: 0.95, loopsCompleted: 5 },
  ];
  
  const inconsistent: MomentumData[] = [
    { date: '2025-10-24', intensity: 0.8, loopsCompleted: 4 },
    { date: '2025-10-25', intensity: 0.1, loopsCompleted: 1 },
    { date: '2025-10-26', intensity: 0.9, loopsCompleted: 5 },
    { date: '2025-10-27', intensity: 0, loopsCompleted: 0 },
    { date: '2025-10-28', intensity: 0.7, loopsCompleted: 4 },
    { date: '2025-10-29', intensity: 0.3, loopsCompleted: 2 },
    { date: '2025-10-30', intensity: 1.0, loopsCompleted: 6 },
  ];
  
  const recovery: MomentumData[] = [
    { date: '2025-10-24', intensity: 0, loopsCompleted: 0 },
    { date: '2025-10-25', intensity: 0, loopsCompleted: 0 },
    { date: '2025-10-26', intensity: 0, loopsCompleted: 0 },
    { date: '2025-10-27', intensity: 0.2, loopsCompleted: 1 },
    { date: '2025-10-28', intensity: 0.4, loopsCompleted: 2 },
    { date: '2025-10-29', intensity: 0.6, loopsCompleted: 3 },
    { date: '2025-10-30', intensity: 0.8, loopsCompleted: 4 },
  ];
  
  const [selectedData, setSelectedData] = useState(perfectWeek);
  const [dataName, setDataName] = useState('Perfect Week');
  
  const datasets = [
    { name: 'Perfect Week', data: perfectWeek, emoji: '🔥' },
    { name: 'Building Momentum', data: buildingMomentum, emoji: '📈' },
    { name: 'Inconsistent', data: inconsistent, emoji: '📊' },
    { name: 'Recovery Mode', data: recovery, emoji: '🌱' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Momentum Visualization
        </h1>
        <p className="text-gray-600 mb-8">
          7-day activity tracker showing your consistency
        </p>
        
        {/* Dataset Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Select Pattern</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {datasets.map((dataset) => (
              <button
                key={dataset.name}
                onClick={() => {
                  setSelectedData(dataset.data);
                  setDataName(dataset.name);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  dataName === dataset.name
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-3xl mb-2">{dataset.emoji}</div>
                <div className="text-sm font-medium text-gray-900">
                  {dataset.name}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Visualization */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{dataName}</h2>
              <p className="text-sm text-gray-600">Your momentum over the last 7 days</p>
            </div>
          </div>
          <MomentumVisualization data={selectedData} />
        </div>
        
        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Visual Intensity</h3>
                <p className="text-sm text-gray-600">
                  Bar height and color show activity level
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">✨</div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Pulse Animation</h3>
                <p className="text-sm text-gray-600">
                  High-momentum days glow to celebrate success
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Hover Details</h3>
                <p className="text-sm text-gray-600">
                  See exact loop count for each day
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">📍</div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Today Marker</h3>
                <p className="text-sm text-gray-600">
                  Current day is highlighted with a dot
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎨</div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Color Scale</h3>
                <p className="text-sm text-gray-600">
                  Gray to purple gradient shows progress
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">🌊</div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Recency Weight</h3>
                <p className="text-sm text-gray-600">
                  Recent days have higher visual impact
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Design Philosophy */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-semibold mb-4">Design Philosophy</h2>
          <div className="space-y-3 text-purple-50">
            <p>
              <strong className="text-white">Non-judgmental:</strong> Low activity shows gray, not red. We don't punish missed days.
            </p>
            <p>
              <strong className="text-white">Celebration-focused:</strong> High momentum gets glowing animations and vibrant colors.
            </p>
            <p>
              <strong className="text-white">Progress-oriented:</strong> The visualization naturally shows improvement trends over time.
            </p>
            <p>
              <strong className="text-white">Minimal pressure:</strong> No streaks counter that creates anxiety. Just pure momentum visualization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

