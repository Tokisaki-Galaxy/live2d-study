import { useState, useEffect, useRef, useCallback } from "react";
import type { Track, MusicState } from "@/types";

// Default Lo-Fi tracks (using free music URLs)
const defaultTracks: Track[] = [
  {
    id: "1",
    title: "Midnight Cafe",
    artist: "Lo-Fi Dreams",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 180,
  },
  {
    id: "2",
    title: "Rainy Evening",
    artist: "Chill Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 240,
  },
  {
    id: "3",
    title: "Study Session",
    artist: "Focus Flow",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 200,
  },
  {
    id: "4",
    title: "Coffee Shop Vibes",
    artist: "Ambient Mind",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 220,
  },
  {
    id: "5",
    title: "Late Night Coding",
    artist: "Code & Chill",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: 260,
  },
];

export function useMusic() {
  const [state, setState] = useState<MusicState>({
    isPlaying: false,
    currentTrack: defaultTracks[0],
    volume: 0.5,
    playlist: defaultTracks,
    currentIndex: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.5;

    if (defaultTracks[0]) {
      audio.src = defaultTracks[0].url;
    }

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  // Define nextTrack first so it can be used in the 'ended' handler
  const nextTrack = useCallback(() => {
    setState((prev) => {
      const nextIndex = (prev.currentIndex + 1) % prev.playlist.length;
      const track = prev.playlist[nextIndex];

      if (audioRef.current) {
        audioRef.current.src = track.url;
        if (prev.isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }

      return {
        ...prev,
        currentIndex: nextIndex,
        currentTrack: track,
      };
    });
  }, []);

  // Handle track ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [nextTrack]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
      });
      setState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const prevTrack = useCallback(() => {
    setState((prev) => {
      const prevIndex =
        prev.currentIndex === 0
          ? prev.playlist.length - 1
          : prev.currentIndex - 1;
      const track = prev.playlist[prevIndex];

      if (audioRef.current) {
        audioRef.current.src = track.url;
        if (prev.isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }

      return {
        ...prev,
        currentIndex: prevIndex,
        currentTrack: track,
      };
    });
  }, []);

  const selectTrack = useCallback((index: number) => {
    setState((prev) => {
      const track = prev.playlist[index];

      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play().catch(() => {});
      }

      return {
        ...prev,
        currentIndex: index,
        currentTrack: track,
        isPlaying: true,
      };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume }));
  }, []);

  const addCustomTrack = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const newTrack: Track = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Custom",
      url: url,
      duration: 0,
    };

    setState((prev) => ({
      ...prev,
      playlist: [...prev.playlist, newTrack],
    }));
  }, []);

  const addFolder = useCallback((files: FileList) => {
    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith("audio/"),
    );

    const newTracks: Track[] = audioFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Custom",
      url: URL.createObjectURL(file),
      duration: 0,
    }));

    setState((prev) => ({
      ...prev,
      playlist: [...prev.playlist, ...newTracks],
    }));
  }, []);

  const removeTrack = useCallback((id: string) => {
    setState((prev) => {
      const newPlaylist = prev.playlist.filter((t) => t.id !== id);

      // If removing current track, switch to first track
      if (prev.currentTrack?.id === id && newPlaylist.length > 0) {
        const newTrack = newPlaylist[0];
        if (audioRef.current) {
          audioRef.current.src = newTrack.url;
        }
        return {
          ...prev,
          playlist: newPlaylist,
          currentTrack: newTrack,
          currentIndex: 0,
          isPlaying: false,
        };
      }

      return {
        ...prev,
        playlist: newPlaylist,
      };
    });
  }, []);

  return {
    ...state,
    play,
    pause,
    toggle,
    nextTrack,
    prevTrack,
    selectTrack,
    setVolume,
    addCustomTrack,
    addFolder,
    removeTrack,
  };
}
