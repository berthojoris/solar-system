'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PlanetData } from '@/data/planetData';

interface UseAITTSOptions {
  lang?: string;
  onError?: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export const useAITTS = (options: UseAITTSOptions = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { onError, onLoadingChange } = options;

  useEffect(() => {
    // Check if audio is supported in the browser
    setIsSupported(typeof Audio !== 'undefined');

    return () => {
      // Cleanup on unmount
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioUrl(null);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [currentAudioUrl]);

  const generateSpeech = useCallback(async (planetData: PlanetData, useIndonesian: boolean = true) => {
    if (!isSupported) {
      setError('Audio not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);
    cleanup(); // Clean up previous audio

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planetData,
          useIndonesian
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('TTS API Error Details:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          const errorText = await response.text().catch(() => 'Unknown error');
          errorMessage = `${errorMessage} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      // Get audio blob from response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);

      // Create and setup audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Setup audio event handlers
      audio.addEventListener('loadstart', () => {
        setIsLoading(true);
      });

      audio.addEventListener('canplaythrough', () => {
        setIsLoading(false);
      });

      audio.addEventListener('play', () => {
        setIsPlaying(true);
        setIsPaused(false);
      });

      audio.addEventListener('pause', () => {
        setIsPaused(true);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setIsPaused(false);
      });

      audio.addEventListener('error', (e) => {
        setIsPlaying(false);
        setIsPaused(false);
        setIsLoading(false);
        setError('Failed to play audio');
        console.error('Audio playback error:', e);
      });

      // Start playing automatically
      try {
        await audio.play();
      } catch (playError) {
        console.error('Auto-play failed:', playError);
        setError('Click play button to start audio (auto-play blocked)');
        setIsLoading(false);
      }

    } catch (error) {
      setIsLoading(false);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request cancelled');
        } else {
          // Provide user-friendly error messages
          let userMessage = error.message;
          if (error.message.includes('not configured')) {
            userMessage = 'AI TTS service not configured. Please check API settings.';
          } else if (error.message.includes('401') || error.message.includes('403')) {
            userMessage = 'API authentication failed. Please check your API key.';
          } else if (error.message.includes('429')) {
            userMessage = 'API rate limit reached. Please try again later.';
          } else if (error.message.includes('500')) {
            userMessage = 'Server error. Please try again later.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            userMessage = 'Network error. Please check your internet connection.';
          }

          setError(userMessage);
        }
      } else {
        setError('Unknown error occurred');
      }
      console.error('TTS generation error:', error);
    }
  }, [isSupported, cleanup]);

  const play = useCallback(async () => {
    if (audioRef.current && !isLoading) {
      try {
        await audioRef.current.play();
      } catch (error) {
        setError('Failed to play audio');
        console.error('Play error:', error);
      }
    }
  }, [isLoading]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

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

  // Get current playback time and duration
  const getProgress = useCallback(() => {
    if (!audioRef.current) return { currentTime: 0, duration: 0, progress: 0 };

    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 0;
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return { currentTime, duration, progress };
  }, []);

  // Seek to specific time
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  return {
    // Status
    isSupported,
    isLoading,
    isPlaying,
    isPaused,
    error,

    // Actions
    generateSpeech,
    play,
    pause,
    stop,
    toggle,
    cancelGeneration,

    // Progress
    getProgress,
    seekTo,

    // Cleanup
    cleanup
  };
};