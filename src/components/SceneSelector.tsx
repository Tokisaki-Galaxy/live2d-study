import React from "react";
import { Check } from "lucide-react";
import { scenes } from "@/data/scenes";
import type { SceneType } from "@/types";

interface SceneSelectorProps {
  currentScene: SceneType;
  onSceneChange: (scene: SceneType) => void;
}

export const SceneSelector: React.FC<SceneSelectorProps> = ({
  currentScene,
  onSceneChange,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {scenes.map((scene) => (
        <button
          key={scene.id}
          onClick={() => onSceneChange(scene.id)}
          className={`relative group p-4 rounded-xl transition-all duration-300 ${
            currentScene === scene.id
              ? "bg-white/20 ring-2 ring-white/40"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          {/* Scene preview gradient */}
          <div
            className={`absolute inset-0 rounded-xl opacity-30 ${scene.gradient}`}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">{scene.icon}</span>
            <span className="text-white text-sm font-medium">{scene.name}</span>
            <span className="text-white/50 text-xs mt-1 line-clamp-2">
              {scene.description}
            </span>
          </div>

          {/* Selected indicator */}
          {currentScene === scene.id && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
