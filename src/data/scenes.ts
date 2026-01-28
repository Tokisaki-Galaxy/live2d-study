import type { Scene, SceneType } from '@/types';

export const scenes: Scene[] = [
  {
    id: 'cafe',
    name: 'Midnight Cafe',
    description: 'A cozy corner cafe with soft ambient lighting',
    icon: '☕',
    gradient: 'scene-cafe',
  },
  {
    id: 'rain',
    name: 'Rainy Window',
    description: 'Gentle rain tapping against the window',
    icon: '🌧️',
    gradient: 'scene-rain',
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm colors painting the evening sky',
    icon: '🌅',
    gradient: 'scene-sunset',
  },
  {
    id: 'night',
    name: 'Starry Night',
    description: 'Peaceful night under the stars',
    icon: '🌙',
    gradient: 'scene-night',
  },
  {
    id: 'forest',
    name: 'Forest Cabin',
    description: 'Serene woodland retreat',
    icon: '🌲',
    gradient: 'scene-forest',
  },
];

export const getSceneById = (id: SceneType): Scene | undefined => {
  return scenes.find(scene => scene.id === id);
};
