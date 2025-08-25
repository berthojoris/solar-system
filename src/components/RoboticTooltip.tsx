'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PlanetTooltipProps {
  planetName: string;
  planetNameId: string;
  position: { x: number; y: number };
  useIndonesian?: boolean;
}

const PlanetTooltip: React.FC<PlanetTooltipProps> = ({
  planetName,
  planetNameId,
  position,
  useIndonesian = false
}) => {
  const displayName = useIndonesian ? planetNameId : planetName;

  // Calculate tooltip position above the planet
  const tooltipX = position.x;
  const tooltipY = position.y - 120; // Position above the planet
  const lineStartY = position.y - 20; // Start line close to planet
  const lineEndY = tooltipY + 60; // End line at tooltip bottom
  const lineHeight = lineStartY - lineEndY;

  return (
    <motion.div
      className="fixed z-40 pointer-events-none"
      style={{
        left: tooltipX,
        top: tooltipY,
      }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.3
      }}
    >
      {/* Main tooltip container */}
      <div className="relative transform -translate-x-1/2">
        {/* Robotic border animation */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-cyan-400/40"
          animate={{
            borderColor: [
              'rgba(6, 182, 212, 0.4)',
              'rgba(6, 182, 212, 0.7)',
              'rgba(6, 182, 212, 0.4)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Scanning effect */}
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent overflow-hidden"
          animate={{
            x: [-80, 80]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Content */}
        <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2
                      border border-cyan-400/25 shadow-lg shadow-cyan-400/10">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-400"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-400"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-cyan-400"></div>

          {/* Planet name */}
          <motion.div
            className="flex items-center space-x-2 text-cyan-100 font-mono text-xs whitespace-nowrap"
            animate={{
              textShadow: [
                "0 0 4px rgba(6, 182, 212, 0.4)",
                "0 0 8px rgba(6, 182, 212, 0.6)",
                "0 0 4px rgba(6, 182, 212, 0.4)"
              ]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="font-bold tracking-wider uppercase">{displayName}</span>
            <div className="w-0.5 h-3 bg-cyan-400/50 animate-pulse"></div>
          </motion.div>
        </div>

        {/* Speech bubble arrow pointer at bottom */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <motion.div
            className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-cyan-400/25"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          />
          {/* Inner arrow for layered effect */}
          <motion.div
            className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-slate-900/90"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PlanetTooltip;