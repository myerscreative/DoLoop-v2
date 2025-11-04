'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Loop, LoopItem } from '@/types/loop';
import { getLoopById, updateLoop } from '@/lib/loopStorage';
import { reloop, resetLoop } from '@/lib/loopUtils';
import { motion, AnimatePresence } from 'framer-motion';
import LoopItemOptions from '@/components/loops/LoopItemOptions';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/lib/useToast';

export default function LoopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const loopId = params?.id as string;
  const [loop, setLoop] = useState<Loop | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<LoopItem | null>(null);
  const [reloopDialog, setReloopDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleToggleItem = (itemId: string) => {
    if (!loop || !loop.items) return;
    
    const updatedItems = loop.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    const completedCount = updatedItems.filter(item => item.completed).length;
    
    const updatedLoop: Loop = {
      ...loop,
      items: updatedItems,
      completedTasks: completedCount,
      updatedAt: new Date(),
    };
    
    // Update in localStorage using new updateLoop function
    updateLoop(updatedLoop);
    setLoop(updatedLoop);
  };

  const handleReloop = () => {
    if (!loop || !loop.items) return;
    
    const recurringCount = loop.items.filter(item => item.isRecurring).length;
    if (recurringCount === 0) {
      showToast('No recurring tasks in this loop. Add recurring tasks to use the Reloop feature!', 'info');
      return;
    }
    
    setReloopDialog(true);
  };

  const handleReloopConfirm = () => {
    if (!loop || !loop.items) return;
    
    // Use the new reloop function from loopUtils
    const reloopedLoop = reloop(loop);
    
    // Update in localStorage
    updateLoop(reloopedLoop);
    setLoop(reloopedLoop);
    showToast('Loop reset successfully!', 'success');
    setReloopDialog(false);
  };

  const handleReloopCancel = () => {
    setReloopDialog(false);
  };

  const handleResetLoop = () => {
    if (!loop || !loop.items || loop.items.length === 0) {
      showToast('No tasks to reset', 'info');
      return;
    }
    
    setResetDialog(true);
  };

  const handleResetConfirm = () => {
    if (!loop || !loop.items) return;
    
    // Reset all tasks
    const resetLoopResult = resetLoop(loop);
    
    // Update in localStorage
    updateLoop(resetLoopResult);
    setLoop(resetLoopResult);
    showToast('Loop reset successfully!', 'success');
    setResetDialog(false);
  };

  const handleResetCancel = () => {
    setResetDialog(false);
  };

  const handleUpdateItem = (updatedItem: LoopItem) => {
    if (!loop || !loop.items) return;
    
    const updatedItems = loop.items.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    
    const completedCount = updatedItems.filter(item => item.completed).length;
    
    const updatedLoop: Loop = {
      ...loop,
      items: updatedItems,
      completedTasks: completedCount,
      updatedAt: new Date(),
    };
    
    // Update in localStorage using new updateLoop function
    updateLoop(updatedLoop);
    setLoop(updatedLoop);
  };

  const handleItemClick = (item: LoopItem, e: React.MouseEvent) => {
    // If clicking on checkbox area, toggle completion
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      handleToggleItem(item.id);
    } else {
      // Otherwise, open options modal
      setEditingItem(item);
    }
  };

  useEffect(() => {
    if (!loopId) return;

    // Get loop from storage using new getLoopById function
    const foundLoop = getLoopById(loopId);

    if (foundLoop) {
      setLoop(foundLoop);
    }
    setLoading(false);
  }, [loopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header userName="Robert" />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">Loading...</div>
        </main>
      </div>
    );
  }

  if (!loop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header userName="Robert" />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loop not found</h2>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:underline"
            >
              Go back home
            </button>
          </div>
        </main>
      </div>
    );
  }

  const LoopIcon = () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 24 8 Q 8 8, 8 24 Q 8 40, 24 40 Q 40 40, 40 24 Q 40 8, 24 8"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header userName="Robert" />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          aria-label="Go back"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 12 4 L 6 10 L 12 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        {/* Loop Header */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FFB800' }}
            >
              <LoopIcon />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{loop.title}</h1>
                </div>
                {loop.items && loop.items.length > 0 && (
                  <button
                    onClick={handleResetLoop}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all text-sm"
                    aria-label="Reset loop"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 12 4 Q 4 4, 4 12 Q 4 20, 12 20 Q 20 20, 20 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 20 12 L 17 9 M 20 12 L 17 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Reset Loop
                  </button>
                )}
              </div>
              {loop.description && (
                <p className="text-gray-600 mb-4">{loop.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="capitalize">{loop.type}</span>
                <span>•</span>
                <span>{loop.totalTasks} tasks</span>
                <span>•</span>
                <span className="capitalize">{loop.status}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tasks Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          </div>
          {loop.items && loop.items.length > 0 ? (
            <div className="space-y-2">
              {loop.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  onClick={(e) => handleItemClick(item, e)}
                >
                  <button
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.completed
                        ? 'bg-yellow-500 border-yellow-500'
                        : 'border-gray-300 hover:border-yellow-400'
                    }`}
                    role="checkbox"
                    aria-checked={item.completed}
                    aria-label={`Mark "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
                  >
                    {item.completed && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <span
                      className={`${
                        item.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-900'
                      }`}
                    >
                      {item.title}
                    </span>
                    {/* Icons showing item options with labels */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                      {item.isRecurring && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M 6 2 Q 2 2, 2 6 Q 2 10, 6 10 Q 10 10, 10 6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                            <path d="M 10 6 L 8 5 M 10 6 L 8 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                          <span>Recurring</span>
                        </span>
                      )}
                      {item.dueDate && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="1.5" y="2.5" width="9" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                            <path d="M 4 1 L 4 4 M 8 1 L 8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                          <span>{new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </span>
                      )}
                      {item.assignedTo && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                            <path d="M 2 10 Q 2 7, 6 7 Q 10 7, 10 10" stroke="currentColor" strokeWidth="1.2" fill="none" />
                          </svg>
                          <span>{item.assignedTo}</span>
                        </span>
                      )}
                      {item.notes && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
                            <path d="M 4 5 L 8 5 M 4 7 L 7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                          <span>Note</span>
                        </span>
                      )}
                      {item.imageUrl && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-50 text-pink-700 rounded">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="1" y="2.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                            <circle cx="4" cy="5.5" r="0.8" fill="currentColor" />
                            <path d="M 1 8 L 4 6 L 7 8 L 11 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                          <span>Image</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              No tasks yet. Add tasks when creating or editing this loop.
            </p>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 mt-6">
          <motion.div
            className="bg-white rounded-xl shadow-sm p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-2xl font-bold text-gray-900">
              {loop.completedTasks}/{loop.totalTasks}
            </div>
            <div className="text-sm text-gray-600">Tasks Completed</div>
          </motion.div>
          <motion.div
            className="bg-white rounded-xl shadow-sm p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-2xl font-bold text-yellow-600">
              {loop.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </motion.div>
          <motion.div
            className="bg-white rounded-xl shadow-sm p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-2xl font-bold text-gray-900">
              {loop.longestStreak}
            </div>
            <div className="text-sm text-gray-600">Longest Streak</div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        {loop.totalTasks > 0 && (
          <motion.div
            className="bg-white rounded-xl shadow-sm p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {Math.round((loop.completedTasks / loop.totalTasks) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(loop.completedTasks / loop.totalTasks) * 100}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Reloop Button - Prominent CTA */}
        {loop.items && loop.items.length > 0 && (
          <motion.button
            onClick={handleReloop}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 12 4 Q 4 4, 4 12 Q 4 20, 12 20 Q 20 20, 20 12"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 20 12 L 17 9 M 20 12 L 17 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span>🔄 Reloop — Start the Recipe Over!</span>
          </motion.button>
        )}
      </main>

      {/* Item Options Modal */}
      <AnimatePresence>
        {editingItem && (
          <LoopItemOptions
            item={editingItem}
            onUpdate={handleUpdateItem}
            onClose={() => setEditingItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Reloop Confirmation Dialog */}
      {loop && (
        <ConfirmDialog
          isOpen={reloopDialog}
          title="Reloop Loop"
          message={`Reloop "${loop.title}"? This will reset ${loop.items?.filter(item => item.isRecurring).length || 0} recurring task${(loop.items?.filter(item => item.isRecurring).length || 0) > 1 ? 's' : ''} while keeping one-time tasks completed.`}
          confirmText="Reloop"
          cancelText="Cancel"
          onConfirm={handleReloopConfirm}
          onCancel={handleReloopCancel}
        />
      )}

      {/* Reset Loop Confirmation Dialog */}
      {loop && (
        <ConfirmDialog
          isOpen={resetDialog}
          title="Reset Loop"
          message={`Reset "${loop.title}"? This will uncheck all ${loop.items?.length || 0} task${(loop.items?.length || 0) > 1 ? 's' : ''} and start fresh.`}
          confirmText="Reset"
          cancelText="Cancel"
          onConfirm={handleResetConfirm}
          onCancel={handleResetCancel}
        />
      )}

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

