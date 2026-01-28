import { useState, useCallback } from 'react';
import { 
  ListTodo, 
  Music, 
  BookOpen, 
  Settings, 
  Image,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { Timer } from '@/components/Timer';
import { TaskList } from '@/components/TaskList';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Character } from '@/components/Character';
import { StoryReader } from '@/components/StoryReader';
import { SceneSelector } from '@/components/SceneSelector';
import { Settings as SettingsPanel } from '@/components/Settings';

import { useTimer } from '@/hooks/useTimer';
import { useTasks } from '@/hooks/useTasks';
import { useMusic } from '@/hooks/useMusic';
import { useCharacter } from '@/hooks/useCharacter';
import { getUnlockedStories } from '@/data/stories';
import { scenes } from '@/data/scenes';

import type { TimerSettings, SceneType, TimerMode } from '@/types';

const defaultTimerSettings: TimerSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

function App() {
  // State
  const [currentScene, setCurrentScene] = useState<SceneType>('cafe');
  const [showTasks, setShowTasks] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSceneSelector, setShowSceneSelector] = useState(false);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(defaultTimerSettings);

  // Hooks
  const timer = useTimer(timerSettings);
  const tasks = useTasks();
  const music = useMusic();
  const character = useCharacter(timer.mode, timer.isRunning, timer.totalSessions);

  // Get unlocked stories based on completed sessions
  const stories = getUnlockedStories(timer.totalSessions);

  // Get current scene gradient
  const sceneGradient = scenes.find(s => s.id === currentScene)?.gradient || 'scene-cafe';

  // Handle timer mode change
  const handleModeChange = useCallback((mode: TimerMode) => {
    timer.switchMode(mode);
  }, [timer]);

  // Update timer settings
  const handleUpdateSettings = useCallback((newSettings: TimerSettings) => {
    setTimerSettings(newSettings);
  }, []);

  // Toggle panels
  const togglePanel = (panel: 'tasks' | 'music' | 'story' | 'settings' | 'scene') => {
    // Close all other panels
    setShowTasks(false);
    setShowMusic(false);
    setShowStory(false);
    setShowSettings(false);
    setShowSceneSelector(false);

    // Open selected panel
    switch (panel) {
      case 'tasks':
        setShowTasks(true);
        break;
      case 'music':
        setShowMusic(true);
        break;
      case 'story':
        setShowStory(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'scene':
        setShowSceneSelector(true);
        break;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ${sceneGradient}`}>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/20" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <span className="text-xl">☕</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Chill With You</h1>
              <p className="text-white/50 text-xs">Lo-Fi Story</p>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => togglePanel('scene')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Image className="w-4 h-4 mr-2" />
              Scene
            </Button>
            <Button
              variant="ghost"
              onClick={() => togglePanel('tasks')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ListTodo className="w-4 h-4 mr-2" />
              Tasks
            </Button>
            <Button
              variant="ghost"
              onClick={() => togglePanel('music')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Music className="w-4 h-4 mr-2" />
              Music
            </Button>
            <Button
              variant="ghost"
              onClick={() => togglePanel('story')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Story
            </Button>
            <Button
              variant="ghost"
              onClick={() => togglePanel('settings')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </nav>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass border-white/10 w-72">
              <div className="flex flex-col gap-2 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => togglePanel('scene')}
                  className="justify-start text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Image className="w-4 h-4 mr-3" />
                  Scene
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => togglePanel('tasks')}
                  className="justify-start text-white/70 hover:text-white hover:bg-white/10"
                >
                  <ListTodo className="w-4 h-4 mr-3" />
                  Tasks
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => togglePanel('music')}
                  className="justify-start text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Music className="w-4 h-4 mr-3" />
                  Music
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => togglePanel('story')}
                  className="justify-start text-white/70 hover:text-white hover:bg-white/10"
                >
                  <BookOpen className="w-4 h-4 mr-3" />
                  Story
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => togglePanel('settings')}
                  className="justify-start text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main area */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-6xl grid lg:grid-cols-3 gap-8 items-start">
            {/* Left panel - Timer */}
            <div className="lg:col-span-2">
              <div className="glass rounded-3xl p-8 sm:p-12">
                <Timer
                  mode={timer.mode}
                  formattedTime={timer.formattedTime}
                  timeRemaining={timer.timeRemaining}
                  totalTime={
                    timer.mode === 'work'
                      ? timerSettings.workDuration
                      : timer.mode === 'shortBreak'
                      ? timerSettings.shortBreakDuration
                      : timerSettings.longBreakDuration
                  }
                  isRunning={timer.isRunning}
                  currentSession={timer.currentSession}
                  totalSessions={timer.totalSessions}
                  onStart={timer.start}
                  onPause={timer.pause}
                  onReset={timer.reset}
                  onSkip={timer.skip}
                  onModeChange={handleModeChange}
                />
              </div>

              {/* Character */}
              <div className="mt-8 flex justify-center">
                <Character
                  mood={character.character.mood}
                  message={character.character.message}
                  showBubble={character.showBubble}
                  onClick={() => character.showMessage('Keep going! You\'re doing great! ✨')}
                />
              </div>
            </div>

            {/* Right panel - Side panels */}
            <div className="hidden lg:block">
              <div className="glass rounded-3xl p-6 h-[600px]">
                {showTasks && (
                  <div className="h-full animate-slide-in">
                    <TaskList
                      tasks={tasks.tasks}
                      onAddTask={tasks.addTask}
                      onToggleTask={tasks.toggleTask}
                      onDeleteTask={tasks.deleteTask}
                      onEditTask={tasks.editTask}
                      completedCount={tasks.completedCount}
                      pendingCount={tasks.pendingCount}
                    />
                  </div>
                )}

                {showMusic && (
                  <div className="h-full animate-slide-in">
                    <MusicPlayer
                      isPlaying={music.isPlaying}
                      currentTrack={music.currentTrack}
                      volume={music.volume}
                      playlist={music.playlist}
                      currentIndex={music.currentIndex}
                      onToggle={music.toggle}
                      onNext={music.nextTrack}
                      onPrev={music.prevTrack}
                      onSelectTrack={music.selectTrack}
                      onVolumeChange={music.setVolume}
                      onAddTrack={music.addCustomTrack}
                      onRemoveTrack={music.removeTrack}
                    />
                  </div>
                )}

                {showStory && (
                  <div className="h-full animate-slide-in">
                    <StoryReader
                      stories={stories}
                      onClose={() => setShowStory(false)}
                    />
                  </div>
                )}

                {showSettings && (
                  <div className="h-full animate-slide-in">
                    <SettingsPanel
                      settings={timerSettings}
                      onUpdateSettings={handleUpdateSettings}
                      onClose={() => setShowSettings(false)}
                    />
                  </div>
                )}

                {showSceneSelector && (
                  <div className="h-full animate-slide-in">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Select Scene</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowSceneSelector(false)}
                          className="text-white/50 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      <SceneSelector
                        currentScene={currentScene}
                        onSceneChange={setCurrentScene}
                      />
                    </div>
                  </div>
                )}

                {/* Default view - Quick stats */}
                {!showTasks && !showMusic && !showStory && !showSettings && !showSceneSelector && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <span className="text-4xl">✨</span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Welcome Back!</h3>
                    <p className="text-white/50 text-sm mb-6">
                      Select a feature from the menu to get started
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button
                        onClick={() => togglePanel('tasks')}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
                      >
                        <ListTodo className="w-5 h-5 text-white/60 mb-2" />
                        <p className="text-white text-sm font-medium">Tasks</p>
                        <p className="text-white/40 text-xs">{tasks.pendingCount} pending</p>
                      </button>
                      <button
                        onClick={() => togglePanel('music')}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
                      >
                        <Music className="w-5 h-5 text-white/60 mb-2" />
                        <p className="text-white text-sm font-medium">Music</p>
                        <p className="text-white/40 text-xs">
                          {music.isPlaying ? 'Playing' : 'Paused'}
                        </p>
                      </button>
                      <button
                        onClick={() => togglePanel('story')}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
                      >
                        <BookOpen className="w-5 h-5 text-white/60 mb-2" />
                        <p className="text-white text-sm font-medium">Story</p>
                        <p className="text-white/40 text-xs">
                          {stories.filter(s => s.unlocked).length} chapters
                        </p>
                      </button>
                      <button
                        onClick={() => togglePanel('settings')}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
                      >
                        <Settings className="w-5 h-5 text-white/60 mb-2" />
                        <p className="text-white text-sm font-medium">Settings</p>
                        <p className="text-white/40 text-xs">Customize timer</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Mobile panels */}
        <div className="lg:hidden">
          <Sheet open={showTasks} onOpenChange={setShowTasks}>
            <SheetContent side="bottom" className="glass border-white/10 h-[80vh]">
              <div className="h-full py-4">
                <TaskList
                  tasks={tasks.tasks}
                  onAddTask={tasks.addTask}
                  onToggleTask={tasks.toggleTask}
                  onDeleteTask={tasks.deleteTask}
                  onEditTask={tasks.editTask}
                  completedCount={tasks.completedCount}
                  pendingCount={tasks.pendingCount}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={showMusic} onOpenChange={setShowMusic}>
            <SheetContent side="bottom" className="glass border-white/10 h-[80vh]">
              <div className="h-full py-4">
                <MusicPlayer
                  isPlaying={music.isPlaying}
                  currentTrack={music.currentTrack}
                  volume={music.volume}
                  playlist={music.playlist}
                  currentIndex={music.currentIndex}
                  onToggle={music.toggle}
                  onNext={music.nextTrack}
                  onPrev={music.prevTrack}
                  onSelectTrack={music.selectTrack}
                  onVolumeChange={music.setVolume}
                  onAddTrack={music.addCustomTrack}
                  onRemoveTrack={music.removeTrack}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={showStory} onOpenChange={setShowStory}>
            <SheetContent side="bottom" className="glass border-white/10 h-[80vh]">
              <div className="h-full py-4">
                <StoryReader
                  stories={stories}
                  onClose={() => setShowStory(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetContent side="bottom" className="glass border-white/10 h-[80vh]">
              <div className="h-full py-4">
                <SettingsPanel
                  settings={timerSettings}
                  onUpdateSettings={handleUpdateSettings}
                  onClose={() => setShowSettings(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={showSceneSelector} onOpenChange={setShowSceneSelector}>
            <SheetContent side="bottom" className="glass border-white/10 h-[80vh]">
              <div className="h-full py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Select Scene</h3>
                </div>
                <SceneSelector
                  currentScene={currentScene}
                  onSceneChange={setCurrentScene}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Footer */}
        <footer className="p-4 text-center">
          <p className="text-white/30 text-xs">
            Chill With You: Lo-Fi Story • Stay focused, stay relaxed
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
