'use client';

import { useState } from 'react';
import { DoLoopLogo, DoLoopIcon } from '@/components/ui/DoLoopLogo';

type Theme = 'minimal' | 'playful' | 'professional';

export default function LogoDemo() {
  const [theme, setTheme] = useState<Theme>('minimal');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          DoLoop Logo System
        </h1>
        <p className="text-gray-600 mb-8">
          Theme-aware logo with animated bee
        </p>
        
        {/* Theme Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Theme</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('minimal')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                theme === 'minimal'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Minimal
            </button>
            <button
              onClick={() => setTheme('playful')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                theme === 'playful'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Playful 🐝
            </button>
            <button
              onClick={() => setTheme('professional')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                theme === 'professional'
                  ? 'bg-gray-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Professional
            </button>
          </div>
        </div>
        
        {/* Size Variations */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Size Variations</h2>
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <DoLoopLogo theme={theme} size="sm" animated={false} />
              <span className="text-sm text-gray-500">Small</span>
            </div>
            <div className="flex items-center gap-4">
              <DoLoopLogo theme={theme} size="md" animated={false} />
              <span className="text-sm text-gray-500">Medium (Default)</span>
            </div>
            <div className="flex items-center gap-4">
              <DoLoopLogo theme={theme} size="lg" animated={false} />
              <span className="text-sm text-gray-500">Large</span>
            </div>
          </div>
        </div>
        
        {/* Icon Only */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Icon Only (App Icon / Favicon)</h2>
          <div className="flex items-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="bg-gray-100 rounded-2xl p-4 inline-block mb-2">
                <DoLoopIcon size={64} theme={theme} animated={true} />
              </div>
              <p className="text-sm text-gray-600">64px (Animated)</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-2xl p-4 inline-block mb-2">
                <DoLoopIcon size={48} theme={theme} animated={false} />
              </div>
              <p className="text-sm text-gray-600">48px</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-2xl p-4 inline-block mb-2">
                <DoLoopIcon size={32} theme={theme} animated={false} />
              </div>
              <p className="text-sm text-gray-600">32px</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-2xl p-4 inline-block mb-2">
                <DoLoopIcon size={16} theme={theme} animated={false} />
              </div>
              <p className="text-sm text-gray-600">16px</p>
            </div>
          </div>
        </div>
        
        {/* Theme Comparisons */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">All Themes Side-by-Side</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-50 rounded-xl p-6 mb-3">
                <DoLoopLogo theme="minimal" size="lg" animated={true} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Minimal</h3>
              <p className="text-sm text-gray-600">Default theme - balanced & clean</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-50 rounded-xl p-6 mb-3">
                <DoLoopLogo theme="playful" size="lg" animated={true} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Playful 🐝</h3>
              <p className="text-sm text-gray-600">For families & casual users</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-50 rounded-xl p-6 mb-3">
                <DoLoopLogo theme="professional" size="lg" animated={true} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Professional</h3>
              <p className="text-sm text-gray-600">Clean & corporate (no bee)</p>
            </div>
          </div>
        </div>
        
        {/* Animation Demo */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-6">Animation Features</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">With Animation (Page Load)</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <DoLoopLogo theme={theme} size="lg" animated={true} />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Without Animation (Static)</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <DoLoopLogo theme={theme} size="lg" animated={false} />
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Animation Details:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Bee flies in along loop trail</li>
              <li>✓ Wings flutter continuously (Playful/Minimal themes)</li>
              <li>✓ Text fades in with stagger effect</li>
              <li>✓ Can be disabled for static contexts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

