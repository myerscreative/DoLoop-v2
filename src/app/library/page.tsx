'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import LoopCard from '@/components/loops/LoopCard';
import { mockLoops } from '@/lib/mockData';
import { LoopType } from '@/types/loop';
import { motion } from 'framer-motion';

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<LoopType | 'all' | 'shared'>('all');
  
  const handleLoopClick = (loopId: string) => {
    // TODO: Navigate to loop detail page
  };
  
  // Organize loops by category
  const loopsByCategory = {
    all: mockLoops,
    daily: mockLoops.filter(loop => loop.type === 'daily'),
    work: mockLoops.filter(loop => loop.type === 'work'),
    personal: mockLoops.filter(loop => loop.type === 'personal'),
    shared: [], // Empty for now
  };
  
  const currentLoops = loopsByCategory[selectedCategory];
  
  const categories = [
    { id: 'all' as const, name: 'Favorites', color: 'yellow' },
    { id: 'personal' as const, name: 'Personal', color: 'red' },
    { id: 'work' as const, name: 'Work', color: 'cyan' },
    { id: 'shared' as const, name: 'Shared', color: 'gray' },
  ];
  
  const getCategoryColor = (color: string) => {
    const colors = {
      yellow: 'bg-yellow-500 text-white',
      red: 'bg-red-500 text-white',
      cyan: 'bg-cyan-500 text-white',
      gray: 'bg-gray-500 text-white',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <Header userName="Robert" />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Page Title */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loop Library</h1>
          <p className="text-gray-600">Browse loops by category</p>
        </motion.div>
        
        {/* Category Grid */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`py-4 px-4 rounded-xl font-medium transition-all text-left ${
                  selectedCategory === category.id
                    ? `${getCategoryColor(category.color)} shadow-md`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Loops List for Selected Category */}
        {currentLoops.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {selectedCategory === 'all' ? 'All Loops' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              {currentLoops.map((loop) => (
                <LoopCard 
                  key={loop.id} 
                  loop={loop} 
                  onClick={handleLoopClick}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Empty State */}
        {currentLoops.length === 0 && (
          <motion.div
            className="text-center py-16 bg-white rounded-xl shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No loops in this category
            </h3>
            <p className="text-gray-600">
              {selectedCategory === 'shared' 
                ? 'No shared loops yet'
                : 'Select a different category or create your first loop'}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

