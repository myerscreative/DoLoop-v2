'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import LoopCard from '@/components/loops/LoopCard';
import { LoopType, Loop } from '@/types/loop';
import { motion } from 'framer-motion';
import TargetMomentum from '@/components/ui/TargetMomentum';
import { generateMomentumData } from '@/lib/loopUtils';
import { getAllLoops, deleteLoop } from '@/lib/loopStorage';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/lib/useToast';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<LoopType | 'all'>('all');
  const [allLoops, setAllLoops] = useState<Loop[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; loopId: string | null; loopTitle: string }>({
    isOpen: false,
    loopId: null,
    loopTitle: '',
  });
  const { toast, showToast, hideToast } = useToast();

  // Function to load loops
  const loadLoops = () => {
    const storedLoops = getAllLoops();
    // Only show user-created loops (no mock data mixing)
    setAllLoops(storedLoops);
  };

  // Load loops from storage on mount and when pathname changes
  useEffect(() => {
    loadLoops();
  }, [pathname]);
  
  // Also reload when window gets focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      loadLoops();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  // Listen for storage changes from other tabs (multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'doloop-loops') {
        loadLoops();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredLoops = filter === 'all' 
    ? allLoops 
    : allLoops.filter(loop => loop.type === filter);
  
  const handleLoopClick = (loopId: string) => {
    router.push(`/loops/${loopId}`);
  };
  
  const handleDeleteClick = (loopId: string, loopTitle: string) => {
    setDeleteDialog({ isOpen: true, loopId, loopTitle });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.loopId) {
      deleteLoop(deleteDialog.loopId);
      loadLoops();
      showToast(`Loop "${deleteDialog.loopTitle}" deleted`, 'success');
      setDeleteDialog({ isOpen: false, loopId: null, loopTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, loopId: null, loopTitle: '' });
  };
  
  const handleDeleteLoop = (loopId: string) => {
    const loop = allLoops.find(l => l.id === loopId);
    if (loop) {
      handleDeleteClick(loopId, loop.title);
    }
  };
  
  // Calculate stats
  const completedLoops = allLoops.filter(
    loop => loop.completedTasks === loop.totalTasks && loop.totalTasks > 0
  ).length;
  const totalTasks = allLoops.reduce((sum, loop) => sum + loop.totalTasks, 0);
  const completedTasks = allLoops.reduce((sum, loop) => sum + loop.completedTasks, 0);
  
  // Generate momentum data from all loops
  const allHistory = allLoops.flatMap(loop => loop.completionHistory);
  const momentumData = generateMomentumData(allHistory, 7);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <Header userName="Robert" />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Search Bar */}
        <SearchBar loops={allLoops} onSelect={handleLoopClick} />
        
        {/* Create Loop Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/loops/create')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            aria-label="Create a new loop"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 12 5 L 12 19 M 5 12 L 19 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Create a new Loop</span>
          </button>
        </div>
        
        {/* Favorites Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Favorites</h2>
          {allLoops.filter(loop => loop.isFavorite).length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              {allLoops.filter(loop => loop.isFavorite).map((loop) => (
                <div
                  key={loop.id}
                  onClick={() => handleLoopClick(loop.id)}
                  className="py-3 px-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 group"
                >
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-black text-xs font-bold">+</span>
                  </div>
                  <div className="text-gray-900 flex-1">{loop.title}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(loop.id, loop.title);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-red-100 rounded text-red-600"
                    aria-label={`Delete loop "${loop.title}"`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 4 4 L 12 12 M 12 4 L 4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              <p className="text-sm">No favorite loops yet. Mark a loop as favorite when creating it!</p>
            </div>
          )}
        </motion.div>
        
        {/* My Loops Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">My Loops</h2>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            <div className="py-3 px-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="text-gray-900">My Day</div>
            </div>
            <div className="py-3 px-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="text-gray-900">Important</div>
            </div>
            <div className="py-3 px-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="text-gray-900">Planned</div>
            </div>
            <div className="py-3 px-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="text-gray-900">Assigned to me</div>
            </div>
          </div>
        </motion.div>
        
        {/* Loop Library Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Loop Library</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`py-4 px-4 rounded-xl font-medium transition-all text-left ${
                filter === 'all'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setFilter('personal')}
              className={`py-4 px-4 rounded-xl font-medium transition-all text-left ${
                filter === 'personal'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setFilter('work')}
              className={`py-4 px-4 rounded-xl font-medium transition-all text-left ${
                filter === 'work'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Work
            </button>
            <button
              className="py-4 px-4 rounded-xl font-medium transition-all text-left bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Shared
            </button>
          </div>
        </motion.div>
        
        {/* Filtered Loops List */}
        {filteredLoops.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {filter === 'all' ? 'All Loops' : filter === 'daily' ? 'Daily' : filter === 'work' ? 'Work' : 'Personal'}
            </h2>
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              {filteredLoops.map((loop) => (
                <LoopCard 
                  key={loop.id} 
                  loop={loop} 
                  onClick={handleLoopClick}
                  onDelete={handleDeleteLoop}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Empty State - Only show if filter is 'all' and no loops */}
        {filteredLoops.length === 0 && filter === 'all' && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No loops found
            </h3>
            <p className="text-gray-600">
              Create your first loop to get started!
            </p>
          </motion.div>
        )}
        
        {/* Stats & Momentum - Hidden on mobile, shown on larger screens */}
        <div className="hidden lg:block mt-12 space-y-8">
          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{allLoops.length}</div>
              <div className="text-sm text-gray-600">Active Loops</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{completedLoops}</div>
              <div className="text-sm text-gray-600">Completed Today</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </motion.div>
          
          {/* Target Momentum Visualization */}
          <motion.div
            className="bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Target Progress</h2>
                <p className="text-sm text-gray-600">More loops = more targets hit! 🎯</p>
              </div>
              <div className="text-2xl">🐝🎯</div>
            </div>
            <TargetMomentum data={momentumData} />
          </motion.div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Loop"
        message={`Are you sure you want to delete "${deleteDialog.loopTitle}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
