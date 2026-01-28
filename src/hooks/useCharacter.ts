import { useState, useCallback, useEffect } from 'react';
import type { Character, CharacterMood, TimerMode } from '@/types';

interface CharacterMessage {
  mood: CharacterMood;
  messages: string[];
}

const characterMessages: CharacterMessage[] = [
  {
    mood: 'happy',
    messages: [
      'Hey there! Ready to get some work done? ✨',
      'You\'re doing amazing! Keep it up! 🌟',
      'I believe in you! Let\'s make today productive! 💪',
      'Great to see you! Let\'s chill and focus together! ☕',
    ],
  },
  {
    mood: 'focus',
    messages: [
      'Deep focus mode activated. You\'ve got this! 🎯',
      'Stay in the zone. Every minute counts! ⏰',
      'Concentrate on one thing at a time. Breathe. 🧘',
      'Your future self will thank you for this focus time! 📈',
    ],
  },
  {
    mood: 'sleep',
    messages: [
      'Time to rest and recharge. You earned it! 😴',
      'Take a deep breath. Relax your shoulders. 🌙',
      'Rest is just as important as work. Enjoy this break! ☁️',
      'Close your eyes for a moment. Let your mind wander... 💭',
    ],
  },
  {
    mood: 'encourage',
    messages: [
      'That was a great session! Proud of you! 🎉',
      'Look at you go! Another session completed! 🏆',
      'You\'re building great habits. Keep going! 🚀',
      'Small steps lead to big achievements! 🌱',
    ],
  },
];

const getRandomMessage = (mood: CharacterMood): string => {
  const messages = characterMessages.find(m => m.mood === mood)?.messages || [];
  return messages[Math.floor(Math.random() * messages.length)];
};

export function useCharacter(timerMode: TimerMode, isRunning: boolean, sessionsCompleted: number) {
  const [character, setCharacter] = useState<Character>({
    id: 'momo',
    name: 'Momo',
    mood: 'happy',
    message: getRandomMessage('happy'),
  });

  const [showBubble, setShowBubble] = useState(true);

  // Update character mood based on timer state
  useEffect(() => {
    let newMood: CharacterMood = 'happy';
    
    if (timerMode === 'work' && isRunning) {
      newMood = 'focus';
    } else if (timerMode === 'shortBreak' || timerMode === 'longBreak') {
      newMood = 'sleep';
    } else if (sessionsCompleted > 0 && !isRunning && timerMode === 'work') {
      newMood = 'encourage';
    }

    setCharacter(prev => ({
      ...prev,
      mood: newMood,
      message: getRandomMessage(newMood),
    }));

    // Show message bubble when mood changes
    setShowBubble(true);
    const timer = setTimeout(() => setShowBubble(false), 5000);
    return () => clearTimeout(timer);
  }, [timerMode, isRunning, sessionsCompleted]);

  const setMood = useCallback((mood: CharacterMood) => {
    setCharacter(prev => ({
      ...prev,
      mood,
      message: getRandomMessage(mood),
    }));
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 5000);
  }, []);

  const showMessage = useCallback((message: string) => {
    setCharacter(prev => ({
      ...prev,
      message,
    }));
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 5000);
  }, []);

  const hideBubble = useCallback(() => {
    setShowBubble(false);
  }, []);

  return {
    character,
    showBubble,
    setMood,
    showMessage,
    hideBubble,
  };
}
