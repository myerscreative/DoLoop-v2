'use client';

import { motion } from 'framer-motion';
import { Loop } from '@/types/loop';

interface LoopCardProps {
  loop: Loop;
  onClick?: (loopId: string) => void;
  onDelete?: (loopId: string) => void;
  className?: string;
}

export function LoopCard({ loop, onClick, onDelete, className = '' }: LoopCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(loop.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick
    if (onDelete) {
      onDelete(loop.id);
    }
  };
  
  return (
    <motion.div
      className={`py-2 px-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group ${className}`}
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-gray-900 flex-1">{loop.title}</div>
      {onDelete && (
        <button
          onClick={handleDelete}
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
      )}
    </motion.div>
  );
}

export default LoopCard;

