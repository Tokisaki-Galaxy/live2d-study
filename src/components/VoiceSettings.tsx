import React, { useState } from "react";
import { X, Volume2, Mic, MessageSquare, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTTSContext } from "@/contexts/TTSContext";

interface VoiceSettingsProps {
  onClose: () => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ onClose }) => {
  const tts = useTTSContext();
  const [previewText, setPreviewText] = useState(
    "Hello! This is a preview of the selected voice."
  );

  // Group voices by language
  const groupedVoices = tts.voices.reduce(
    (acc, voice) => {
      const langCode = voice.lang.split("-")[0];
      if (!acc[langCode]) {
        acc[langCode] = [];
      }
      acc[langCode].push(voice);
      return acc;
    },
    {} as Record<string, typeof tts.voices>
  );

  const handlePreview = () => {
    if (tts.isSpeaking) {
      tts.stop();
    } else {
      tts.preview(previewText);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-600/30 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-purple-300" />
          </div>
          <h3 className="text-white font-semibold">Voice Settings</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white/50 hover:text-white"
          aria-label="Close voice settings"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto -mr-4 pr-4 space-y-6">
        {/* Browser TTS not supported warning */}
        {!tts.isSupported && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-200 text-sm">
              ⚠️ <strong>Not Supported:</strong> Your browser does not support
              the Web Speech API. Please try using a modern browser like Chrome,
              Edge, or Safari.
            </p>
          </div>
        )}

        {/* TTS Voice Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-white/70" />
            <h4 className="text-white font-medium">Text-to-Speech (TTS)</h4>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm mb-4">
              Configure text-to-speech voice for character dialogue
            </p>

            <div className="space-y-4">
              {/* Enable TTS Toggle */}
              <div className="flex items-center justify-between p-3 rounded bg-white/5">
                <div>
                  <p className="text-white text-sm font-medium">Enable TTS</p>
                  <p className="text-white/40 text-xs mt-1">
                    Speak character messages aloud
                  </p>
                </div>
                <Switch
                  checked={tts.settings.enabled}
                  onCheckedChange={(checked) =>
                    tts.updateSettings({ enabled: checked })
                  }
                  disabled={!tts.isSupported}
                />
              </div>

              {/* Voice Selection */}
              <div className="p-3 rounded bg-white/5">
                <p className="text-white text-sm font-medium mb-2">
                  Voice Selection
                </p>
                <p className="text-white/40 text-xs mb-3">
                  Choose from available voices and languages
                </p>
                <Select
                  value={tts.settings.voiceURI}
                  onValueChange={(value) =>
                    tts.updateSettings({ voiceURI: value })
                  }
                  disabled={!tts.isSupported || tts.voices.length === 0}
                >
                  <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20 max-h-60">
                    {Object.entries(groupedVoices).map(([langCode, voices]) => (
                      <React.Fragment key={langCode}>
                        <div className="px-2 py-1.5 text-xs text-white/40 font-medium uppercase">
                          {langCode}
                        </div>
                        {voices.map((voice) => (
                          <SelectItem
                            key={voice.voiceURI}
                            value={voice.voiceURI}
                            className="text-white hover:bg-white/10"
                          >
                            {voice.name}
                            {voice.localService && (
                              <span className="ml-2 text-xs text-white/40">
                                (Local)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Parameters */}
              <div className="p-3 rounded bg-white/5 space-y-4">
                <div>
                  <p className="text-white text-sm font-medium mb-2">
                    Voice Parameters
                  </p>
                  <p className="text-white/40 text-xs">
                    Adjust speed, pitch, and volume of TTS output
                  </p>
                </div>

                {/* Speed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/70 text-xs">Speed</label>
                    <span className="text-white/50 text-xs">
                      {tts.settings.rate.toFixed(1)}x
                    </span>
                  </div>
                  <Slider
                    value={[tts.settings.rate]}
                    onValueChange={([value]) =>
                      tts.updateSettings({ rate: value })
                    }
                    min={0.5}
                    max={2}
                    step={0.1}
                    disabled={!tts.isSupported}
                    className="w-full"
                  />
                </div>

                {/* Pitch */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/70 text-xs">Pitch</label>
                    <span className="text-white/50 text-xs">
                      {tts.settings.pitch.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[tts.settings.pitch]}
                    onValueChange={([value]) =>
                      tts.updateSettings({ pitch: value })
                    }
                    min={0.5}
                    max={2}
                    step={0.1}
                    disabled={!tts.isSupported}
                    className="w-full"
                  />
                </div>

                {/* Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/70 text-xs">Volume</label>
                    <span className="text-white/50 text-xs">
                      {Math.round(tts.settings.volume * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[tts.settings.volume]}
                    onValueChange={([value]) =>
                      tts.updateSettings({ volume: value })
                    }
                    min={0}
                    max={1}
                    step={0.05}
                    disabled={!tts.isSupported}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Preview & Test */}
              <div className="p-3 rounded bg-white/5">
                <p className="text-white text-sm font-medium mb-2">
                  Preview & Test
                </p>
                <p className="text-white/40 text-xs mb-3">
                  Test TTS with sample text to hear the voice
                </p>
                <div className="space-y-3">
                  <textarea
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Enter text to preview..."
                    className="w-full h-20 p-2 rounded bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-white/40"
                    disabled={!tts.isSupported}
                  />
                  <Button
                    onClick={handlePreview}
                    disabled={!tts.isSupported || !previewText.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {tts.isSpeaking ? (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Stop Preview
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Preview Voice
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* AI Model Voice Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white/70" />
            <h4 className="text-white font-medium">AI Model Voice</h4>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm mb-3">
              Configure AI-powered voice synthesis for natural conversations
            </p>

            {/* Placeholder for future AI Voice features */}
            <div className="space-y-3">
              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">
                  Coming Soon
                </p>
                <p className="text-white/50 text-sm">AI Model Selection</p>
                <p className="text-white/30 text-xs mt-1">
                  Choose AI voice model (e.g., OpenAI TTS, ElevenLabs, Azure
                  Neural)
                </p>
              </div>

              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">
                  Coming Soon
                </p>
                <p className="text-white/50 text-sm">Voice Character</p>
                <p className="text-white/30 text-xs mt-1">
                  Select or create custom voice character profiles
                </p>
              </div>

              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">
                  Coming Soon
                </p>
                <p className="text-white/50 text-sm">Emotion & Style</p>
                <p className="text-white/30 text-xs mt-1">
                  Configure emotional tone and speaking style (cheerful, calm,
                  energetic)
                </p>
              </div>

              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">
                  Coming Soon
                </p>
                <p className="text-white/50 text-sm">API Configuration</p>
                <p className="text-white/30 text-xs mt-1">
                  Set up API keys and endpoint configuration for AI services
                </p>
              </div>

              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">
                  Coming Soon
                </p>
                <p className="text-white/50 text-sm">Voice Cloning</p>
                <p className="text-white/30 text-xs mt-1">
                  Upload voice samples for custom voice cloning (if supported)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-blue-200 text-sm">
            💡 <strong>Tip:</strong> Browser TTS is now available! Enable TTS
            above to have your character speak their messages. Sound effects
            will always have priority over TTS voice.
          </p>
        </div>
      </div>
    </div>
  );
};
