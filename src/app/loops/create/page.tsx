'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
        className="mb-8 flex justify-center"
      >
        <Image
          src="/doloop-bee.svg"
          alt="DoLoop Bee"
          width={200}
          height={200}
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
        className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Three circular arrows - evenly spaced */}
          {/* Top arrow */}
          <path
            d="M 50 15 A 25 25 0 0 1 68 32 L 62 35 L 70 40 L 73 29 L 67 32 A 30 30 0 0 0 50 10 Z"
            fill="black"
          />
          {/* Bottom right arrow */}
          <path
            d="M 71.65 61 A 25 25 0 0 1 46.34 83.66 L 44.5 77.5 L 38 84 L 48.5 87.5 L 46.65 81.34 A 30 30 0 0 0 76.65 56 Z"
            fill="black"
          />
          {/* Bottom left arrow */}
          <path
            d="M 28.35 61 A 25 25 0 0 1 50 15 L 50 10 A 30 30 0 0 0 23.35 56 L 20 50 L 15 60 L 25.35 62 Z"
            fill="black"
          />
          {/* Plus sign in center */}
          <rect x="47" y="35" width="6" height="30" fill="black"/>
          <rect x="35" y="47" width="30" height="6" fill="black"/>
        </svg>
      </motion.button>
    </div>
  );
}

