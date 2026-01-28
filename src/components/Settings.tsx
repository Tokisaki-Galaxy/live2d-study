import React, { useState, useRef } from "react";
import { X, Clock, Upload, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TimerSettings, CharacterConfig } from "@/types";

interface SettingsProps {
  settings: TimerSettings;
  characterConfig: CharacterConfig; // New prop
  onUpdateSettings: (settings: TimerSettings) => void;
  onUpdateCharacterConfig: (config: CharacterConfig) => void; // New prop
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  characterConfig,
  onUpdateSettings,
  onUpdateCharacterConfig,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [localCharConfig, setLocalCharConfig] = useState(characterConfig);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = <K extends keyof TimerSettings>(
    key: K,
    value: TimerSettings[K],
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const updateCharConfig = (updates: Partial<CharacterConfig>) => {
    const newConfig = { ...localCharConfig, ...updates };
    setLocalCharConfig(newConfig);
    onUpdateCharacterConfig(newConfig);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a blob URL for the zip
    const blobUrl = URL.createObjectURL(file);

    updateCharConfig({
      modelData: blobUrl,
      modelSourceType: "zip",
      type: "live2d",
    });
  };

  const handleUrlChange = (url: string) => {
    updateCharConfig({
      modelUrl: url,
      modelSourceType: "url",
    });
  };

  const formatMinutes = (seconds: number) => `${Math.floor(seconds / 60)} min`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/30 to-gray-600/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-300" />
          </div>
          <h3 className="text-white font-semibold">Settings</h3>
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

      <Tabs
        defaultValue="timer"
        className="w-full flex-1 flex flex-col min-h-0"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 shrink-0">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="character">Character</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto -mr-4 pr-4">
          <TabsContent value="timer" className="space-y-6 mt-0">
            {/* Work Duration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-sm">Focus Duration</label>
                <span className="text-white text-sm font-medium">
                  {formatMinutes(localSettings.workDuration)}
                </span>
              </div>
              <Slider
                value={[localSettings.workDuration / 60]}
                onValueChange={([v]) => updateSetting("workDuration", v * 60)}
                min={5}
                max={60}
                step={5}
              />
            </div>

            {/* Short Break Duration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-sm">Short Break</label>
                <span className="text-white text-sm font-medium">
                  {formatMinutes(localSettings.shortBreakDuration)}
                </span>
              </div>
              <Slider
                value={[localSettings.shortBreakDuration / 60]}
                onValueChange={([v]) =>
                  updateSetting("shortBreakDuration", v * 60)
                }
                min={1}
                max={15}
                step={1}
              />
            </div>

            {/* Long Break Duration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-sm">Long Break</label>
                <span className="text-white text-sm font-medium">
                  {formatMinutes(localSettings.longBreakDuration)}
                </span>
              </div>
              <Slider
                value={[localSettings.longBreakDuration / 60]}
                onValueChange={([v]) =>
                  updateSetting("longBreakDuration", v * 60)
                }
                min={5}
                max={45}
                step={5}
              />
            </div>

            {/* Sessions before long break */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-sm">
                  Sessions Before Long Break
                </label>
                <span className="text-white text-sm font-medium">
                  {localSettings.sessionsBeforeLongBreak}
                </span>
              </div>
              <Slider
                value={[localSettings.sessionsBeforeLongBreak]}
                onValueChange={([v]) =>
                  updateSetting("sessionsBeforeLongBreak", v)
                }
                min={2}
                max={8}
                step={1}
              />
            </div>

            {/* Auto Start Options */}
            <div className="flex items-center justify-between">
              <label className="text-white/70 text-sm">Auto-start Breaks</label>
              <Switch
                checked={localSettings.autoStartBreaks}
                onCheckedChange={(c) => updateSetting("autoStartBreaks", c)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-white/70 text-sm">Auto-start Focus</label>
              <Switch
                checked={localSettings.autoStartPomodoros}
                onCheckedChange={(c) => updateSetting("autoStartPomodoros", c)}
              />
            </div>

            {/* Reset button */}
            <div className="pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  const defaultSettings = {
                    workDuration: 25 * 60,
                    shortBreakDuration: 5 * 60,
                    longBreakDuration: 15 * 60,
                    sessionsBeforeLongBreak: 4,
                    autoStartBreaks: false,
                    autoStartPomodoros: false,
                  };
                  setLocalSettings(defaultSettings);
                  onUpdateSettings(defaultSettings);
                }}
                className="w-full border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              >
                Reset Timer Defaults
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="character" className="space-y-6 mt-0">
            {/* Character Type Switch */}
            <div className="space-y-3">
              <Label className="text-white">Character Model Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={
                    localCharConfig.type === "svg" ? "default" : "secondary"
                  }
                  onClick={() => updateCharConfig({ type: "svg" })}
                  className="flex-1"
                >
                  Original
                </Button>
                <Button
                  variant={
                    localCharConfig.type === "live2d" ? "default" : "secondary"
                  }
                  onClick={() => updateCharConfig({ type: "live2d" })}
                  className="flex-1"
                >
                  Live2D
                </Button>
                <Button
                  variant={
                    localCharConfig.type === "spine" ? "default" : "secondary"
                  }
                  onClick={() => updateCharConfig({ type: "spine" })}
                  className="flex-1"
                >
                  Spine
                </Button>
              </div>
            </div>

            {(localCharConfig.type === "live2d" ||
              localCharConfig.type === "spine") && (
              <>
                {/* Import Model */}
                <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <Label className="text-white flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Import Model
                  </Label>

                  <div className="grid grid-cols-1 gap-3">
                    {localCharConfig.type === "live2d" && (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Paste .model3.json URL"
                          value={localCharConfig.modelUrl || ""}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          onPointerDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="bg-black/20 border-white/10 text-xs relative z-50 pointer-events-auto"
                        />
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept={
                          localCharConfig.type === "live2d"
                            ? ".zip,.lpk"
                            : ".zip"
                        }
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        className="w-full border-dashed border-white/20 hover:bg-white/5"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {localCharConfig.type === "live2d"
                          ? "Select .zip / .lpk"
                          : "Select Spine .zip"}
                      </Button>
                      <p className="text-[10px] text-white/30 mt-1 text-center">
                        {localCharConfig.type === "live2d"
                          ? "Supported: Standard Live2D Zip or Live2DViewerEX LPK (Non-encrypted)"
                          : "Supported: Spine zip with .json/.skel, .atlas, and texture files"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transform Settings */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white/70 text-sm flex items-center gap-2">
                        <Move className="w-3 h-3" /> Scale
                      </label>
                      <span className="text-white text-sm font-medium">
                        x{localCharConfig.scale.toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      value={[localCharConfig.scale]}
                      onValueChange={([v]) => updateCharConfig({ scale: v })}
                      min={0.1}
                      max={2.0}
                      step={0.1}
                    />
                  </div>

                  {/* Position X */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white/70 text-sm flex items-center gap-2">
                        <Move className="w-3 h-3 rotate-90" /> Position X
                      </label>
                      <span className="text-white text-sm font-medium">
                        {localCharConfig.position?.x || 0}
                      </span>
                    </div>
                    <Slider
                      value={[localCharConfig.position?.x || 0]}
                      onValueChange={([v]) =>
                        updateCharConfig({
                          position: { ...localCharConfig.position, x: v },
                        })
                      }
                      min={-400}
                      max={400}
                      step={10}
                    />
                  </div>

                  {/* Position Y */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white/70 text-sm flex items-center gap-2">
                        <Move className="w-3 h-3" /> Position Y
                      </label>
                      <span className="text-white text-sm font-medium">
                        {localCharConfig.position?.y || 0}
                      </span>
                    </div>
                    <Slider
                      value={[localCharConfig.position?.y || 0]}
                      onValueChange={([v]) =>
                        updateCharConfig({
                          position: { ...localCharConfig.position, y: v },
                        })
                      }
                      min={-400}
                      max={400}
                      step={10}
                    />
                  </div>
                </div>

                {/* Motion Mapping (Simple) */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <Label className="text-white text-sm">
                    {localCharConfig.type === "spine" ? "Animation" : "Motion"}{" "}
                    Mapping Name
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/50 uppercase">
                        Idle
                      </span>
                      <Input
                        className="h-7 text-xs bg-black/20 relative z-50 pointer-events-auto"
                        value={localCharConfig.motionMapping.idle}
                        onChange={(e) =>
                          updateCharConfig({
                            motionMapping: {
                              ...localCharConfig.motionMapping,
                              idle: e.target.value,
                            },
                          })
                        }
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/50 uppercase">
                        Focus
                      </span>
                      <Input
                        className="h-7 text-xs bg-black/20 relative z-50 pointer-events-auto"
                        value={localCharConfig.motionMapping.focus}
                        onChange={(e) =>
                          updateCharConfig({
                            motionMapping: {
                              ...localCharConfig.motionMapping,
                              focus: e.target.value,
                            },
                          })
                        }
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/50 uppercase">
                        Sleep
                      </span>
                      <Input
                        className="h-7 text-xs bg-black/20 relative z-50 pointer-events-auto"
                        value={localCharConfig.motionMapping.sleep}
                        onChange={(e) =>
                          updateCharConfig({
                            motionMapping: {
                              ...localCharConfig.motionMapping,
                              sleep: e.target.value,
                            },
                          })
                        }
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/50 uppercase">
                        Encourage
                      </span>
                      <Input
                        className="h-7 text-xs bg-black/20 relative z-50 pointer-events-auto"
                        value={localCharConfig.motionMapping.tap}
                        onChange={(e) =>
                          updateCharConfig({
                            motionMapping: {
                              ...localCharConfig.motionMapping,
                              tap: e.target.value,
                            },
                          })
                        }
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
