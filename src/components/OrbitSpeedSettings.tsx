'use client';

import React, { useState } from 'react';
import { Settings, ChevronRight, ChevronDown } from 'lucide-react';

interface OrbitSpeedSettingsProps {
  orbitSpeedMultiplier: number;
  onSpeedChange: (multiplier: number) => void;
  language?: 'id' | 'en';
}

const OrbitSpeedSettings = ({
  orbitSpeedMultiplier,
  onSpeedChange,
  language = 'en'
}: OrbitSpeedSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const speedOptions = [
    { value: 0, label: language === 'id' ? 'Berhenti' : 'Paused' },
    { value: 0.1, label: language === 'id' ? 'Sangat Lambat' : 'Very Slow' },
    { value: 0.25, label: language === 'id' ? 'Lambat' : 'Slow' },
    { value: 0.5, label: language === 'id' ? 'Sedang' : 'Medium' },
    { value: 1, label: language === 'id' ? 'Normal' : 'Normal' },
    { value: 2, label: language === 'id' ? 'Cepat' : 'Fast' },
    { value: 5, label: language === 'id' ? 'Sangat Cepat' : 'Very Fast' },
    { value: 10, label: language === 'id' ? 'Ekstrim' : 'Extreme' },
  ];

  const getCurrentSpeedLabel = () => {
    const option = speedOptions.find(opt => opt.value === orbitSpeedMultiplier);
    return option?.label || `${orbitSpeedMultiplier}x`;
  };

  return (
    <div className="fixed top-20 right-4 z-50">
      <div
        className={`bg-black/80 backdrop-blur-sm border border-blue-500/30 rounded-lg transition-all duration-300 ${
          isOpen ? 'w-72' : 'w-12'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 flex items-center justify-between text-white hover:bg-blue-500/20 transition-colors rounded-lg"
          title={language === 'id' ? 'Pengaturan Kecepatan Orbit' : 'Orbit Speed Settings'}
        >
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-blue-400" />
            {isOpen && (
              <span className="text-sm font-medium">
                {language === 'id' ? 'Kecepatan Orbit' : 'Orbit Speed'}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronDown size={16} className="text-blue-400" />
          ) : (
            <ChevronRight size={16} className="text-blue-400" />
          )}
        </button>

        {/* Settings Panel */}
        {isOpen && (
          <div className="p-4 pt-0">
            {/* Current Speed Display */}
            <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/20">
              <div className="text-xs text-blue-300 mb-1">
                {language === 'id' ? 'Kecepatan Saat Ini:' : 'Current Speed:'}
              </div>
              <div className="text-white font-medium">
                {getCurrentSpeedLabel()}
              </div>
            </div>

            {/* Speed Slider */}
            <div className="mb-4">
              <label className="block text-xs text-blue-300 mb-2">
                {language === 'id' ? 'Sesuaikan Kecepatan:' : 'Adjust Speed:'}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={orbitSpeedMultiplier}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(orbitSpeedMultiplier / 10) * 100}%, #374151 ${(orbitSpeedMultiplier / 10) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0x</span>
                <span>5x</span>
                <span>10x</span>
              </div>
            </div>

            {/* Preset Speed Buttons */}
            <div className="space-y-2">
              <div className="text-xs text-blue-300 mb-2">
                {language === 'id' ? 'Preset Cepat:' : 'Quick Presets:'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {speedOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onSpeedChange(option.value)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                      orbitSpeedMultiplier === option.value
                        ? 'bg-blue-500 border-blue-400 text-white'
                        : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Text */}
            <div className="mt-4 text-xs text-gray-400 leading-relaxed">
              {language === 'id'
                ? 'Mengatur kecepatan orbit planet mengelilingi matahari. Gunakan 0x untuk menghentikan gerakan.'
                : 'Control how fast planets orbit around the sun. Use 0x to pause orbital motion.'
              }
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default OrbitSpeedSettings;