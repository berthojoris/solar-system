'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { PlanetData } from '@/data/planetData';

interface UseSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useSpeech = (options: UseSpeechOptions = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const {
    lang = 'id-ID', // Indonesian language
    rate = 0.7, // Slower for better clarity
    pitch = 1.1, // Slightly higher pitch for child-friendly voice
    volume = 1.0
  } = options;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      // Load voices immediately if available
      loadVoices();

      // Listen for voice changes (some browsers load voices asynchronously)
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // Find the best voice for the given language
  const getBestVoice = useCallback((targetLang: string): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    // Priority order for voice selection
    const voicePriorities = {
      'id-ID': [
        // Indonesian voices (high quality first)
        'Google Bahasa Indonesia',
        'Microsoft Andika - Indonesian (Indonesia)',
        'Indonesian (Indonesia)',
        'id-ID',
        // Fallback to similar languages
        'Malay',
        'ms-MY',
        // English as last resort for Indonesian
        'Google US English',
        'Microsoft Zira - English (United States)',
        'English (United States)',
        'en-US'
      ],
      'en-US': [
        // English voices (natural sounding first)
        'Google US English',
        'Microsoft Zira - English (United States)',
        'Microsoft David - English (United States)',
        'Samantha',
        'Alex',
        'English (United States)',
        'en-US'
      ]
    };

    const priorities = voicePriorities[targetLang as keyof typeof voicePriorities] || [];

    // First, try to find exact matches by name
    for (const priority of priorities) {
      const voice = availableVoices.find(v =>
        v.name.toLowerCase().includes(priority.toLowerCase()) ||
        v.lang.toLowerCase() === priority.toLowerCase()
      );
      if (voice) return voice;
    }

    // Fallback: find any voice with matching language code
    const langCode = targetLang.split('-')[0];
    const langMatch = availableVoices.find(v => v.lang.startsWith(langCode));
    if (langMatch) return langMatch;

    // Last resort: return default voice
    return availableVoices[0] || null;
  }, [availableVoices]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Process text for better speech quality
    const processedText = text
      // Add natural pauses
      .replace(/\./g, '.')
      .replace(/,/g, ', ')
      .replace(/:/g, ': ')
      .replace(/;/g, '; ')
      .replace(/!/g, '! ')
      .replace(/\?/g, '? ')
      // Add emphasis for numbers
      .replace(/(\d+)/g, ' $1 ')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(processedText);

    // Select the best available voice
    const bestVoice = getBestVoice(lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = lang;
    }

    // Optimized speech parameters for better quality
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Add event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      setIsPaused(false);
      console.error('Speech synthesis error:', event.error);

      // Try fallback with different voice if available
      if (event.error === 'voice-unavailable' && availableVoices.length > 1) {
        const fallbackVoice = availableVoices.find(v => v !== bestVoice);
        if (fallbackVoice) {
          const fallbackUtterance = new SpeechSynthesisUtterance(processedText);
          fallbackUtterance.voice = fallbackVoice;
          fallbackUtterance.rate = rate * 0.9; // Slightly slower for fallback
          fallbackUtterance.pitch = pitch;
          fallbackUtterance.volume = volume;

          fallbackUtterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
          fallbackUtterance.onend = () => { setIsPlaying(false); setIsPaused(false); };

          window.speechSynthesis.speak(fallbackUtterance);
          utteranceRef.current = fallbackUtterance;
          return;
        }
      }
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, lang, rate, pitch, volume, getBestVoice, availableVoices]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isPlaying && !isPaused) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isPaused]);

  const toggle = useCallback(() => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    }
  }, [isPlaying, isPaused, pause, resume]);

  // Generate complete narration text for a planet with better pacing
  const generatePlanetNarration = useCallback((planetData: PlanetData, useIndonesian: boolean = true) => {
    const name = useIndonesian ? planetData.nameId : planetData.name;
    const description = useIndonesian ? planetData.descriptionId : planetData.description;
    const facts = useIndonesian ? planetData.factsId : planetData.facts;

    const introduction = useIndonesian
      ? `Halo! Mari kita pelajari tentang ${name}. ${description}`
      : `Hello! Let's learn about ${name}. ${description}`;

    const factsIntro = useIndonesian
      ? "Mari kita simak fakta-fakta menarik berikut ini."
      : "Let's discover some amazing facts.";

    // Add natural pauses and emphasis for better speech
    const factsList = facts.map((fact: string, index: number) => {
      const factNumber = useIndonesian ? `Fakta ke-${index + 1}` : `Fact number ${index + 1}`;
      return `${factNumber}: ${fact}.`;
    }).join(' ... '); // Add pauses between facts

    const conclusion = useIndonesian
      ? `Nah, itulah informasi menarik tentang ${name}. Semoga kalian suka belajar tentang tata surya! Terima kasih sudah mendengarkan.`
      : `Well, that was interesting information about ${name}. Hope you enjoyed learning about our solar system! Thank you for listening.`;

    return `${introduction} ... ${factsIntro} ... ${factsList} ... ${conclusion}`;
  }, []);

  // Get voice information for debugging
  const getVoiceInfo = useCallback(() => {
    const voice = getBestVoice(lang);
    return {
      selectedVoice: voice?.name || 'Default',
      language: voice?.lang || lang,
      totalVoices: availableVoices.length,
      availableLanguages: [...new Set(availableVoices.map(v => v.lang))].sort()
    };
  }, [getBestVoice, lang, availableVoices]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    speak,
    stop,
    pause,
    resume,
    toggle,
    generatePlanetNarration,
    getVoiceInfo,
    availableVoices: availableVoices.length
  };
};