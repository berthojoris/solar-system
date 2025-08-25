'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import SolarSystemScene from '@/components/SolarSystemScene';
import PlanetInfoModal from '@/components/PlanetInfoModal';
import { PlanetData } from '@/data/planetData';

export default function Home() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  const handlePlanetSelect = (planet: PlanetData | null) => {
    setSelectedPlanet(planet);
  };

  const handleCloseModal = () => {
    setSelectedPlanet(null);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'id' ? 'en' : 'id');
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-purple-900 relative">
      {/* Language Toggle Button */}
      <motion.button
        className="absolute top-6 right-6 z-20 bg-black/30 backdrop-blur-sm rounded-full p-3
                   border border-purple-300/20 hover:border-cyan-400/50 transition-all duration-300
                   group hover:bg-black/50"
        onClick={toggleLanguage}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <Languages className="w-5 h-5 text-purple-200 group-hover:text-cyan-400 transition-colors" />
          <span className="text-purple-200 group-hover:text-cyan-400 transition-colors font-mono text-sm">
            {language.toUpperCase()}
          </span>
        </div>

        {/* Robotic border animation */}
        <div className="absolute inset-0 rounded-full border border-cyan-400/0 group-hover:border-cyan-400/30
                        transition-all duration-300"></div>
        <div className="absolute inset-0 rounded-full border border-cyan-400/0 group-hover:border-cyan-400/20
                        scale-110 transition-all duration-500"></div>
      </motion.button>

      {/* Animated Title */}
      <motion.div
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >



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
          language={language}
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
