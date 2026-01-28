import { useState, useCallback, useEffect } from 'react';
import type { Character, CharacterMood, TimerMode, CharacterConfig } from '@/types';

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
      'Welcome back! What shall we work on today? 📚',
      'Nice to see you again! Let\'s make some progress! 🎯',
      'Ready for another productive session? 💫',
      'Hey! I\'ve been waiting for you! 😊',
    ],
  },
  {
    mood: 'focus',
    messages: [
      'Deep focus mode activated. You\'ve got this! 🎯',
      'Stay in the zone. Every minute counts! ⏰',
      'Concentrate on one thing at a time. Breathe. 🧘',
      'Your future self will thank you for this focus time! 📈',
      'You\'re in the flow now! Keep going! 🌊',
      'Great concentration! I can feel your dedication! 💪',
      'One task at a time. You\'re doing great! ✨',
      'This is your moment to shine! 🌟',
    ],
  },
  {
    mood: 'sleep',
    messages: [
      'Time to rest and recharge. You earned it! 😴',
      'Take a deep breath. Relax your shoulders. 🌙',
      'Rest is just as important as work. Enjoy this break! ☁️',
      'Close your eyes for a moment. Let your mind wander... 💭',
      'Stretch a little! Move around! 🤸',
      'How about a quick walk? Fresh air helps! 🚶',
      'Time flies when you\'re focused! Rest well! ⏰',
      'You deserve this break. Recharge those batteries! 🔋',
    ],
  },
  {
    mood: 'encourage',
    messages: [
      'That was a great session! Proud of you! 🎉',
      'Look at you go! Another session completed! 🏆',
      'You\'re building great habits. Keep going! 🚀',
      'Small steps lead to big achievements! 🌱',
      'Excellent work! You\'re on fire today! 🔥',
      'Another one done! You\'re unstoppable! 💪',
      'Way to go! Keep up this amazing momentum! 🌟',
      'You just leveled up your productivity! 📈',
    ],
  },
];

// Special event messages
const eventMessages = {
  timerStart: [
    'Let\'s get started! Focus time begins now! 🎯',
    'Timer started! You can do this! 💪',
    'Here we go! Time to focus! ⏰',
    'Ready, set, go! Let\'s make progress! 🚀',
  ],
  timerComplete: [
    'Time\'s up! Great job on that session! 🎉',
    'Well done! You completed the timer! ✨',
    'Amazing focus! Session complete! 🏆',
    'That\'s how it\'s done! Another one finished! 🌟',
  ],
  fiveMinuteWarning: [
    'Just 5 minutes left! Almost there! ⏰',
    'Five more minutes! Keep that focus! 💪',
    'Only 5 minutes to go! You\'re doing great! 🎯',
    'Final stretch! 5 minutes remaining! 🏃',
  ],
  idle: [
    'How\'s it going? Remember to take breaks! ☕',
    'Don\'t forget to stay hydrated! 💧',
    'You\'re doing great! Keep up the good work! ✨',
    'Taking regular breaks helps productivity! 🌱',
    'Remember: progress over perfection! 🎯',
    'Every small step counts! 👣',
    'Believe in yourself! You\'ve got this! 💫',
    'Focus on the present moment. 🧘',
  ],
};

const getRandomEventMessage = (event: keyof typeof eventMessages): string => {
  const messages = eventMessages[event];
  return messages[Math.floor(Math.random() * messages.length)];
};

const getRandomMessage = (mood: CharacterMood): string => {
  const messages = characterMessages.find(m => m.mood === mood)?.messages || [];
  return messages[Math.floor(Math.random() * messages.length)];
};

const defaultCharacterConfig: CharacterConfig = {
  type: 'svg',
  scale: 0.1,
  position: { x: 0, y: 0 },
  motionMapping: {
      idle: 'Idle',
      focus: 'Focus',
      sleep: 'Sleep',
      tap: 'TapBody',
  }
}

export function useCharacter(timerMode: TimerMode, isRunning: boolean, sessionsCompleted: number) {
  const [character, setCharacter] = useState<Character>({
    id: 'momo',
    name: 'Momo',
    mood: 'happy',
    message: getRandomMessage('happy'),
  });

  // Persist Live2D Config
  // In a real app we would use localStorage more robustly
  const [config, setConfig] = useState<CharacterConfig>(() => {
      try {
        const saved = localStorage.getItem('character-config');
        return saved ? { ...defaultCharacterConfig, ...JSON.parse(saved) } : defaultCharacterConfig;
      } catch {
        return defaultCharacterConfig;
      }
  });

  const updateConfig = useCallback((newConfig: CharacterConfig) => {
    setConfig(newConfig);
    // Don't save Generic Blobs to local storage, they expire.
    // We only save types/mappings. 
    // Re-loading the file on refresh is an inevitable user action for security reasons
    // UNLESS we use IndexedDB. For now, we will save only partial config.
    
    // Create a version without the big blob data
    const { modelData, ...rest } = newConfig;
    localStorage.setItem('character-config', JSON.stringify(rest));
  }, []);

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

  // Show idle messages periodically (every 3 minutes)
  useEffect(() => {
    const idleInterval = setInterval(() => {
      // Only show idle messages when not in active focus mode
      if (!isRunning || timerMode !== 'work') {
        setCharacter(prev => ({
          ...prev,
          message: getRandomEventMessage('idle'),
        }));
        setShowBubble(true);
        setTimeout(() => setShowBubble(false), 5000);
      }
    }, 3 * 60 * 1000); // Every 3 minutes

    return () => clearInterval(idleInterval);
  }, [isRunning, timerMode]);

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

  const showEventMessage = useCallback((event: keyof typeof eventMessages) => {
    setCharacter(prev => ({
      ...prev,
      message: getRandomEventMessage(event),
    }));
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 5000);
  }, []);

  return {
    character,
    showBubble,
    setMood,
    showMessage,
    showEventMessage, // Export new method
    hideBubble,
    config,       // Export config
    updateConfig, // Export updater
  };
}
