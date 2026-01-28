import React, { useState } from 'react';
import { X, Clock, Volume2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { TimerSettings } from '@/types';

interface SettingsProps {
  settings: TimerSettings;
  onUpdateSettings: (settings: TimerSettings) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const updateSetting = <K extends keyof TimerSettings>(
    key: K,
    value: TimerSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const formatMinutes = (seconds: number) => `${Math.floor(seconds / 60)} min`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/30 to-gray-600/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-300" />
          </div>
          <h3 className="text-white font-semibold">Timer Settings</h3>
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

      <div className="space-y-6">
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
            onValueChange={([v]) => updateSetting('workDuration', v * 60)}
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
            onValueChange={([v]) => updateSetting('shortBreakDuration', v * 60)}
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
            onValueChange={([v]) => updateSetting('longBreakDuration', v * 60)}
            min={5}
            max={45}
            step={5}
          />
        </div>

        {/* Sessions before long break */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white/70 text-sm">Sessions Before Long Break</label>
            <span className="text-white text-sm font-medium">
              {localSettings.sessionsBeforeLongBreak}
            </span>
          </div>
          <Slider
            value={[localSettings.sessionsBeforeLongBreak]}
            onValueChange={([v]) => updateSetting('sessionsBeforeLongBreak', v)}
            min={2}
            max={8}
            step={1}
          />
        </div>

        {/* Auto-start options */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-white/50" />
              <span className="text-white/70 text-sm">Auto-start Breaks</span>
            </div>
            <Switch
              checked={localSettings.autoStartBreaks}
              onCheckedChange={(v) => updateSetting('autoStartBreaks', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-white/50" />
              <span className="text-white/70 text-sm">Auto-start Focus</span>
            </div>
            <Switch
              checked={localSettings.autoStartPomodoros}
              onCheckedChange={(v) => updateSetting('autoStartPomodoros', v)}
            />
          </div>
        </div>
      </div>

      {/* Reset button */}
      <div className="mt-auto pt-6">
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
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};
