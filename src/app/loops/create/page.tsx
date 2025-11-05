'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CreateLoopWelcomePage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/loops/new');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Bee Illustration */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-8"
      >
        <img
          src="/doloop-bee.svg"
          alt="DoLoop Bee"
          width="200"
          height="200"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold text-gray-900 mb-4 text-center"
      >
        Create a new DoLoop
      </motion.h1>

      {/* Description Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-gray-600 text-center mb-12 max-w-md"
      >
        Create a recipe for success — a checklist you can use over and over.
      </motion.p>

      {/* Create Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        onClick={handleContinue}
        className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circular Arrow */}
          <path
            d="M 16 6 Q 6 6, 6 16 Q 6 26, 16 26 Q 26 26, 26 16 Q 26 6, 16 6"
            stroke="black"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Plus Sign */}
          <path
            d="M 16 10 L 16 22 M 10 16 L 22 16"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.button>
    </div>
  );
}

