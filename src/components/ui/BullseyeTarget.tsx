'use client';

import { motion } from 'framer-motion';

type TargetStyle = 'playful' | 'achievement';

interface BullseyeTargetProps {
  size?: number;
  style?: TargetStyle;
  delay?: number;
  animate?: boolean;
  showBee?: boolean;
  className?: string;
}

export function BullseyeTarget({ 
  size = 24, 
  style = 'playful',
  delay = 0, 
  animate = true,
  showBee = false,
  className = '' 
}: BullseyeTargetProps) {
  
  if (style === 'playful') {
    return (
      <motion.div
        className={`relative ${className}`}
        style={{ width: size, height: size }}
        initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={animate ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay, duration: 0.3, type: 'spring', stiffness: 200 }}
      >
        {/* Simple solid rounded square */}
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {/* Gold rounded square */}
          <rect x="0" y="0" width="100" height="100" rx="20" fill="#FFB800" />
        </svg>
        
        {/* Bee landing spot (top-right) - optional */}
        {showBee && (
          <motion.div
            className="absolute top-1 right-1"
            style={{ width: size * 0.2, height: size * 0.2 }}
            initial={{ scale: 0, y: -10 }}
            animate={{ 
              scale: 1, 
              y: 0,
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              scale: { delay: delay + 0.3, duration: 0.3 },
              y: { delay: delay + 0.3, duration: 0.3 },
              rotate: { 
                delay: delay + 0.6,
                duration: 0.5, 
                repeat: Infinity,
                repeatDelay: 2 
              }
            }}
          >
            <div className="w-full h-full rounded-full bg-black" />
          </motion.div>
        )}
      </motion.div>
    );
  }
  
  // Achievement style (solid square, slightly different shade)
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={animate ? { scale: 1, opacity: 1 } : {}}
      transition={{ delay, duration: 0.3, type: 'spring', stiffness: 200 }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Gold rounded square - slightly darker for achievement */}
        <rect x="0" y="0" width="100" height="100" rx="20" fill="#D4A024" />
      </svg>
    </motion.div>
  );
}

interface TargetSwarmProps {
  count: number;
  size?: number;
  style?: TargetStyle;
  spacing?: 'tight' | 'normal' | 'loose';
  animate?: boolean;
  showBees?: boolean;
  className?: string;
}

export function TargetSwarm({ 
  count, 
  size = 24, 
  style = 'playful',
  spacing = 'normal',
  animate = true,
  showBees = false,
  className = '' 
}: TargetSwarmProps) {
  const gaps = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-3',
  };
  
  return (
    <div className={`flex flex-wrap ${gaps[spacing]} items-center ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <BullseyeTarget 
          key={i} 
          size={size}
          style={style}
          delay={animate ? i * 0.05 : 0}
          animate={animate}
          showBee={showBees && i === count - 1}
        />
      ))}
    </div>
  );
}

interface FloatingTargetProps {
  size?: number;
  style?: TargetStyle;
  duration?: number;
  delay?: number;
  showBee?: boolean;
}

export function FloatingTarget({ 
  size = 24, 
  style = 'playful',
  duration = 3, 
  delay = 0,
  showBee = false 
}: FloatingTargetProps) {
  return (
    <motion.div
      animate={{
        y: [-10, 10, -10],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <BullseyeTarget size={size} style={style} animate={false} showBee={showBee} />
    </motion.div>
  );
}

interface TargetTrailProps {
  count: number;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  size?: number;
  style?: TargetStyle;
}

export function TargetTrail({ 
  count, 
  direction = 'horizontal', 
  size = 20,
  style = 'playful' 
}: TargetTrailProps) {
  const getPosition = (index: number) => {
    const spacing = size * 1.5;
    switch (direction) {
      case 'horizontal':
        return { x: index * spacing, y: 0 };
      case 'vertical':
        return { x: 0, y: index * spacing };
      case 'diagonal':
        return { x: index * spacing, y: index * spacing };
    }
  };
  
  return (
    <div className="relative" style={{ height: size * 2, width: count * size * 1.5 }}>
      {Array.from({ length: count }).map((_, i) => {
        const pos = getPosition(i);
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ 
              left: pos.x,
              top: pos.y,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <BullseyeTarget 
              size={size} 
              style={style}
              animate={false}
              showBee={i === count - 1}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

export default BullseyeTarget;
