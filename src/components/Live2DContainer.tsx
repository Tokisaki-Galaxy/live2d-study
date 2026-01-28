import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';
import { Live2DLoader } from '@/lib/live2d-loader';
import type { CharacterConfig, CharacterMood } from '@/types';

// Expose PIXI for the library
(window as any).PIXI = PIXI;
Live2DModel.registerTicker(PIXI.Ticker.shared as any);

interface Live2DContainerProps {
  config: CharacterConfig;
  mood: CharacterMood;
  className?: string;
}

export const Live2DContainer: React.FC<Live2DContainerProps> = ({
  config,
  mood,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);
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

    // Interaction handling (Look at mouse)
    const handleMouseMove = (event: MouseEvent) => {
      if (modelRef.current) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (event.clientX - rect.left) / rect.width * 2 - 1;
          const y = (event.clientY - rect.top) / rect.height * 2 - 1;
          modelRef.current.focus(x, y);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
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
      if (modelRef.current) {
        appRef.current.stage.removeChild(modelRef.current as any);
        modelRef.current.destroy();
        modelRef.current = null;
      }
      
      // Don't try loading if we have nothing
      if (config.modelSourceType === 'zip' && !config.modelData) return;
      if (config.modelSourceType === 'url' && !config.modelUrl) return;

      setLoading(true);
      setError(null);

      try {
        let model: Live2DModel | null = null;
        console.log('Loading Live2D Model...', config.modelSourceType);

        if (config.modelSourceType === 'zip' && config.modelData) {
          // Fetch the blob from the Blob URL string (config.modelData is string URL)
          const response = await fetch(config.modelData);
          const blob = await response.blob();
          model = await Live2DLoader.loadModelFromZip(blob);
        } else if (config.modelSourceType === 'url' && config.modelUrl) {
          model = await Live2DModel.from(config.modelUrl);
        }

        if (active && model && appRef.current) {
          appRef.current.stage.addChild(model as any);
          modelRef.current = model;
          
          // Apply transforms
          // Center the model roughly
          model.position.set(400, 400); // Center of 800x800 canvas
          model.anchor.set(0.5, 0.5);
          model.scale.set(config.scale);
          
          // Initial motion
          playMoodMotion(mood); // Play initial mood
        }
      } catch (err) {
        console.error('Failed to load model:', err);
        if (active) setError('Failed to load model. Please check the file format.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadModel();

    return () => {
      active = false;
    };
  }, [config.modelUrl, config.modelData, config.modelSourceType, config.scale]); 

  // Handle Mood Changes -> Play Animation
  useEffect(() => {
    playMoodMotion(mood);
  }, [mood]);

  const playMoodMotion = (currentMood: CharacterMood) => {
    if (!modelRef.current || !config.motionMapping) return;

    let motionGroup = 'Idle';
    
    // Map mood to user-defined motion group
    switch (currentMood) {
      case 'happy': 
        motionGroup = config.motionMapping.idle || 'Idle'; 
        break;
      case 'focus': 
        motionGroup = config.motionMapping.focus || 'Focus'; 
        break;
      case 'sleep': 
        motionGroup = config.motionMapping.sleep || 'Sleep'; 
        break;
      case 'encourage': 
        motionGroup = config.motionMapping.tap || 'TapBody'; 
        break;
    }

    // Try to play the motion
    // pixi-live2d-display uses internal motion manager
    // We can try to force start a motion
    try {
        // Force priority to ensure it interrupts
        modelRef.current.motion(motionGroup, 0, 3); 
    } catch (e) {
        console.warn(`Motion group ${motionGroup} not found in model`);
    }
  };

  return (
    <div className={`relative ${className}`}>
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                Loading Model...
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
