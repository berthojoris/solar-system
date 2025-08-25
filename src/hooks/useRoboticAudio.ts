'use client';

import { useCallback, useRef, useEffect } from 'react';

interface RoboticAudioOptions {
  volume?: number;
}

export const useRoboticAudio = (options: RoboticAudioOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const { volume = 0.3 } = options;

  useEffect(() => {
    // Initialize audio context on first interaction
    const initAudioContext = () => {
      if (!audioContextRef.current && typeof window !== 'undefined') {
        try {
          const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        } catch (error) {
          console.warn('Web Audio API not supported:', error);
        }
      }
    };

    // Add click listener to initialize audio context (required by browsers)
    document.addEventListener('click', initAudioContext, { once: true });
    document.addEventListener('touchstart', initAudioContext, { once: true });

    return () => {
      document.removeEventListener('click', initAudioContext);
      document.removeEventListener('touchstart', initAudioContext);
    };
  }, []);

  const createRoboticTone = useCallback((frequency: number, duration: number, type: 'scan' | 'select' | 'confirm' = 'select') => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filterNode = ctx.createBiquadFilter();

    // Configure filter for robotic effect
    filterNode.type = 'bandpass';
    filterNode.frequency.setValueAtTime(frequency * 2, ctx.currentTime);
    filterNode.Q.setValueAtTime(10, ctx.currentTime);

    // Configure oscillator
    oscillator.type = 'square'; // Square wave for robotic sound
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Configure gain envelope based on sound type
    gainNode.gain.setValueAtTime(0, ctx.currentTime);

    switch (type) {
      case 'scan':
        // Quick chirp sound for hover
        gainNode.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        break;
      case 'select':
        // Click sound for selection
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        break;
      case 'confirm':
        // Success sound
        gainNode.gain.linearRampToValueAtTime(volume * 0.8, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + duration * 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        break;
    }

    // Connect nodes
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Start and stop
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);

    return oscillator;
  }, [volume]);

  const playRoboticSequence = useCallback((frequencies: number[], duration: number, delay: number = 0.1) => {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        createRoboticTone(freq, duration, 'select');
      }, index * delay * 1000);
    });
  }, [createRoboticTone]);

  // Predefined robotic sounds
  const playHoverSound = useCallback(() => {
    // Quick scan beep
    createRoboticTone(800, 0.1, 'scan');
  }, [createRoboticTone]);

  const playClickSound = useCallback(() => {
    // Robotic click sequence
    playRoboticSequence([400, 600, 500], 0.08, 0.05);
  }, [playRoboticSequence]);

  const playConfirmSound = useCallback(() => {
    // Success confirmation
    playRoboticSequence([300, 400, 500, 600], 0.15, 0.08);
  }, [playRoboticSequence]);

  const playErrorSound = useCallback(() => {
    // Error/warning sound
    playRoboticSequence([200, 150, 100], 0.2, 0.1);
  }, [playRoboticSequence]);

  // Planet-specific sounds (different frequencies for different planets)
  const playPlanetSound = useCallback((planetName: string) => {
    const planetFrequencies: Record<string, number[]> = {
      'Sun': [600, 800, 700],
      'Matahari': [600, 800, 700],
      'Mercury': [900, 1000, 950],
      'Merkurius': [900, 1000, 950],
      'Venus': [700, 850, 775],
      'Earth': [500, 650, 575],
      'Bumi': [500, 650, 575],
      'Mars': [450, 600, 525],
      'Jupiter': [300, 450, 375],
      'Yupiter': [300, 450, 375],
      'Saturn': [350, 500, 425],
      'Saturnus': [350, 500, 425],
      'Uranus': [400, 550, 475],
      'Neptune': [250, 400, 325],
      'Neptunus': [250, 400, 325]
    };

    const frequencies = planetFrequencies[planetName] || [400, 600, 500];
    playRoboticSequence(frequencies, 0.12, 0.06);
  }, [playRoboticSequence]);

  return {
    playHoverSound,
    playClickSound,
    playConfirmSound,
    playErrorSound,
    playPlanetSound,
    createRoboticTone,
    playRoboticSequence
  };
};