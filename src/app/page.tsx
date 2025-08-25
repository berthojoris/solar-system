'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SolarSystemScene from '@/components/SolarSystemScene';
import PlanetInfoModal from '@/components/PlanetInfoModal';
import { PlanetData } from '@/data/planetData';

export default function Home() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  const handlePlanetSelect = (planet: PlanetData | null) => {
    setSelectedPlanet(planet);
  };

  const handleCloseModal = () => {
    setSelectedPlanet(null);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-purple-900 relative">
      {/* Animated Title */}
      <motion.div
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text
                     bg-gradient-to-r from-purple-200 via-blue-200 to-purple-300
                     font-['Comic_Neue',_cursive] text-center drop-shadow-2xl"
          animate={{
            textShadow: [
              "0 0 10px rgba(147, 51, 234, 0.5)",
              "0 0 20px rgba(147, 51, 234, 0.8)",
              "0 0 10px rgba(147, 51, 234, 0.5)"
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        >
          🌟 Solar System Explorer 🌟
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-purple-200 text-center mt-2
                     font-['Nunito',_sans-serif] drop-shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Click on any planet to learn amazing facts! 🚀
        </motion.p>
      </motion.div>

      {/* Instructions overlay for first-time users */}
      <motion.div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-3 border border-purple-300/20">
          <p className="text-purple-200 text-sm md:text-base text-center font-['Nunito',_sans-serif]">
            🖱️ Drag to rotate • 🔍 Scroll to zoom • 👆 Click planets to explore
          </p>
        </div>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{ pointerEvents: 'none' }}
      >
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-8 py-4 border border-purple-300/30">
          <motion.div
            className="flex items-center space-x-3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-purple-200 font-['Nunito',_sans-serif]">
              Launching into space...
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Main 3D Scene */}
      <div className="w-full h-full">
        <SolarSystemScene
          onPlanetSelect={handlePlanetSelect}
          selectedPlanet={selectedPlanet}
        />
      </div>

      {/* Planet Information Modal */}
      <PlanetInfoModal
        planet={selectedPlanet}
        onClose={handleCloseModal}
      />

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-indigo-500/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}
