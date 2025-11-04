'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { addLoop } from '@/lib/loopStorage';
import { Loop } from '@/types/loop';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/lib/useToast';

const colors = [
  { name: 'Yellow', value: '#FFB800' },
  { name: 'Red', value: '#F44336' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Dark Blue', value: '#1976D2' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Magenta', value: '#E91E63' },
  { name: 'Peach', value: '#FFAB91' },
  { name: 'Light Pink', value: '#F8BBD0' },
  { name: 'Light Green', value: '#A5D6A7' },
  { name: 'Light Blue', value: '#90CAF9' },
  { name: 'Light Purple', value: '#CE93D8' },
];

interface LoopItem {
  id: string;
  title: string;
  completed: boolean;
  isLoop: boolean; // Can this item be a sub-loop?
}

export default function CreateLoopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedColor, setSelectedColor] = useState<string>(colors[0].value);
  const [loopName, setLoopName] = useState('');
  const [loopType, setLoopType] = useState<'daily' | 'work' | 'personal'>('daily');
  const [step, setStep] = useState<'color' | 'name' | 'items'>('color');
  const [items, setItems] = useState<LoopItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // Check if we're editing an existing loop
  useEffect(() => {
    const name = searchParams.get('name');
    const color = searchParams.get('color');
    if (name) {
      setLoopName(name);
      setStep('items');
    }
    if (color) {
      setSelectedColor(color);
    }
  }, [searchParams]);

  const handleNext = () => {
    if (step === 'color') {
      setStep('name');
    } else if (step === 'name' && loopName.trim()) {
      setStep('items');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  const handleSave = () => {
    if (!loopName.trim()) {
      showToast('Please enter a loop name', 'error');
      return;
    }
    
    try {
      // Create the new loop
      const newLoop: Loop = {
        id: Date.now().toString(),
        title: loopName,
        type: loopType,
        status: 'active',
        totalTasks: items.length,
        completedTasks: items.filter(item => item.completed).length,
        createdAt: new Date(),
        updatedAt: new Date(),
        currentStreak: 0,
        longestStreak: 0,
        completionHistory: [],
        isFavorite: isFavorite,
        items: items.map((item, index) => ({
          id: item.id,
          title: item.title,
          completed: item.completed,
          order: index,
        })),
      };

      // Save to localStorage
      addLoop(newLoop);

      // Navigate to home page with a refresh parameter to force reload
      showToast(`Loop "${loopName}" created successfully!`, 'success');
      router.push('/?refresh=true');
      router.refresh();
    } catch (error) {
      showToast(`Error saving loop: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          title: newItemName.trim(),
          completed: false,
          isLoop: false,
        },
      ]);
      setNewItemName('');
    }
  };

  const handleToggleItem = (itemId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

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

  if (step === 'color') {
    return (
      <div className="min-h-screen bg-white">
        <Header userName="Robert" />
        <main className="max-w-md mx-auto px-4 py-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="mb-4">
              {/* Bee illustration placeholder */}
              <div className="w-24 h-24 mx-auto bg-yellow-300 rounded-full flex items-center justify-center">
                <span className="text-4xl">🐝</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create a new DoLoop
            </h1>
            <p className="text-gray-600 text-sm">
              Choose a color for your loop
            </p>
          </div>

          {/* Color Palette */}
          <div className="mb-8">
            <div className="grid grid-cols-7 gap-3 mb-4">
              {colors.slice(0, 7).map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-12 h-12 rounded-full transition-all ${
                    selectedColor === color.value
                      ? 'ring-4 ring-gray-400 ring-offset-2'
                      : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-3">
              {colors.slice(7).map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-12 h-12 rounded-full transition-all ${
                    selectedColor === color.value
                      ? 'ring-4 ring-gray-400 ring-offset-2'
                      : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleCancel}
              className="text-blue-600 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'name') {
    return (
      <div className="min-h-screen bg-white">
        <Header userName="Robert" />
        <main className="max-w-md mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setStep('color')}
              className="text-blue-600 font-medium"
            >
              Cancel
            </button>
            <h1 className="text-xl font-bold text-gray-900">New DoLoop</h1>
            <button
              onClick={handleNext}
              disabled={!loopName.trim()}
              className={`px-6 py-2 rounded-lg font-medium ${
                loopName.trim()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Create Loop
            </button>
          </div>

          {/* Loop Icon */}
          <div className="text-center mb-8">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: selectedColor }}
            >
              <LoopIcon />
            </div>
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-gray-600 text-sm mb-2">
              Give your loop a name.
            </label>
            <input
              type="text"
              value={loopName}
              onChange={(e) => setLoopName(e.target.value)}
              placeholder="e.g., Camping"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900"
              autoFocus
            />
          </div>

          {/* Loop Type Selector */}
          <div className="mb-6">
            <label className="block text-gray-600 text-sm mb-2">
              What type of loop is this?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLoopType('daily')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  loopType === 'daily'
                    ? 'bg-yellow-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Select Daily loop type"
                aria-pressed={loopType === 'daily'}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setLoopType('work')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  loopType === 'work'
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Select Work loop type"
                aria-pressed={loopType === 'work'}
              >
                Work
              </button>
              <button
                type="button"
                onClick={() => setLoopType('personal')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  loopType === 'personal'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Select Personal loop type"
                aria-pressed={loopType === 'personal'}
              >
                Personal
              </button>
            </div>
          </div>

          {/* Favorite Toggle */}
          <div className="mb-8">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-all hover:bg-gray-50"
              style={{
                borderColor: isFavorite ? '#FFB800' : '#E5E7EB',
                backgroundColor: isFavorite ? '#FFFBEB' : 'transparent',
              }}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isFavorite ? 'bg-yellow-500 border-yellow-500' : 'border-gray-300'
              }`}>
                {isFavorite && (
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
              </div>
              <span className={`font-medium ${isFavorite ? 'text-gray-900' : 'text-gray-700'}`}>
                Mark as favorite
              </span>
              {isFavorite && (
                <span className="ml-auto text-yellow-600">⭐</span>
              )}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Items step - Loop detail page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header userName="Robert" />
      <main className="max-w-md mx-auto px-4 py-8">
        {/* Yellow Header Bar */}
        <div
          className="h-2 mb-6 rounded"
          style={{ backgroundColor: '#FFB800' }}
        />

        {/* Loop Header */}
        <div className="bg-gray-100 rounded-xl p-6 mb-6 text-center">
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: selectedColor }}
          >
            <LoopIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{loopName}</h1>
        </div>

        {/* Loop Items */}
        <div className="bg-white rounded-xl shadow-sm mb-4">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">No items yet</p>
              <p className="text-sm">Add your first loop step below</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center px-4 py-3 hover:bg-gray-50"
                >
                  <button
                    onClick={() => handleToggleItem(item.id)}
                    className={`w-6 h-6 rounded-full border-2 mr-3 flex-shrink-0 ${
                      item.completed
                        ? 'bg-yellow-500 border-yellow-500'
                        : 'border-gray-300'
                    }`}
                    role="checkbox"
                    aria-checked={item.completed}
                    aria-label={`Mark "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
                  >
                    {item.completed && (
                      <svg
                        className="w-full h-full text-white"
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
                  <span
                    className={`flex-1 ${
                      item.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-900'
                    }`}
                  >
                    {item.title}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 ml-2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 10 4 Q 4 4, 4 10 Q 4 16, 10 16 Q 16 16, 16 10 Q 16 4, 10 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Step Input */}
        <div className="bg-gray-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem();
                }
              }}
              placeholder="e.g., Water"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              autoFocus
            />
            <button
              onClick={handleAddItem}
              disabled={!newItemName.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                newItemName.trim()
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 10 4 L 10 16 M 4 10 L 16 10"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Add Step Button */}
        <button
          onClick={() => setNewItemName('')}
          className="w-full bg-gray-100 hover:bg-gray-200 rounded-xl py-3 px-4 flex items-center gap-2 text-gray-700 font-medium transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 10 4 L 10 16 M 4 10 L 16 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Add a Loop Step</span>
        </button>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setStep('name')}
            className="text-blue-600 font-medium"
          >
            Back
          </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              type="button"
              aria-label="Finish creating loop"
            >
              Done
            </button>
        </div>
      </main>

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
