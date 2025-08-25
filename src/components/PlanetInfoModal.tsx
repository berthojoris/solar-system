'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Languages } from 'lucide-react';
import { PlanetData } from '@/data/planetData';

interface PlanetInfoModalProps {
  planet: PlanetData | null;
  onClose: () => void;
}

const PlanetInfoModal: React.FC<PlanetInfoModalProps> = ({ planet, onClose }) => {
  const [useIndonesian, setUseIndonesian] = useState(true);

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
            className="relative w-full max-w-4xl max-h-[85vh] mx-auto bg-gradient-to-br from-slate-900/95 to-purple-900/95
                       backdrop-blur-md rounded-2xl shadow-2xl border border-purple-300/20 overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Control buttons */}
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              {/* Language toggle */}
              <button
                onClick={() => setUseIndonesian(!useIndonesian)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 group"
                aria-label="Toggle language"
                title={useIndonesian ? "Switch to English" : "Switch to Bahasa Indonesia"}
              >
                <Languages className="w-5 h-5 text-white group-hover:text-purple-200 transition-colors duration-200" />
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {useIndonesian ? 'EN' : 'ID'}
                </span>
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 group"
                aria-label="Close planet information"
              >
                <X className="w-6 h-6 text-white group-hover:text-purple-200 transition-colors duration-200" />
              </button>
            </div>

            {/* Content with modern scrolling */}
            <motion.div
              className="relative"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="p-4 sm:p-6 lg:p-8 max-h-[calc(85vh-2rem)] overflow-y-auto modern-scroll">
              {/* Planet name */}
              <motion.h1
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 font-['Comic_Neue',_cursive] pr-16"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {useIndonesian ? planet.nameId : planet.name}
              </motion.h1>

              {/* Planet type badge */}
              <motion.div
                className="inline-block px-3 py-1 mb-3 text-xs sm:text-sm font-medium text-white bg-purple-500/50
                           rounded-full border border-purple-300/30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {planet.type === 'sun'
                  ? (useIndonesian ? '⭐ Bintang' : '⭐ Star')
                  : (useIndonesian ? '🪐 Planet' : '🪐 Planet')
                }
              </motion.div>

              {/* Planet image placeholder */}
              <motion.div
                className="w-full h-32 sm:h-48 lg:h-56 mb-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20
                           rounded-xl border border-purple-300/20 flex items-center justify-center overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {/* Planet visual representation */}
                <div
                  className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full shadow-2xl flex items-center justify-center text-3xl sm:text-5xl lg:text-6xl"
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
                className="text-sm sm:text-base lg:text-lg text-purple-100 mb-4 font-['Nunito',_sans-serif] leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                {useIndonesian ? planet.descriptionId : planet.description}
              </motion.p>

              {/* Facts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 font-['Comic_Neue',_cursive]">
                  {useIndonesian ? 'Fakta Menakjubkan! 🌟' : 'Amazing Facts! 🌟'}
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {(useIndonesian ? planet.factsId : planet.facts).map((fact, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl border border-purple-300/10"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                    >
                      <span className="text-purple-300 mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base">✨</span>
                      <span className="text-purple-50 font-['Nunito',_sans-serif] leading-relaxed text-sm sm:text-base">
                        {fact}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Interactive elements */}
              <motion.div
                className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-purple-300/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
              >
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-purple-200 font-['Nunito',_sans-serif]">
                    {useIndonesian
                      ? 'Klik di luar jendela ini atau tekan Escape untuk melanjutkan eksplorasi! 🚀'
                      : 'Click anywhere outside this window or press Escape to continue exploring! 🚀'
                    }
                  </p>

                  {/* Language indicator */}
                  <div className="flex items-center justify-center space-x-2 mt-3">
                    <Languages className="w-4 h-4 text-purple-300" />
                    <span className="text-xs text-purple-300 font-['Nunito',_sans-serif]">
                      {useIndonesian
                        ? '🌐 Tersedia dalam Bahasa Indonesia & English'
                        : '🌐 Available in Indonesian & English'
                      }
                    </span>
                  </div>
                </div>
              </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanetInfoModal;