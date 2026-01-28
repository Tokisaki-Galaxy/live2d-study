// Task types
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

// Timer types
export type TimerMode = "work" | "shortBreak" | "longBreak";

export interface TimerState {
  mode: TimerMode;
  timeRemaining: number;
  isRunning: boolean;
  totalSessions: number;
  currentSession: number;
}

// Music types
export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  cover?: string;
}

export interface MusicState {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  playlist: Track[];
  currentIndex: number;
}

// Scene types
export type SceneType = "cafe" | "rain" | "sunset" | "night" | "forest";

export interface Scene {
  id: SceneType;
  name: string;
  description: string;
  icon: string;
  gradient: string;
}

// Character types
export type CharacterMood = "happy" | "focus" | "sleep" | "encourage";

export type CharacterType = "svg" | "live2d" | "spine";

export interface CharacterConfig {
  type: CharacterType;
  modelUrl?: string; // For URL import
  modelData?: string; // For generic file content (Blob URL of the zip)
  modelSourceType?: "url" | "zip";
  scale: number;
  position: { x: number; y: number };
  motionMapping: {
    idle: string; // Maps to 'happy' / regular state
    focus: string; // Maps to 'focus'
    sleep: string; // Maps to 'sleep'
    tap: string; // Maps to 'encourage' / interaction
  };
}

export interface Character {
  id: string;
  name: string;
  mood: CharacterMood;
  message: string;
}

// Story types
export interface StoryChapter {
  id: string;
  title: string;
  content: string;
  unlocked: boolean;
  unlockAt: number; // sessions needed
}

// App state
export interface AppState {
  timer: TimerState;
  tasks: Task[];
  music: MusicState;
  currentScene: SceneType;
  character: Character;
  stories: StoryChapter[];
  showStory: boolean;
  showTasks: boolean;
  showMusic: boolean;
  showSettings: boolean;
}

// Settings
export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface AppSettings {
  timer: TimerSettings;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

// Timer Events
export type TimerEvent = "start" | "complete" | "warning";

export interface TimerEventCallbacks {
  onTimerStart?: () => void;
  onTimerComplete?: () => void;
  onTimerWarning?: () => void;
}

// TTS (Text-to-Speech) types
export interface TTSSettings {
  enabled: boolean;
  voiceURI: string; // Selected voice URI
  rate: number; // Speech rate (0.1 - 10)
  pitch: number; // Speech pitch (0 - 2)
  volume: number; // Speech volume (0 - 1)
}

export interface TTSVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
}
