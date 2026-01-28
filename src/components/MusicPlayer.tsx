import React, { useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, Trash2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Track } from '@/types';

interface MusicPlayerProps {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  playlist: Track[];
  currentIndex: number;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectTrack: (index: number) => void;
  onVolumeChange: (volume: number) => void;
  onAddTrack: (file: File) => void;
  onRemoveTrack: (id: string) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isPlaying,
  currentTrack,
  volume,
  playlist,
  currentIndex,
  onToggle,
  onNext,
  onPrev,
  onSelectTrack,
  onVolumeChange,
  onAddTrack,
  onRemoveTrack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolume = useRef(volume);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onAddTrack(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange(previousVolume.current);
      setIsMuted(false);
    } else {
      previousVolume.current = volume;
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Now Playing */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 flex items-center justify-center">
            {currentTrack ? (
              <div className="relative">
                <Music className="w-8 h-8 text-violet-300" />
                {isPlaying && (
                  <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                    <div className="w-1 h-3 bg-violet-400 animate-pulse" />
                    <div className="w-1 h-4 bg-violet-400 animate-pulse delay-75" />
                    <div className="w-1 h-2 bg-violet-400 animate-pulse delay-150" />
                  </div>
                )}
              </div>
            ) : (
              <Music className="w-8 h-8 text-white/30" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium truncate">
              {currentTrack?.title || 'No track selected'}
            </h4>
            <p className="text-white/50 text-sm truncate">
              {currentTrack?.artist || 'Select a track to play'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrev}
            className="w-10 h-10 rounded-full text-white/60 hover:text-white hover:bg-white/10"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            onClick={onToggle}
            disabled={!currentTrack}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="w-10 h-10 rounded-full text-white/60 hover:text-white hover:bg-white/10"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="w-8 h-8 text-white/60 hover:text-white"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[volume * 100]}
            onValueChange={([v]) => {
              onVolumeChange(v / 100);
              if (v > 0) setIsMuted(false);
            }}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-white/40 text-xs w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Playlist */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white/70 text-sm font-medium">Playlist</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 text-xs text-white/60 hover:text-white hover:bg-white/10"
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-1">
            {playlist.map((track, index) => (
              <div
                key={track.id}
                onClick={() => onSelectTrack(index)}
                className={`group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentIndex === index
                    ? 'bg-violet-500/20 border border-violet-500/30'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Track number or playing indicator */}
                <div className="w-6 flex justify-center">
                  {currentIndex === index && isPlaying ? (
                    <div className="flex gap-0.5">
                      <div className="w-1 h-3 bg-violet-400 animate-pulse" />
                      <div className="w-1 h-4 bg-violet-400 animate-pulse delay-75" />
                      <div className="w-1 h-2 bg-violet-400 animate-pulse delay-150" />
                    </div>
                  ) : (
                    <span className={`text-xs ${
                      currentIndex === index ? 'text-violet-400' : 'text-white/30'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${
                    currentIndex === index ? 'text-white' : 'text-white/70'
                  }`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {track.artist}
                  </p>
                </div>

                {/* Remove button for custom tracks */}
                {track.artist === 'Custom' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTrack(track.id);
                    }}
                    className="w-7 h-7 opacity-0 group-hover:opacity-100 text-white/40 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
