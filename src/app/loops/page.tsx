'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoopCard from '@/components/loops/LoopCard';
import { getAllLoops, deleteLoop } from '@/lib/loopStorage';
import { LoopType, Loop } from '@/types/loop';

export default function LoopsLibraryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<LoopType | 'all'>('all');
  const [allLoops, setAllLoops] = useState<Loop[]>([]);

  useEffect(() => {
    // Load user-created loops only
    const loops = getAllLoops();
    setAllLoops(loops);
  }, []);

  const filteredLoops = filter === 'all' 
    ? allLoops 
    : allLoops.filter(loop => loop.type === filter);

  const handleLoopClick = (loopId: string) => {
    router.push(`/loops/${loopId}`);
  };

  const handleDeleteLoop = (loopId: string) => {
    deleteLoop(loopId);
    setAllLoops(getAllLoops());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Loop Library
          </h1>
          <p className="text-gray-600">
            Browse and manage your loops
          </p>
        </div>
        
        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Loops ({allLoops.length})
            </button>
            <button
              onClick={() => setFilter('daily')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'daily'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Daily ({allLoops.filter(l => l.type === 'daily').length})
            </button>
            <button
              onClick={() => setFilter('work')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'work'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
              }`}
            >
              Work ({allLoops.filter(l => l.type === 'work').length})
            </button>
            <button
              onClick={() => setFilter('personal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'personal'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Personal ({allLoops.filter(l => l.type === 'personal').length})
            </button>
          </div>
        </div>
        
        {/* Loop Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLoops.map((loop) => (
            <LoopCard
              key={loop.id}
              loop={loop}
              onClick={handleLoopClick}
              onDelete={handleDeleteLoop}
            />
          ))}
        </div>
        
        {/* Empty State */}
        {filteredLoops.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No loops found</p>
          </div>
        )}
        
        {/* Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Component Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Circular progress indicator</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Type badges (Daily/Work/Personal)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Task completion count</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Streak indicator with fire emoji</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Hover and click animations</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Color-coded by loop type</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Completion state (green when done)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Responsive grid layout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

