'use client';

import { motion } from 'framer-motion';

interface BeeDotProps {
  size?: number;
  delay?: number;
  animate?: boolean;
  className?: string;
}

export function BeeDot({ size = 8, delay = 0, animate = true, className = '' }: BeeDotProps) {
  return (
    <motion.div
      className={`rounded-full bg-yellow-400 ${className}`}
      style={{ width: size, height: size }}
      initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={animate ? { scale: 1, opacity: 1 } : {}}
      transition={{ delay, duration: 0.3 }}
    />
  );
}

interface BeeSwarmProps {
  count: number;
  size?: number;
  spacing?: 'tight' | 'normal' | 'loose';
  animate?: boolean;
  className?: string;
}

export function BeeSwarm({ 
  count, 
  size = 8, 
  spacing = 'normal',
  animate = true,
  className = '' 
}: BeeSwarmProps) {
  const gaps = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-3',
  };
  
  return (
    <div className={`flex flex-wrap ${gaps[spacing]} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <BeeDot 
          key={i} 
          size={size} 
          delay={animate ? i * 0.05 : 0}
          animate={animate}
        />
      ))}
    </div>
  );
}

interface FloatingBeeProps {
  size?: number;
  duration?: number;
  delay?: number;
}

export function FloatingBee({ size = 8, duration = 3, delay = 0 }: FloatingBeeProps) {
  return (
    <motion.div
      className="rounded-full bg-yellow-400"
      style={{ width: size, height: size }}
      animate={{
        y: [-10, 10, -10],
        x: [-5, 5, -5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

interface BeeTrailProps {
  count: number;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  size?: number;
}

export function BeeTrail({ count, direction = 'horizontal', size = 6 }: BeeTrailProps) {
  const getPosition = (index: number) => {
    const spacing = 16;
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
    <div className="relative">
      {Array.from({ length: count }).map((_, i) => {
        const pos = getPosition(i);
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-yellow-400"
            style={{ 
              width: size, 
              height: size,
              left: pos.x,
              top: pos.y,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
        );
      })}
    </div>
  );
}

export default BeeDot;

