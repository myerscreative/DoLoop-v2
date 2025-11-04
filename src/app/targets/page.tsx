'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TargetMomentum from '@/components/ui/TargetMomentum';
import BullseyeTargetMinimal from '@/components/ui/BullseyeTargetMinimal';
import { MomentumData } from '@/types/loop';

export default function TargetsDemo() {
  // Sample data sets
  const perfectAim: MomentumData[] = [
    { date: '2025-10-24', intensity: 0.9, loopsCompleted: 5 },
    { date: '2025-10-25', intensity: 1.0, loopsCompleted: 6 },
    { date: '2025-10-26', intensity: 0.95, loopsCompleted: 5 },
    { date: '2025-10-27', intensity: 1.0, loopsCompleted: 6 },
    { date: '2025-10-28', intensity: 0.85, loopsCompleted: 4 },
    { date: '2025-10-29', intensity: 0.9, loopsCompleted: 5 },
    { date: '2025-10-30', intensity: 1.0, loopsCompleted: 6 },
  ];
  
  const gettingBetter: MomentumData[] = [
    { date: '2025-10-24', intensity: 0.2, loopsCompleted: 1 },
    { date: '2025-10-25', intensity: 0.3, loopsCompleted: 2 },
    { date: '2025-10-26', intensity: 0.4, loopsCompleted: 2 },
    { date: '2025-10-27', intensity: 0.6, loopsCompleted: 3 },
    { date: '2025-10-28', intensity: 0.7, loopsCompleted: 4 },
    { date: '2025-10-29', intensity: 0.85, loopsCompleted: 5 },
    { date: '2025-10-30', intensity: 0.95, loopsCompleted: 5 },
  ];
  
  const [selectedData, setSelectedData] = useState(perfectAim);
  const [dataName, setDataName] = useState('Perfect Aim');
  
  const datasets = [
    { name: 'Perfect Aim', data: perfectAim, emoji: '🎯' },
    { name: 'Getting Better', data: gettingBetter, emoji: '📈' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎯🐝 Bullseye Targets
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Goals You're Hitting!
          </p>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">The Dual Metaphor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Targets = Goals Hit</h3>
                <p className="text-gray-700 text-sm">
                  Bullseye targets visually represent accomplishments. Each target hit is a goal achieved!
                </p>
              </div>
              <div>
                <div className="text-4xl mb-2">🐝</div>
                <h3 className="font-semibold text-gray-900 mb-2">Yellow/Gold = Bee Colors</h3>
                <p className="text-gray-700 text-sm">
                  The yellow/gold colors maintain bee branding. The bee lands on targets to celebrate your wins!
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Style Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Two Styles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Playful Style */}
            <div className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
              <h3 className="font-semibold text-lg mb-3">🎯 Playful (Rounded Square)</h3>
              <p className="text-sm text-gray-700 mb-4">
                Used for daily activity, completed loops, general wins
              </p>
              <ul className="text-xs text-gray-600 mb-4 space-y-1">
                <li>✓ Rounded square design (clean stacking)</li>
                <li>✓ Concentric gold & black squares</li>
              </ul>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <BullseyeTargetMinimal size={24} />
                  <span className="text-sm text-gray-700">Single minimal target</span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Swarm of 5 (completion)</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <BullseyeTargetMinimal key={i} size={20} delay={i * 0.05} animate={false} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Achievement Style */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="font-semibold text-lg mb-3">🏆 Achievement (Rounded Square)</h3>
              <p className="text-sm text-gray-700 mb-4">
                Used for streaks, milestones, special achievements
              </p>
              <ul className="text-xs text-gray-600 mb-4 space-y-1">
                <li>✓ Rounded square design (consistent)</li>
                <li>✓ Gold target squares (reward feeling)</li>
              </ul>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <BullseyeTargetMinimal size={24} />
                  <span className="text-sm text-gray-700">Minimal badge</span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Streak badges (3 targets)</p>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <BullseyeTargetMinimal key={i} size={18} delay={i * 0.05} animate={false} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dataset Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Select Activity Pattern</h2>
          <div className="grid grid-cols-2 gap-3">
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
              <p className="text-sm text-gray-600">Target hits over the last 7 days</p>
            </div>
          </div>
          <TargetMomentum data={selectedData} />
        </div>
        
        {/* Component Showcase */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Component Showcase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Swarm */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Target Swarm</h3>
              <p className="text-sm text-gray-600 mb-4">
                Multiple targets grouped together
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Minimal style (3 targets)</p>
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <BullseyeTargetMinimal key={i} size={20} delay={i * 0.05} animate={false} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Minimal style (5 targets)</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <BullseyeTargetMinimal key={i} size={16} delay={i * 0.05} animate={false} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Target */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Floating Target</h3>
              <p className="text-sm text-gray-600 mb-4">
                Gentle floating animation for ambient effects
              </p>
              <div className="flex items-center gap-6 h-32 justify-center">
                <motion.div
                  animate={{
                    y: [-10, 10, -10],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <BullseyeTargetMinimal size={24} animate={false} />
                </motion.div>
                <motion.div
                  animate={{
                    y: [-10, 10, -10],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <BullseyeTargetMinimal size={24} animate={false} />
                </motion.div>
              </div>
            </div>
            
            {/* Target Trail */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Target Trail</h3>
              <p className="text-sm text-gray-600 mb-4">
                Shows movement or progress paths
              </p>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Horizontal trail</p>
                  <div className="flex gap-3">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                      >
                        <BullseyeTargetMinimal size={16} animate={false} />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Diagonal trail</p>
                  <div className="relative" style={{ height: '60px', width: '80px' }}>
                    {[...Array(4)].map((_, i) => {
                      const spacing = 20;
                      return (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{ left: i * spacing, top: i * spacing }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                        >
                          <BullseyeTargetMinimal size={14} animate={false} />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Single Target */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Single Target</h3>
              <p className="text-sm text-gray-600 mb-4">
                Basic building block - minimal design
              </p>
              <div className="flex items-center gap-6 justify-center">
                <div className="flex flex-col items-center gap-2">
                  <BullseyeTargetMinimal size={30} />
                  <span className="text-xs text-gray-600">Minimal target</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BullseyeTargetMinimal size={30} />
                  <span className="text-xs text-gray-600">Consistent style</span>
                </div>
              </div>
            </div>
            
            {/* Minimal Target */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Minimal Target</h3>
              <p className="text-sm text-gray-600 mb-4">
                Simplified design - perfect for stacking
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Single minimal target</p>
                  <div className="flex justify-center">
                    <BullseyeTargetMinimal size={48} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Stacked (tight column)</p>
                  <div className="flex flex-col items-center gap-2">
                    {[...Array(6)].map((_, i) => (
                      <BullseyeTargetMinimal key={i} size={60} delay={i * 0.05} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Use Cases */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-semibold mb-4">Where Targets Appear</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-50">
            <div>
              <h3 className="font-semibold text-white mb-2">🎯 Momentum Chart</h3>
              <p className="text-sm">
                Stacked targets (0-5) show daily activity. Perfect aim (5 targets) glows and wiggles!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🎯 Loop Cards</h3>
              <p className="text-sm">
                Completed loops show 5 playful targets with bee. Streaks show achievement shields.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🎯 Ambient Effects</h3>
              <p className="text-sm">
                Floating targets can appear during loading, after completions, or as decorative elements.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🎯 Progress Indicators</h3>
              <p className="text-sm">
                Target trails can show flow, movement, or connection between related items.
              </p>
            </div>
          </div>
        </div>
        
        {/* Design Philosophy */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4">Why This Is Perfect</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong className="text-yellow-600">✅ Dual meaning:</strong> Targets = goals hit + bee colors
            </p>
            <p>
              <strong className="text-yellow-600">✅ More recognizable:</strong> Everyone knows target = success
            </p>
            <p>
              <strong className="text-yellow-600">✅ Better than dots:</strong> Has shape, meaning, context
            </p>
            <p>
              <strong className="text-yellow-600">✅ Playful + Professional:</strong> Two styles for different contexts
            </p>
            <p>
              <strong className="text-yellow-600">✅ Bee integration:</strong> Lands on targets naturally
            </p>
            <p>
              <strong className="text-yellow-600">✅ Visual hierarchy:</strong> Clearer than uniform dots
            </p>
            <p>
              <strong className="text-yellow-600">✅ Celebration-focused:</strong> Glow effect on perfect days
            </p>
            <p>
              <strong className="text-yellow-600">✅ Non-judgmental:</strong> Gray circle (not red X) for empty days
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-lg font-semibold text-gray-900">
              The bee landing on targets is the <span className="text-yellow-600">*chef's kiss*</span> 🐝🎯✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

