'use client';

import { motion } from 'framer-motion';

interface BullseyeTargetMinimalProps {
  size?: number;
  delay?: number;
  animate?: boolean;
  className?: string;
}

export function BullseyeTargetMinimal({
  size = 48,
  delay = 0,
  animate = true,
  className = ''
}: BullseyeTargetMinimalProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={animate ? { scale: 1, opacity: 1 } : {}}
      transition={{ delay, duration: 0.3, type: 'spring', stiffness: 200 }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{
          filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.15))'
        }}
      >
        {/* Black base layer - positioned to show rounded bottom edge */}
        <rect
          x="0"
          y="6"
          width="100"
          height="94"
          rx="16"
          fill="#000000"
        />
        {/* Gold top layer perfectly overlapping except bottom edge */}
        <rect
          x="0"
          y="0"
          width="100"
          height="94" // shorter so black shows at bottom
          rx="16"
          fill="#FFB800"
        />
      </svg>
    </motion.div>
  );
}

export default BullseyeTargetMinimal;

