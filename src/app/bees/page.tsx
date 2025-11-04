'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import BeeMomentum from '@/components/ui/BeeMomentum';
import { BeeDot, BeeSwarm, FloatingBee, BeeTrail } from '@/components/ui/BeeDot';
import { MomentumData } from '@/types/loop';

export default function BeesDemo() {
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
    { name: 'Perfect Week', data: perfectWeek, emoji: '🐝' },
    { name: 'Building Momentum', data: buildingMomentum, emoji: '📈' },
    { name: 'Inconsistent', data: inconsistent, emoji: '📊' },
    { name: 'Recovery Mode', data: recovery, emoji: '🌱' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🐝 Bees as Productivity Indicators
        </h1>
        <p className="text-gray-600 mb-8">
          Small yellow dots = bees. More activity = more bees buzzing around!
        </p>
        
        {/* Concept Explanation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-yellow-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">The Concept</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong className="text-yellow-600">Bees are small. They're like yellow dots.</strong>
            </p>
            <p>
              When you're productive, more bees appear around the interface - just like you'd see if bees were actually flying around you. This makes the "minimal yellow" make perfect sense:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="w-3 h-3 rounded-full bg-gray-200 mx-auto mb-2" />
                <p className="text-sm font-medium">0 bees</p>
                <p className="text-xs text-gray-500">No activity</p>
              </div>
              <div className="text-center">
                <div className="flex gap-0.5 justify-center mb-2">
                  <BeeDot size={6} animate={false} />
                  <BeeDot size={6} animate={false} />
                </div>
                <p className="text-sm font-medium">1-2 bees</p>
                <p className="text-xs text-gray-500">Light activity</p>
              </div>
              <div className="text-center">
                <div className="flex gap-0.5 justify-center mb-2">
                  <BeeDot size={6} animate={false} />
                  <BeeDot size={6} animate={false} />
                  <BeeDot size={6} animate={false} />
                  <BeeDot size={6} animate={false} />
                </div>
                <p className="text-sm font-medium">3-4 bees</p>
                <p className="text-xs text-gray-500">Good momentum</p>
              </div>
              <div className="text-center">
                <div className="flex gap-0.5 justify-center mb-2">
                  <BeeSwarm count={5} size={6} spacing="tight" animate={false} />
                </div>
                <p className="text-sm font-medium">5+ bees</p>
                <p className="text-xs text-gray-500">SWARM! 🐝</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dataset Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Select Activity Pattern</h2>
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
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300'
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
              <p className="text-sm text-gray-600">Bee activity over the last 7 days</p>
            </div>
          </div>
          <BeeMomentum data={selectedData} />
        </div>
        
        {/* Component Showcase */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Bee Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bee Swarm */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Bee Swarm</h3>
              <p className="text-sm text-gray-600 mb-4">
                Used on loop cards for streaks and completion
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">3 bees (normal spacing)</p>
                  <BeeSwarm count={3} size={8} spacing="normal" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">5 bees (tight spacing) - Swarm!</p>
                  <BeeSwarm count={5} size={6} spacing="tight" />
                </div>
              </div>
            </div>
            
            {/* Floating Bee */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Floating Bee</h3>
              <p className="text-sm text-gray-600 mb-4">
                Gentle floating animation for ambient effects
              </p>
              <div className="flex items-center gap-4">
                <FloatingBee size={10} duration={2} />
                <FloatingBee size={10} duration={2.5} delay={0.5} />
                <FloatingBee size={10} duration={3} delay={1} />
              </div>
            </div>
            
            {/* Bee Trail */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Bee Trail</h3>
              <p className="text-sm text-gray-600 mb-4">
                Shows movement or progress flow
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Horizontal</p>
                  <BeeTrail count={5} direction="horizontal" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Diagonal</p>
                  <BeeTrail count={4} direction="diagonal" />
                </div>
              </div>
            </div>
            
            {/* Single Bee Dot */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Bee Dot</h3>
              <p className="text-sm text-gray-600 mb-4">
                Basic building block - customizable size
              </p>
              <div className="flex items-center gap-4">
                <BeeDot size={6} />
                <BeeDot size={8} />
                <BeeDot size={10} />
                <BeeDot size={12} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Use Cases */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-semibold mb-4">Where Bees Appear</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-50">
            <div>
              <h3 className="font-semibold text-white mb-2">🐝 Momentum Chart</h3>
              <p className="text-sm">
                Stacked bees (0-5) show daily activity. Swarms wiggle to celebrate high productivity!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🐝 Loop Cards</h3>
              <p className="text-sm">
                Completed loops show 5-bee swarms. Long streaks show 1-5 bees based on streak length.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🐝 Ambient Effects</h3>
              <p className="text-sm">
                Floating bees can appear during loading, after completions, or as decorative elements.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🐝 Progress Indicators</h3>
              <p className="text-sm">
                Bee trails can show flow, movement, or connection between related items.
              </p>
            </div>
          </div>
        </div>
        
        {/* Design Philosophy */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4">Design Philosophy</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong className="text-yellow-600">✅ Bees = Small yellow dots</strong><br />
              Every yellow dot is now meaningful - it represents a bee!
            </p>
            <p>
              <strong className="text-yellow-600">✅ More activity = More bees</strong><br />
              Natural visual feedback that makes sense intuitively.
            </p>
            <p>
              <strong className="text-yellow-600">✅ Swarms = Success celebration</strong><br />
              When you hit peak performance, bees swarm and wiggle with excitement!
            </p>
            <p>
              <strong className="text-yellow-600">✅ Minimal yellow now makes sense</strong><br />
              Yellow isn't just an accent - it's literally bees buzzing around your productivity!
            </p>
            <p>
              <strong className="text-yellow-600">✅ Natural & playful</strong><br />
              Busy like bees! The metaphor is perfect for productivity apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

