import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerMode, TimerState, TimerSettings } from '@/types';
import { soundManager } from '@/lib/sounds';

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
  const warningPlayedRef = useRef<boolean>(false); // Track if 5-min warning was played

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
    soundManager.play('timer-start'); // Play start sound
    warningPlayedRef.current = false; // Reset warning flag when starting
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
    warningPlayedRef.current = false; // Reset warning flag
  }, [getDurationForMode]);

  const skip = useCallback(() => {
    const nextMode: TimerMode = state.mode === 'work' 
      ? (state.currentSession % settings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak')
      : 'work';
    
    warningPlayedRef.current = false; // Reset warning flag

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
          // Check for 5-minute warning (300 seconds) - use range to avoid missing due to timing
          if (prev.timeRemaining <= 300 && prev.timeRemaining > 299 && !warningPlayedRef.current) {
            soundManager.play('timer-warning');
            warningPlayedRef.current = true;
          }

          if (prev.timeRemaining <= 1) {
            // Timer completed - play completion sound
            soundManager.play('timer-end');
            warningPlayedRef.current = false; // Reset for next session
            
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
  }, [state.isRunning, settings, getDurationForMode]);

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
