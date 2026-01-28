import { useState } from 'react';
import { BookOpen, Lock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { StoryChapter } from '@/types';

interface StoryReaderProps {
  stories: StoryChapter[];
  onClose: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  stories,
  onClose,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  
  const unlockedStories = stories.filter(s => s.unlocked);
  const currentStory = unlockedStories[currentChapterIndex] || unlockedStories[0];
  
  const handlePrev = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentChapterIndex < unlockedStories.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
    }
  };

  if (!currentStory) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Lock className="w-12 h-12 text-white/30 mb-4" />
        <h3 className="text-white font-medium mb-2">Stories Locked</h3>
        <p className="text-white/50 text-sm">
          Complete focus sessions to unlock chapters of the story.
        </p>
        <Button onClick={onClose} className="mt-6">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold">The Lo-Fi Chronicles</h3>
            <p className="text-white/50 text-xs">
              Chapter {currentChapterIndex + 1} of {unlockedStories.length}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white/50 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Chapter selector */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          disabled={currentChapterIndex === 0}
          className="w-8 h-8 text-white/60 hover:text-white disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex gap-1 justify-center">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className={`w-2 h-2 rounded-full transition-all ${
                story.unlocked
                  ? index === currentChapterIndex
                    ? 'bg-amber-400 w-4'
                    : 'bg-white/30'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={currentChapterIndex >= unlockedStories.length - 1}
          className="w-8 h-8 text-white/60 hover:text-white disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Chapter title */}
      <div className="mb-4">
        <h4 className="text-xl font-bold text-white mb-1">
          {currentStory.title}
        </h4>
        <div className="h-0.5 w-16 bg-gradient-to-r from-amber-500 to-orange-500" />
      </div>

      {/* Story content */}
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="prose prose-invert prose-sm max-w-none">
          {currentStory.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-white/80 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <p className="text-white/40 text-xs">
          {stories.filter(s => s.unlocked).length} of {stories.length} chapters unlocked
        </p>
        <p className="text-white/40 text-xs">
          Next unlock: {stories.find(s => !s.unlocked)?.unlockAt || 'All unlocked'} sessions
        </p>
      </div>
    </div>
  );
};
