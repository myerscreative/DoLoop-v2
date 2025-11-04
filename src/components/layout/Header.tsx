'use client';

import { motion } from 'framer-motion';
import { getGreeting } from '@/lib/loopUtils';
import { DoLoopLogo } from '@/components/ui/DoLoopLogo';

interface HeaderProps {
  userName?: string;
  theme?: 'minimal' | 'playful' | 'professional';
  className?: string;
}

export function Header({ userName = 'there', theme = 'minimal', className = '' }: HeaderProps) {
  const greeting = getGreeting();
  const today = new Date();
  
  // Format date: "Thursday, October 30"
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <motion.header
      className={`bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          {/* Left side - Greeting */}
          <div>
            <motion.h1
              className="text-3xl md:text-4xl font-bold mb-1 text-gray-900"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {greeting}, {userName}
            </motion.h1>
            <motion.p
              className="text-gray-600 text-sm md:text-base"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {formattedDate}
            </motion.p>
          </div>
          
          {/* Right side - Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <DoLoopLogo 
              theme={theme}
              size="md"
              animated={true}
              headerLight={false}
            />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;

