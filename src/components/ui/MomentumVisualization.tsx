'use client';

import { motion } from 'framer-motion';
import { MomentumData } from '@/types/loop';

interface MomentumVisualizationProps {
  data: MomentumData[];
  className?: string;
}

export function MomentumVisualization({ data, className = '' }: MomentumVisualizationProps) {
  // Ensure we have exactly 7 days
  const displayData = data.slice(-7);
  
  // Get day labels (Mon, Tue, etc)
  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  // Get max height for scaling
  const maxIntensity = Math.max(...displayData.map(d => d.intensity), 0.1);
  
  return (
    <div className={`${className}`}>
      <div className="flex items-end justify-between gap-2 h-32">
        {displayData.map((day, index) => {
          // Calculate height as percentage (minimum 10% for visibility)
          const heightPercent = day.intensity > 0 
            ? Math.max((day.intensity / maxIntensity) * 100, 10)
            : 10;
          
          // Color intensity based on completion
          const getBarColor = () => {
            if (day.intensity === 0) return 'bg-gray-200';
            if (day.intensity < 0.3) return 'bg-gray-300';
            if (day.intensity < 0.6) return 'bg-gray-400';
            if (day.intensity < 0.8) return 'bg-yellow-400';
            return 'bg-yellow-500';
          };
          
          const isToday = index === displayData.length - 1;
          
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="w-full flex flex-col justify-end h-24">
                <motion.div
                  className={`w-full rounded-t-lg ${getBarColor()} relative group cursor-pointer`}
                  style={{ height: `${heightPercent}%` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {day.loopsCompleted} loops
                    </div>
                  </div>
                  
                  {/* Glow effect for high intensity */}
                  {day.intensity > 0.7 && (
                    <motion.div
                      className="absolute inset-0 rounded-t-lg bg-yellow-300 opacity-50"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </motion.div>
              </div>
              
              {/* Day Label */}
              <motion.div
                className={`text-xs font-medium ${
                  isToday 
                    ? 'text-yellow-600 font-bold' 
                    : day.intensity > 0 
                      ? 'text-gray-700' 
                      : 'text-gray-400'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                {getDayLabel(day.date)}
              </motion.div>
              
              {/* Today indicator */}
              {isToday && (
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-yellow-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span>No activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-400" />
          <span>Some progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>High momentum</span>
        </div>
      </div>
    </div>
  );
}

export default MomentumVisualization;

