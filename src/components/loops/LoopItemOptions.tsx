'use client';

import { useState } from 'react';
import { LoopItem } from '@/types/loop';
import { motion, AnimatePresence } from 'framer-motion';

interface LoopItemOptionsProps {
  item: LoopItem;
  onUpdate: (updatedItem: LoopItem) => void;
  onClose: () => void;
}

export function LoopItemOptions({ item, onUpdate, onClose }: LoopItemOptionsProps) {
  const [editedItem, setEditedItem] = useState<LoopItem>(item);

  const handleSave = () => {
    onUpdate(editedItem);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">Item Options</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close dialog"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M 6 6 L 18 18 M 18 6 L 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Item Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name
            </label>
            <input
              type="text"
              value={editedItem.title}
              onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M 10 4 Q 4 4, 4 10 Q 4 16, 10 16 Q 16 16, 16 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-medium text-gray-900">Recurring item</span>
            </div>
            <button
              onClick={() => setEditedItem({ ...editedItem, isRecurring: !editedItem.isRecurring })}
              className={`w-12 h-6 rounded-full transition-colors ${
                editedItem.isRecurring ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={editedItem.isRecurring}
              aria-label="Toggle recurring item"
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                editedItem.isRecurring ? 'transform translate-x-6' : 'transform translate-x-1'
              }`} />
            </button>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M 7 2 L 7 6 M 13 2 L 13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Due Date
            </label>
            <input
              type="date"
              value={editedItem.dueDate || ''}
              onChange={(e) => setEditedItem({ ...editedItem, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M 5 17 Q 5 13, 10 13 Q 15 13, 15 17" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              Assign To
            </label>
            <input
              type="text"
              value={editedItem.assignedTo || ''}
              onChange={(e) => setEditedItem({ ...editedItem, assignedTo: e.target.value })}
              placeholder="Enter name or email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M 4 4 Q 4 3, 5 3 L 15 3 Q 16 3, 16 4 L 16 16 Q 16 17, 15 17 L 5 17 Q 4 17, 4 16 Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              Notes
            </label>
            <textarea
              value={editedItem.notes || ''}
              onChange={(e) => setEditedItem({ ...editedItem, notes: e.target.value })}
              placeholder="Add notes..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="7" cy="9" r="1.5" fill="currentColor" />
                <path d="M 2 13 L 7 9 L 11 12 L 18 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Image URL
            </label>
            <input
              type="text"
              value={editedItem.imageUrl || ''}
              onChange={(e) => setEditedItem({ ...editedItem, imageUrl: e.target.value })}
              placeholder="Enter image URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LoopItemOptions;

