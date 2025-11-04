'use client';

import { motion } from 'framer-motion';
import { MomentumData } from '@/types/loop';

interface BeeMomentumProps {
  data: MomentumData[];
  className?: string;
}

export function BeeMomentum({ data, className = '' }: BeeMomentumProps) {
  // Ensure we have exactly 7 days
  const displayData = data.slice(-7);
  
  // Get day labels (Mon, Tue, etc)
  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  // Calculate bee count based on intensity
  const getBeeCount = (intensity: number) => {
    if (intensity === 0) return 0;
    if (intensity < 0.2) return 1;
    if (intensity < 0.4) return 2;
    if (intensity < 0.6) return 3;
    if (intensity < 0.8) return 4;
    return 5; // Swarm!
  };
  
  const isToday = (index: number) => index === displayData.length - 1;
  
  return (
    <div className={`${className}`}>
      <div className="flex items-end justify-between gap-3 h-40">
        {displayData.map((day, dayIndex) => {
          const beeCount = getBeeCount(day.intensity);
          const today = isToday(dayIndex);
          
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-3">
              {/* Bees Stack */}
              <div className="flex flex-col items-center justify-end h-32 gap-2 relative group">
                {beeCount === 0 ? (
                  // Empty state - light gray dot
                  <motion.div
                    className="w-3 h-3 rounded-full bg-gray-200"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: dayIndex * 0.1 }}
                  />
                ) : (
                  // Show bees stacked vertically
                  <>
                    {Array.from({ length: beeCount }).map((_, beeIndex) => (
                      <motion.div
                        key={beeIndex}
                        className="w-4 h-4 rounded-full bg-yellow-400 shadow-sm relative"
                        initial={{ scale: 0, y: 20 }}
                        animate={{ 
                          scale: 1, 
                          y: 0,
                          // Swarm wiggle for 5 bees
                          x: beeCount === 5 ? [-1, 1, -1] : 0,
                        }}
                        transition={{ 
                          delay: dayIndex * 0.1 + beeIndex * 0.05,
                          duration: 0.3,
                          x: {
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }
                        }}
                      >
                        {/* Glow effect for swarm */}
                        {beeCount === 5 && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-yellow-300"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity,
                              delay: beeIndex * 0.1,
                            }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </>
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {day.loopsCompleted} loops
                    {beeCount > 0 && (
                      <div className="text-yellow-300">
                        {beeCount === 5 ? '🐝 Swarm!' : `${beeCount} bee${beeCount > 1 ? 's' : ''}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Day Label */}
              <motion.div
                className={`text-xs font-medium ${
                  today 
                    ? 'text-yellow-600 font-bold' 
                    : beeCount > 0 
                      ? 'text-gray-700' 
                      : 'text-gray-400'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + dayIndex * 0.05 }}
              >
                {getDayLabel(day.date)}
              </motion.div>
              
              {/* Today indicator */}
              {today && (
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
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <span>No bees</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          </div>
          <span>A few bees</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          </div>
          <span>Swarm! 🐝</span>
        </div>
      </div>
      
      {/* Description */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          More activity = more bees buzzing around! 🐝
        </p>
      </div>
    </div>
  );
}

export default BeeMomentum;

