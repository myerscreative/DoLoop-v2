'use client';

import { motion } from 'framer-motion';
import { MomentumData } from '@/types/loop';
import BullseyeTarget from '@/components/ui/BullseyeTarget';

interface TargetMomentumProps {
  data: MomentumData[];
  className?: string;
}

export function TargetMomentum({ data, className = '' }: TargetMomentumProps) {
  // Ensure we have exactly 7 days
  const displayData = data.slice(-7);
  
  // Get day labels (Mon, Tue, etc)
  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  // Calculate target count based on intensity
  const getTargetCount = (intensity: number) => {
    if (intensity === 0) return 0;
    if (intensity < 0.2) return 1;
    if (intensity < 0.4) return 2;
    if (intensity < 0.6) return 3;
    if (intensity < 0.8) return 4;
    return 5; // Perfect aim!
  };
  
  const isToday = (index: number) => index === displayData.length - 1;
  
  return (
    <div className={`${className}`}>
      <div className="flex items-end justify-between gap-3 h-40">
        {displayData.map((day, dayIndex) => {
          const targetCount = getTargetCount(day.intensity);
          const today = isToday(dayIndex);
          
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-3">
              {/* Targets Stack */}
              <div className="flex flex-col items-center justify-end h-32 gap-1 relative group">
                {targetCount === 0 ? (
                  // Empty state - light gray circle
                  <motion.div
                    className="w-3 h-3 rounded-full bg-gray-200"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: dayIndex * 0.1 }}
                  />
                ) : (
                  // Show targets stacked vertically
                  <>
                    {Array.from({ length: targetCount }).map((_, targetIndex) => {
                      const isTopTarget = targetIndex === targetCount - 1;
                      const isPerfectAim = targetCount === 5;
                      
                      return (
                        <motion.div
                          key={targetIndex}
                          className="relative"
                          initial={{ scale: 0, y: 20 }}
                          animate={{ 
                            scale: 1, 
                            y: 0,
                            // Wiggle on perfect aim days
                            rotate: isPerfectAim ? [-2, 2, -2] : 0,
                          }}
                          transition={{ 
                            delay: dayIndex * 0.1 + targetIndex * 0.08,
                            duration: 0.3,
                            rotate: {
                              duration: 1.5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: dayIndex * 0.1 + 0.5,
                            }
                          }}
                        >
                          <div
                            style={{
                              transform: isPerfectAim ? 'scaleX(2)' : 'none',
                              transformOrigin: 'center',
                            }}
                          >
                            <BullseyeTarget 
                              size={18} 
                              delay={0}
                              animate={false}
                              style="playful"
                            />
                          </div>
                          
                          {/* Perfect aim glow effect */}
                          {isPerfectAim && isTopTarget && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-yellow-300"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.1, 0.4] }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                              }}
                              style={{ margin: '-4px' }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </>
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {day.loopsCompleted} loops
                    {targetCount > 0 && (
                      <div className="text-yellow-300">
                        {targetCount === 5 ? '🎯 Perfect aim!' : `${targetCount} target${targetCount > 1 ? 's' : ''} hit`}
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
                    : targetCount > 0 
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
          <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300" />
          <span>No targets</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded bg-yellow-500" />
          </div>
          <span>A few hits</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded bg-yellow-500" />
            ))}
          </div>
          <span>Perfect aim! 🎯</span>
        </div>
      </div>
      
      {/* Description */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          More loops = more targets hit! 🎯🐝
        </p>
      </div>
    </div>
  );
}

export default TargetMomentum;

