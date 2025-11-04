'use client';

import { motion } from 'framer-motion';

interface CircularProgressProps {
  /**
   * Progress value between 0 and 100
   */
  progress: number;
  
  /**
   * Size of the circle in pixels
   */
  size?: number;
  
  /**
   * Stroke width in pixels
   */
  strokeWidth?: number;
  
  /**
   * Color for incomplete portion (background circle)
   */
  backgroundColor?: string;
  
  /**
   * Gradient colors for progress arc [start, end]
   */
  gradientColors?: [string, string];
  
  /**
   * Show percentage text in center
   */
  showPercentage?: boolean;
  
  /**
   * Animation duration in seconds
   */
  animationDuration?: number;
  
  /**
   * Optional className for container
   */
  className?: string;
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  backgroundColor = '#e5e7eb',
  gradientColors = ['#667eea', '#764ba2'],
  showPercentage = false,
  animationDuration = 1,
  className = '',
}: CircularProgressProps) {
  // Clamp progress between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  // Calculate stroke dash offset for progress
  const progressOffset = circumference - (normalizedProgress / 100) * circumference;
  
  // Unique gradient ID for this instance
  const gradientId = `gradient-${Math.random().toString(36).slice(2, 11)}`;
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Progress circle with animation */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={{
            duration: animationDuration,
            ease: 'easeInOut',
          }}
        />
      </svg>
      
      {/* Optional percentage text */}
      {showPercentage && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <span className="text-2xl font-bold text-gray-800">
            {Math.round(normalizedProgress)}%
          </span>
        </motion.div>
      )}
    </div>
  );
}

export default CircularProgress;
