import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerMode, TimerState, TimerSettings } from '@/types';

const defaultSettings: TimerSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

export function useTimer(settings: TimerSettings = defaultSettings) {
  const [state, setState] = useState<TimerState>({
    mode: 'work',
    timeRemaining: settings.workDuration,
    isRunning: false,
    totalSessions: 0,
    currentSession: 1,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getDurationForMode = useCallback((mode: TimerMode): number => {
    switch (mode) {
      case 'work':
        return settings.workDuration;
      case 'shortBreak':
        return settings.shortBreakDuration;
      case 'longBreak':
        return settings.longBreakDuration;
      default:
        return settings.workDuration;
    }
  }, [settings]);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }, []);

  const switchMode = useCallback((newMode: TimerMode) => {
    setState(prev => ({
      ...prev,
      mode: newMode,
      timeRemaining: getDurationForMode(newMode),
      isRunning: false,
    }));
  }, [getDurationForMode]);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeRemaining: getDurationForMode(prev.mode),
      isRunning: false,
    }));
  }, [getDurationForMode]);

  const skip = useCallback(() => {
    const nextMode: TimerMode = state.mode === 'work' 
      ? (state.currentSession % settings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak')
      : 'work';
    
    if (state.mode === 'work') {
      setState(prev => ({
        ...prev,
        mode: nextMode,
        timeRemaining: getDurationForMode(nextMode),
        isRunning: settings.autoStartBreaks,
        totalSessions: prev.totalSessions + 1,
        currentSession: prev.currentSession >= settings.sessionsBeforeLongBreak ? 1 : prev.currentSession + 1,
      }));
    } else {
      setState(prev => ({
        ...prev,
        mode: 'work',
        timeRemaining: settings.workDuration,
        isRunning: settings.autoStartPomodoros,
      }));
    }
  }, [state.mode, state.currentSession, settings, getDurationForMode]);

  // Timer tick
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            // Timer completed
            playNotificationSound();
            
            if (prev.mode === 'work') {
              const nextMode = prev.currentSession % settings.sessionsBeforeLongBreak === 0 
                ? 'longBreak' 
                : 'shortBreak';
              
              return {
                ...prev,
                mode: nextMode,
                timeRemaining: getDurationForMode(nextMode),
                isRunning: settings.autoStartBreaks,
                totalSessions: prev.totalSessions + 1,
                currentSession: prev.currentSession >= settings.sessionsBeforeLongBreak 
                  ? 1 
                  : prev.currentSession + 1,
              };
            } else {
              return {
                ...prev,
                mode: 'work',
                timeRemaining: settings.workDuration,
                isRunning: settings.autoStartPomodoros,
              };
            }
          }
          
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, settings, getDurationForMode, playNotificationSound]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const progress = useCallback((): number => {
    const total = getDurationForMode(state.mode);
    return ((total - state.timeRemaining) / total) * 100;
  }, [state.timeRemaining, state.mode, getDurationForMode]);

  return {
    ...state,
    formattedTime: formatTime(state.timeRemaining),
    progress: progress(),
    start,
    pause,
    reset,
    skip,
    switchMode,
  };
}
