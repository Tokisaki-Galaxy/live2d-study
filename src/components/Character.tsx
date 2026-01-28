import React, { useEffect, useState } from 'react';
import type { CharacterMood } from '@/types';

interface CharacterProps {
  mood: CharacterMood;
  message: string;
  showBubble: boolean;
  onClick?: () => void;
}

// SVG Character - Momo the Cat
const CharacterSVG: React.FC<{ mood: CharacterMood }> = ({ mood }) => {
  const getMoodColors = () => {
    switch (mood) {
      case 'happy':
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: 'rgba(251, 191, 36, 0.5)' };
      case 'focus':
        return { primary: '#60a5fa', secondary: '#3b82f6', glow: 'rgba(96, 165, 250, 0.5)' };
      case 'sleep':
        return { primary: '#a78bfa', secondary: '#8b5cf6', glow: 'rgba(167, 139, 250, 0.5)' };
      case 'encourage':
        return { primary: '#f472b6', secondary: '#ec4899', glow: 'rgba(244, 114, 182, 0.5)' };
      default:
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: 'rgba(251, 191, 36, 0.5)' };
    }
  };

  const colors = getMoodColors();

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      style={{ filter: `drop-shadow(0 0 20px ${colors.glow})` }}
    >
      {/* Body */}
      <ellipse
        cx="100"
        cy="140"
        rx="50"
        ry="45"
        fill={colors.primary}
      />
      
      {/* Head */}
      <circle cx="100" cy="85" r="40" fill={colors.primary} />
      
      {/* Ears */}
      <path
        d="M65 65 L55 30 L85 55 Z"
        fill={colors.secondary}
      />
      <path
        d="M135 65 L145 30 L115 55 Z"
        fill={colors.secondary}
      />
      
      {/* Inner ears */}
      <path
        d="M68 60 L62 40 L80 55 Z"
        fill="#fde68a"
      />
      <path
        d="M132 60 L138 40 L120 55 Z"
        fill="#fde68a"
      />
      
      {/* Eyes */}
      {mood === 'sleep' ? (
        <>
          {/* Closed eyes */}
          <path d="M75 85 Q85 90 95 85" stroke={colors.secondary} strokeWidth="3" fill="none" />
          <path d="M105 85 Q115 90 125 85" stroke={colors.secondary} strokeWidth="3" fill="none" />
        </>
      ) : (
        <>
          {/* Open eyes */}
          <ellipse cx="85" cy="82" rx="8" ry="10" fill="#1e1b4b" />
          <ellipse cx="115" cy="82" rx="8" ry="10" fill="#1e1b4b" />
          
          {/* Eye shine */}
          <circle cx="88" cy="78" r="3" fill="white" />
          <circle cx="118" cy="78" r="3" fill="white" />
        </>
      )}
      
      {/* Nose */}
      <path
        d="M95 95 L105 95 L100 102 Z"
        fill="#f472b6"
      />
      
      {/* Mouth */}
      {mood === 'happy' || mood === 'encourage' ? (
        <path
          d="M100 102 Q90 110 85 105 M100 102 Q110 110 115 105"
          stroke={colors.secondary}
          strokeWidth="2"
          fill="none"
        />
      ) : mood === 'sleep' ? (
        <path
          d="M95 105 Q100 108 105 105"
          stroke={colors.secondary}
          strokeWidth="2"
          fill="none"
        />
      ) : (
        <path
          d="M95 105 L100 108 L105 105"
          stroke={colors.secondary}
          strokeWidth="2"
          fill="none"
        />
      )}
      
      {/* Whiskers */}
      <line x1="60" y1="90" x2="40" y2="85" stroke={colors.secondary} strokeWidth="1.5" opacity="0.6" />
      <line x1="60" y1="95" x2="40" y2="95" stroke={colors.secondary} strokeWidth="1.5" opacity="0.6" />
      <line x1="60" y1="100" x2="40" y2="105" stroke={colors.secondary} strokeWidth="1.5" opacity="0.6" />
      
      <line x1="140" y1="90" x2="160" y2="85" stroke={colors.secondary} strokeWidth="1.5" opacity="0.6" />
      <line x1="140" y1="95" x2="160" y2="95" stroke={colors.secondary} strokeWidth="1.5" opacity="0.6" />
      <line x1="140" y1="100" x2="160" y2="105" stroke={colors.secondary} strokeWidth="1.5" opacity="0.6" />
      
      {/* Paws */}
      <ellipse cx="75" cy="175" rx="12" ry="8" fill={colors.primary} />
      <ellipse cx="125" cy="175" rx="12" ry="8" fill={colors.primary} />
      
      {/* Tail */}
      <path
        d="M140 150 Q170 140 165 110 Q160 90 150 100"
        stroke={colors.primary}
        strokeWidth="15"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Stripes */}
      <path d="M85 55 L90 65 L95 55" fill={colors.secondary} opacity="0.5" />
      <path d="M105 55 L110 65 L115 55" fill={colors.secondary} opacity="0.5" />
      
      {/* Zzz for sleep */}
      {mood === 'sleep' && (
        <>
          <text x="150" y="60" fill="#a78bfa" fontSize="16" fontFamily="sans-serif">Z</text>
          <text x="160" y="45" fill="#a78bfa" fontSize="12" fontFamily="sans-serif">z</text>
          <text x="170" y="35" fill="#a78bfa" fontSize="10" fontFamily="sans-serif">z</text>
        </>
      )}
    </svg>
  );
};

export const Character: React.FC<CharacterProps> = ({
  mood,
  message,
  showBubble,
  onClick,
}) => {
  const [bubbleVisible, setBubbleVisible] = useState(showBubble);

  useEffect(() => {
    setBubbleVisible(showBubble);
  }, [showBubble]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Speech Bubble */}
      {bubbleVisible && message && (
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 animate-fade-in"
          onClick={() => setBubbleVisible(false)}
        >
          <div className="glass rounded-2xl p-4 relative">
            <p className="text-white text-sm text-center leading-relaxed">
              {message}
            </p>
            {/* Triangle pointer */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/10 rotate-45" />
          </div>
        </div>
      )}

      {/* Character */}
      <div 
        onClick={onClick}
        className={`w-32 h-32 cursor-pointer transition-transform duration-300 hover:scale-105 ${
          mood === 'happy' ? 'animate-float' : 
          mood === 'sleep' ? '' : 
          'animate-breathe'
        }`}
      >
        <CharacterSVG mood={mood} />
      </div>

      {/* Character name */}
      <p className="mt-2 text-white/50 text-xs">Momo</p>
    </div>
  );
};
