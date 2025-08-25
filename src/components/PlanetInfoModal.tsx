'use client';

import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { PlanetData } from '@/data/planetData';

interface PlanetInfoModalProps {
  planet: PlanetData | null;
  onClose: () => void;
}

const PlanetInfoModal: React.FC<PlanetInfoModalProps> = ({ planet, onClose }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && planet) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [planet, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (planet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [planet]);

  // Animation variants
  const backdropVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const modalVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 50,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.3,
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {planet && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-900/95 to-purple-900/95
                       backdrop-blur-md rounded-3xl shadow-2xl border border-purple-300/20 overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20
                         transition-colors duration-200 group"
              aria-label="Close planet information"
            >
              <X className="w-6 h-6 text-white group-hover:text-purple-200 transition-colors duration-200" />
            </button>

            {/* Content */}
            <motion.div
              className="p-8"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Planet name */}
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-white mb-2 font-['Comic_Neue',_cursive]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {planet.name}
              </motion.h1>

              {/* Planet type badge */}
              <motion.div
                className="inline-block px-3 py-1 mb-4 text-sm font-medium text-white bg-purple-500/50
                           rounded-full border border-purple-300/30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {planet.type === 'sun' ? '⭐ Star' : '🪐 Planet'}
              </motion.div>

              {/* Planet image placeholder */}
              <motion.div
                className="w-full h-64 mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20
                           rounded-2xl border border-purple-300/20 flex items-center justify-center overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {/* Planet visual representation */}
                <div
                  className="w-40 h-40 rounded-full shadow-2xl flex items-center justify-center text-6xl"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${planet.color || '#ffffff'}aa, ${planet.color || '#ffffff'}22)`,
                    boxShadow: `0 0 40px ${planet.color || '#ffffff'}44`
                  }}
                >
                  {planet.type === 'sun' ? '☀️' : '🌍'}
                </div>
              </motion.div>

              {/* Description */}
              <motion.p
                className="text-lg md:text-xl text-purple-100 mb-6 font-['Nunito',_sans-serif] leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                {planet.description}
              </motion.p>

              {/* Facts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <h3 className="text-2xl font-bold text-white mb-4 font-['Comic_Neue',_cursive]">
                  Amazing Facts! 🌟
                </h3>
                <div className="space-y-3">
                  {planet.facts.map((fact, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl border border-purple-300/10"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                    >
                      <span className="text-purple-300 mt-1 flex-shrink-0">✨</span>
                      <span className="text-purple-50 font-['Nunito',_sans-serif] leading-relaxed">
                        {fact}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Interactive elements */}
              <motion.div
                className="mt-8 pt-6 border-t border-purple-300/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
              >
                <p className="text-sm text-purple-200 text-center font-['Nunito',_sans-serif]">
                  Click anywhere outside this window or press Escape to continue exploring! 🚀
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanetInfoModal;