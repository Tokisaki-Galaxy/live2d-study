import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Spine } from 'pixi-spine';
import { SpineLoader } from '@/lib/spine-loader';
import type { CharacterConfig, CharacterMood } from '@/types';

// Expose PIXI for the library
(window as any).PIXI = PIXI;

interface SpineContainerProps {
  config: CharacterConfig;
  mood: CharacterMood;
  className?: string;
}

export const SpineContainer: React.FC<SpineContainerProps> = ({
  config,
  mood,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const spineRef = useRef<Spine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize PIXI Application
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create PIXI Application with transparent background
    const app = new PIXI.Application({
      view: canvasRef.current,
      autoStart: true,
      backgroundAlpha: 0,
      width: 800,
      height: 800,
      resolution: window.devicePixelRatio || 1,
    });

    appRef.current = app;

    return () => {
      app.destroy(true, { children: true, texture: true, baseTexture: true });
      appRef.current = null;
    };
  }, []);

  // Load Model when config changes
  useEffect(() => {
    let active = true;

    const loadModel = async () => {
      if (!appRef.current || !config) return;
      
      // Clear previous model
      if (spineRef.current) {
        appRef.current.stage.removeChild(spineRef.current as any);
        spineRef.current.destroy({ children: true });
        spineRef.current = null;
      }
      
      // Don't try loading if we have nothing
      if (config.modelSourceType === 'zip' && !config.modelData) return;
      if (config.modelSourceType === 'url' && !config.modelUrl) return;

      setLoading(true);
      setError(null);

      try {
        let spine: Spine | null = null;
        console.log('Loading Spine Model...', config.modelSourceType);

        if (config.modelSourceType === 'zip' && config.modelData) {
          // Fetch the blob from the Blob URL string
          const response = await fetch(config.modelData);
          const blob = await response.blob();
          spine = await SpineLoader.loadSpineFromZip(blob);
        } else if (config.modelSourceType === 'url' && config.modelUrl) {
          // For URL loading, we'd need to implement a different loader
          // For now, show a message that URL is not supported for Spine
          throw new Error('URL loading not yet implemented for Spine models. Please use zip file.');
        }

        if (active && spine && appRef.current) {
          appRef.current.stage.addChild(spine as any);
          spineRef.current = spine;
          
          // Apply transforms
          spine.position.set(400 + (config.position?.x || 0), 400 + (config.position?.y || 0)); 
          spine.scale.set(config.scale);
          
          // Initial animation
          playMoodAnimation(mood);
        }
      } catch (err) {
        console.error('Failed to load Spine model:', err);
        if (active) setError(err instanceof Error ? err.message : 'Failed to load model. Please check the file format.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadModel();

    return () => {
      active = false;
    };
  }, [config.modelUrl, config.modelData, config.modelSourceType]);

  // Apply transforms when config changes
  useEffect(() => {
      if (spineRef.current) {
          spineRef.current.scale.set(config.scale);
          spineRef.current.position.set(400 + (config.position?.x || 0), 400 + (config.position?.y || 0));
      }
  }, [config.scale, config.position?.x, config.position?.y]);

  // Handle Mood Changes -> Play Animation
  useEffect(() => {
    playMoodAnimation(mood);
  }, [mood]);

  const playMoodAnimation = (currentMood: CharacterMood) => {
    if (!spineRef.current || !config.motionMapping) return;

    let animationName = 'idle';
    
    // Map mood to user-defined animation name
    switch (currentMood) {
      case 'happy': 
        animationName = config.motionMapping.idle || 'idle'; 
        break;
      case 'focus': 
        animationName = config.motionMapping.focus || 'focus'; 
        break;
      case 'sleep': 
        animationName = config.motionMapping.sleep || 'sleep'; 
        break;
      case 'encourage': 
        animationName = config.motionMapping.tap || 'tap'; 
        break;
    }

    // Try to play the animation
    try {
      if (spineRef.current.state.hasAnimation(animationName)) {
        spineRef.current.state.setAnimation(0, animationName, true); // Loop
      } else {
        console.warn(`Animation ${animationName} not found in Spine model`);
        // Fallback to first available animation
        const animations = spineRef.current.spineData.animations;
        if (animations.length > 0) {
          spineRef.current.state.setAnimation(0, animations[0].name, true);
        }
      }
    } catch (e) {
      console.warn(`Failed to play animation ${animationName}:`, e);
    }
  };

  return (
    <div className={`relative ${className}`}>
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                Loading Spine Model...
            </div>
        )}
        {error && (
             <div className="absolute inset-0 flex items-center justify-center text-red-400/80 text-xs text-center p-2">
                {error}
            </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
};
