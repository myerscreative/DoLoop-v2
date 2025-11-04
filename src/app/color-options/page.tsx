'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@/components/ui/CircularProgress';
import { DoLoopLogo } from '@/components/ui/DoLoopLogo';

type ColorOption = 'option1' | 'option2' | 'option3' | 'current';

export default function ColorOptions() {
  const [selected, setSelected] = useState<ColorOption>('option1');
  
  const options = {
    current: {
      name: 'Current (Purple-Heavy)',
      emoji: '💜',
      header: 'bg-gradient-to-r from-[#667eea] to-[#764ba2]',
      headerText: 'text-white',
      momentum: ['bg-gray-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600'],
      buttonActive: 'bg-purple-600 text-white',
      buttonInactive: 'bg-white text-gray-700 border border-gray-200',
      stats: 'text-purple-600',
      description: 'What you have now - purple is the dominant color',
    },
    option1: {
      name: 'Bee-Forward (Yellow Primary)',
      emoji: '🐝',
      header: 'bg-gradient-to-r from-[#FFB800] to-[#FF8C00]',
      headerText: 'text-white',
      momentum: ['bg-gray-200', 'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600'],
      buttonActive: 'bg-yellow-500 text-white',
      buttonInactive: 'bg-white text-gray-700 border border-gray-200',
      stats: 'text-yellow-600',
      description: 'All-in on yellow - warm, energetic, bee-centric. Purple becomes accent only.',
    },
    option2: {
      name: 'Bee + Purple Balance',
      emoji: '🐝💜',
      header: 'bg-gradient-to-r from-[#FFB800] via-[#FF8C00] to-[#764ba2]',
      headerText: 'text-white',
      momentum: ['bg-gray-200', 'bg-yellow-300', 'bg-orange-400', 'bg-purple-400', 'bg-purple-600'],
      buttonActive: 'bg-gradient-to-r from-yellow-500 to-purple-600 text-white',
      buttonInactive: 'bg-white text-gray-700 border border-gray-200',
      stats: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-purple-600',
      description: 'Best of both worlds - yellow leads, purple complements. Creates visual hierarchy.',
    },
    option3: {
      name: 'Minimal Yellow Accents',
      emoji: '✨',
      header: 'bg-gradient-to-r from-gray-50 to-blue-50',
      headerText: 'text-gray-900',
      momentum: ['bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-yellow-400', 'bg-yellow-500'],
      buttonActive: 'bg-yellow-500 text-white',
      buttonInactive: 'bg-white text-gray-700 border border-gray-200',
      stats: 'text-yellow-600',
      description: 'Clean and subtle - yellow only appears as highlights and for peak performance.',
    },
  };
  
  const current = options[selected];
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          DoLoop Color Schemes
        </h1>
        <p className="text-gray-600 mb-8">
          Compare different color approaches - which feels right?
        </p>
        
        {/* Option Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(Object.keys(options) as ColorOption[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selected === key
                  ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-yellow-300'
              }`}
            >
              <div className="text-3xl mb-2">{options[key].emoji}</div>
              <div className="text-sm font-semibold text-gray-900">
                {options[key].name}
              </div>
            </button>
          ))}
        </div>
        
        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-blue-900 font-medium">
            {current.description}
          </p>
        </div>
        
        {/* Preview */}
        <div className="space-y-6">
          {/* Header Preview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <h3 className="px-6 pt-4 text-lg font-semibold text-gray-900">Header</h3>
            <div className={`${current.header} ${current.headerText} p-8`}>
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div>
                  <h1 className="text-3xl font-bold mb-1">Good evening, Robert</h1>
                  <p className="opacity-90 text-sm">Thursday, October 30</p>
                </div>
                <DoLoopLogo 
                  theme="minimal" 
                  size="md" 
                  animated={false}
                  headerLight={selected !== 'option3'}
                />
              </div>
            </div>
          </div>
          
          {/* Stats Cards Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className={`text-2xl font-bold ${current.stats}`}>6</div>
                <div className="text-sm text-gray-600">Active Loops</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className={`text-2xl font-bold ${current.stats}`}>2</div>
                <div className="text-sm text-gray-600">Completed Today</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className={`text-2xl font-bold ${current.stats}`}>67%</div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
            </div>
          </div>
          
          {/* Momentum Bars Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Momentum Visualization (7 Days)
            </h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const heights = [20, 40, 60, 50, 80, 70, 100];
                const colorIndex = Math.floor((heights[i] / 100) * 4);
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end h-24">
                      <motion.div
                        className={`w-full rounded-t-lg ${current.momentum[colorIndex]}`}
                        style={{ height: `${heights[i]}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.1 }}
                      />
                    </div>
                    <div className={`text-xs font-medium ${i === 6 ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                      {day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Filter Buttons Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Buttons</h3>
            <div className="flex gap-3">
              <button className={`px-4 py-2 rounded-lg font-medium transition-all ${current.buttonActive} shadow-md`}>
                All Loops
              </button>
              <button className={`px-4 py-2 rounded-lg font-medium transition-all ${current.buttonInactive} hover:bg-gray-50`}>
                Daily
              </button>
              <button className={`px-4 py-2 rounded-lg font-medium transition-all ${current.buttonInactive} hover:bg-gray-50`}>
                Work
              </button>
              <button className={`px-4 py-2 rounded-lg font-medium transition-all ${current.buttonInactive} hover:bg-gray-50`}>
                Personal
              </button>
            </div>
          </div>
          
          {/* Loop Cards Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loop Cards (Type Colors Remain)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Daily Loop */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CircularProgress
                    progress={60}
                    size={60}
                    strokeWidth={5}
                    gradientColors={['#FFB800', '#FF8C00']}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 bg-orange-100 text-orange-700">
                      Daily
                    </span>
                    <h4 className="text-sm font-semibold text-gray-900">Morning Routine</h4>
                    <p className="text-xs text-gray-600 mt-1">3/5 tasks • 60%</p>
                  </div>
                </div>
              </div>
              
              {/* Work Loop */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CircularProgress
                    progress={100}
                    size={60}
                    strokeWidth={5}
                    gradientColors={['#4CAF50', '#388E3C']}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 bg-cyan-100 text-cyan-700">
                      Work
                    </span>
                    <h4 className="text-sm font-semibold text-gray-900">Code Review</h4>
                    <p className="text-xs text-green-600 font-medium mt-1">✓ Complete!</p>
                  </div>
                </div>
              </div>
              
              {/* Personal Loop */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CircularProgress
                    progress={33}
                    size={60}
                    strokeWidth={5}
                    gradientColors={['#F44336', '#D32F2F']}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 bg-red-100 text-red-700">
                      Personal
                    </span>
                    <h4 className="text-sm font-semibold text-gray-900">Learning Spanish</h4>
                    <p className="text-xs text-gray-600 mt-1">1/3 tasks • 33%</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Note: Loop type colors (Daily=Orange, Work=Cyan, Personal=Red) stay the same across all options
            </p>
          </div>
        </div>
        
        {/* Comparison Notes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <div className="text-3xl mb-2">🐝</div>
            <h3 className="font-semibold text-gray-900 mb-2">Option 1: Bee-Forward</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Strong bee identity</li>
              <li>✅ Warm & energetic</li>
              <li>✅ Family-friendly</li>
              <li>⚠️ Might be too bright</li>
              <li>⚠️ Less professional look</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-purple-50 rounded-xl p-6 border border-purple-200">
            <div className="text-3xl mb-2">🐝💜</div>
            <h3 className="font-semibold text-gray-900 mb-2">Option 2: Balanced</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Best of both colors</li>
              <li>✅ Visual hierarchy</li>
              <li>✅ Works for all audiences</li>
              <li>✅ Energetic + sophisticated</li>
              <li>✅ Unique gradient</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Option 3: Minimal</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Clean & modern</li>
              <li>✅ Professional</li>
              <li>✅ Yellow as reward</li>
              <li>⚠️ Bee less prominent</li>
              <li>⚠️ Less distinctive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

