'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PlanetData } from '@/data/planetData';

interface UseHybridTTSOptions {
  lang?: string;
  onError?: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export const useHybridTTS = (options: UseHybridTTSOptions = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsMode, setTtsMode] = useState<'ai' | 'enhanced-browser' | 'basic-browser'>('ai');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { lang = 'id-ID', onError, onLoadingChange } = options;

  useEffect(() => {
    // Check browser capabilities
    const audioSupported = typeof Audio !== 'undefined';
    const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setIsSupported(audioSupported || speechSupported);

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  const cleanup = useCallback(() => {
    // Clean up audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Clean up speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;

    // Clean up fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  // Try AI TTS first
  const tryAITTS = useCallback(async (planetData: PlanetData, useIndonesian: boolean): Promise<boolean> => {
    try {
      setTtsMode('ai');
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planetData, useIndonesian }),
        signal: abortControllerRef.current.signal
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Setup audio event handlers
        audio.addEventListener('play', () => { setIsPlaying(true); setIsPaused(false); });
        audio.addEventListener('pause', () => { setIsPaused(true); });
        audio.addEventListener('ended', () => { setIsPlaying(false); setIsPaused(false); });
        audio.addEventListener('error', () => {
          setIsPlaying(false);
          setIsPaused(false);
          setError('Audio playback failed');
        });

        await audio.play();
        return true;
      }
    } catch (error) {
      console.log('AI TTS failed, trying fallback...', error);
    }
    return false;
  }, []);

  // Try enhanced browser TTS with AI text
  const tryEnhancedBrowserTTS = useCallback(async (planetData: PlanetData, useIndonesian: boolean): Promise<boolean> => {
    try {
      setTtsMode('enhanced-browser');
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planetData, useIndonesian }),
        signal: abortControllerRef.current.signal
      });

      if (response.ok) {
        const data = await response.json();
        return await playWithBrowserTTS(data.enhancedText, useIndonesian);
      }
    } catch (error) {
      console.log('Enhanced text generation failed, trying basic...', error);
    }
    return false;
  }, []);

  // Basic browser TTS fallback
  const tryBasicBrowserTTS = useCallback((planetData: PlanetData, useIndonesian: boolean): Promise<boolean> => {
    setTtsMode('basic-browser');
    const basicText = generateBasicNarration(planetData, useIndonesian);
    return playWithBrowserTTS(basicText, useIndonesian);
  }, []);

  const playWithBrowserTTS = useCallback((text: string, useIndonesian: boolean): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve(false);
        return;
      }

      window.speechSynthesis.cancel();

      // Process text for better speech
      const processedText = text
        .replace(/\./g, '. ')
        .replace(/,/g, ', ')
        .replace(/:/g, ': ')
        .replace(/!/g, '! ')
        .replace(/\?/g, '? ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.lang = useIndonesian ? 'id-ID' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;

      // Try to get a good voice
      const voices = window.speechSynthesis.getVoices();
      const targetLang = useIndonesian ? 'id' : 'en';
      const goodVoice = voices.find(voice => voice.lang.startsWith(targetLang)) || voices[0];
      if (goodVoice) {
        utterance.voice = goodVoice;
      }

      utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
      utterance.onend = () => { setIsPlaying(false); setIsPaused(false); resolve(true); };
      utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); resolve(false); };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const generateSpeech = useCallback(async (planetData: PlanetData, useIndonesian: boolean = true) => {
    if (!isSupported) {
      setError('Speech synthesis not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);
    cleanup();

    try {
      // Try AI TTS first
      if (await tryAITTS(planetData, useIndonesian)) {
        setIsLoading(false);
        return;
      }

      // Try enhanced browser TTS
      if (await tryEnhancedBrowserTTS(planetData, useIndonesian)) {
        setIsLoading(false);
        return;
      }

      // Fallback to basic browser TTS
      if (await tryBasicBrowserTTS(planetData, useIndonesian)) {
        setIsLoading(false);
        return;
      }

      throw new Error('All TTS methods failed');

    } catch (error) {
      setIsLoading(false);
      if (error instanceof Error && error.name !== 'AbortError') {
        setError(error.message || 'Failed to generate speech');
      }
      console.error('TTS generation error:', error);
    }
  }, [isSupported, tryAITTS, tryEnhancedBrowserTTS, tryBasicBrowserTTS, cleanup]);

  const play = useCallback(async () => {
    if (ttsMode === 'ai' && audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (error) {
        setError('Failed to play audio');
      }
    } else if (ttsMode !== 'ai' && utteranceRef.current) {
      window.speechSynthesis.resume();
    }
  }, [ttsMode]);

  const pause = useCallback(() => {
    if (ttsMode === 'ai' && audioRef.current) {
      audioRef.current.pause();
    } else if (ttsMode !== 'ai') {
      window.speechSynthesis.pause();
    }
  }, [ttsMode]);

  const stop = useCallback(() => {
    if (ttsMode === 'ai' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else if (ttsMode !== 'ai') {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, [ttsMode]);

  const toggle = useCallback(() => {
    if (isLoading) return;

    if (isPlaying && !isPaused) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, isPaused, isLoading, pause, play]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    cleanup();
  }, [cleanup]);

  return {
    isSupported,
    isLoading,
    isPlaying,
    isPaused,
    error,
    ttsMode,
    generateSpeech,
    play,
    pause,
    stop,
    toggle,
    cancelGeneration,
    cleanup
  };
};

// Basic narration fallback
function generateBasicNarration(planetData: PlanetData, useIndonesian: boolean): string {
  const name = useIndonesian ? planetData.nameId : planetData.name;
  const description = useIndonesian ? planetData.descriptionId : planetData.description;
  const facts = useIndonesian ? planetData.factsId : planetData.facts;

  const introduction = useIndonesian
    ? `Halo teman-teman! Mari kita pelajari tentang ${name}. ${description}`
    : `Hello friends! Let's learn about ${name}. ${description}`;

  const factsIntro = useIndonesian
    ? "Berikut adalah fakta-fakta menarik:"
    : "Here are some amazing facts:";

  const factsList = facts.map((fact: string, index: number) => {
    const factNumber = useIndonesian ? `Fakta ke-${index + 1}` : `Fact number ${index + 1}`;
    return `${factNumber}: ${fact}.`;
  }).join(' ');

  const conclusion = useIndonesian
    ? `Itulah informasi menarik tentang ${name}. Terima kasih sudah mendengarkan!`
    : `That was interesting information about ${name}. Thank you for listening!`;

  return `${introduction} ${factsIntro} ${factsList} ${conclusion}`;
}