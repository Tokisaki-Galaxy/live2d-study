import React from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimerMode } from "@/types";

interface TimerProps {
  mode: TimerMode;
  formattedTime: string;
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  currentSession: number;
  totalSessions: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onModeChange: (mode: TimerMode) => void;
}

const modeConfig: Record<
  TimerMode,
  { label: string; color: string; gradient: string }
> = {
  work: {
    label: "Focus Time",
    color: "text-rose-400",
    gradient: "from-rose-500/20 to-orange-500/20",
  },
  shortBreak: {
    label: "Short Break",
    color: "text-emerald-400",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  longBreak: {
    label: "Long Break",
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
};

export const Timer: React.FC<TimerProps> = ({
  mode,
  formattedTime,
  timeRemaining,
  totalTime,
  isRunning,
  currentSession,
  totalSessions,
  onStart,
  onPause,
  onReset,
  onSkip,
  onModeChange,
}) => {
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const config = modeConfig[mode];

  return (
    <div className="flex flex-col items-center">
      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === m
                ? "bg-white/20 text-white shadow-lg"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
            }`}
          >
            {m === "work"
              ? "Focus"
              : m === "shortBreak"
                ? "Short Break"
                : "Long Break"}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative mb-6">
        {/* Outer glow */}
        <div
          className={`absolute inset-0 rounded-full blur-3xl opacity-30 bg-gradient-to-br ${config.gradient}`}
        />

        {/* SVG Circle */}
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="timer-circle"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor={
                  mode === "work"
                    ? "#fb7185"
                    : mode === "shortBreak"
                      ? "#34d399"
                      : "#60a5fa"
                }
              />
              <stop
                offset="100%"
                stopColor={
                  mode === "work"
                    ? "#fb923c"
                    : mode === "shortBreak"
                      ? "#14b8a6"
                      : "#818cf8"
                }
              />
            </linearGradient>
          </defs>
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-6xl font-bold tabular-nums tracking-tight ${config.color}`}
          >
            {formattedTime}
          </span>
          <span className="text-white/60 text-sm mt-2 font-medium">
            {config.label}
          </span>
        </div>
      </div>

      {/* Session indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-white/40 text-xs">Session</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= currentSession
                  ? mode === "work" && i === currentSession && isRunning
                    ? "bg-rose-400 animate-pulse"
                    : "bg-white/60"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <span className="text-white/40 text-xs">{currentSession}/4</span>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={isRunning ? onPause : onStart}
          className={`w-16 h-16 rounded-full transition-all duration-300 shadow-lg ${
            isRunning
              ? "bg-white/20 hover:bg-white/30 text-white"
              : "bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white"
          }`}
        >
          {isRunning ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSkip}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Total sessions */}
      {totalSessions > 0 && (
        <div className="mt-4 text-white/40 text-xs">
          Total sessions completed:{" "}
          <span className="text-white/60 font-medium">{totalSessions}</span>
        </div>
      )}
    </div>
  );
};
