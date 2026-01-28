import React, { useState } from "react";
import {
  X,
  Volume2,
  Mic,
  Bot,
  Play,
  Square,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTTSContext } from "@/contexts/TTSContext";
import { useAIModelContext } from "@/contexts/AIModelContext";

interface VoiceSettingsProps {
  onClose: () => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ onClose }) => {
  const tts = useTTSContext();
  const aiModel = useAIModelContext();
  const [previewText, setPreviewText] = useState(
    "Hello! This is a preview of the selected voice."
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    response?: string;
  } | null>(null);

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

  const handleTestConnection = async () => {
    setTestResult(null);
    const result = await aiModel.testConnection();
    setTestResult(result);
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

      <Tabs defaultValue="tts" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 shrink-0">
          <TabsTrigger value="tts" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            TTS
          </TabsTrigger>
          <TabsTrigger value="ai-model" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Model
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto -mr-4 pr-4">
          {/* TTS Tab */}
          <TabsContent value="tts" className="space-y-6 mt-0">
            {/* Browser TTS not supported warning */}
            {!tts.isSupported && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-200 text-sm">
                  ⚠️ <strong>Not Supported:</strong> Your browser does not
                  support the Web Speech API. Please try using a modern browser
                  like Chrome, Edge, or Safari.
                </p>
              </div>
            )}

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
                  aria-label="Preview text for TTS"
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

            {/* Info Note */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-200 text-sm">
                💡 <strong>Tip:</strong> Browser TTS is now available! Enable
                TTS above to have your character speak their messages. Sound
                effects will always have priority over TTS voice.
              </p>
            </div>
          </TabsContent>

          {/* AI Model Tab */}
          <TabsContent value="ai-model" className="space-y-6 mt-0">
            {/* Enable AI Model Toggle */}
            <div className="flex items-center justify-between p-3 rounded bg-white/5">
              <div>
                <p className="text-white text-sm font-medium">
                  Enable AI Model
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Use LLM to generate character dialogue
                </p>
              </div>
              <Switch
                checked={aiModel.settings.enabled}
                onCheckedChange={(checked) =>
                  aiModel.updateSettings({ enabled: checked })
                }
              />
            </div>

            {/* API Configuration */}
            <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <Label className="text-white flex items-center gap-2">
                <Bot className="w-4 h-4" /> API Configuration
              </Label>
              <p className="text-white/40 text-xs">
                Configure your OpenAI-compatible API endpoint
              </p>

              {/* API Endpoint */}
              <div className="space-y-2">
                <Label className="text-white/70 text-xs">API Endpoint</Label>
                <Input
                  placeholder="https://api.openai.com/v1/chat/completions"
                  value={aiModel.settings.apiEndpoint}
                  onChange={(e) =>
                    aiModel.updateSettings({ apiEndpoint: e.target.value })
                  }
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="bg-black/20 border-white/10 text-white text-xs"
                />
                <p className="text-white/30 text-[10px]">
                  OpenAI-compatible chat completions endpoint
                </p>
              </div>

              {/* Model Name */}
              <div className="space-y-2">
                <Label className="text-white/70 text-xs">Model Name</Label>
                <Input
                  placeholder="gpt-3.5-turbo"
                  value={aiModel.settings.modelName}
                  onChange={(e) =>
                    aiModel.updateSettings({ modelName: e.target.value })
                  }
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="bg-black/20 border-white/10 text-white text-xs"
                />
                <p className="text-white/30 text-[10px]">
                  e.g., gpt-3.5-turbo, gpt-4, claude-3-sonnet, etc.
                </p>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label className="text-white/70 text-xs">API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={aiModel.settings.apiKey}
                    onChange={(e) =>
                      aiModel.updateSettings({ apiKey: e.target.value })
                    }
                    onPointerDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="bg-black/20 border-white/10 text-white text-xs pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-white/50 hover:text-white"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-white/30 text-[10px]">
                  Your API key is stored locally in your browser
                </p>
              </div>
            </div>

            {/* System Prompt */}
            <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <Label className="text-white">Character Personality</Label>
              <p className="text-white/40 text-xs">
                Define how the character should respond and behave
              </p>
              <textarea
                value={aiModel.settings.systemPrompt}
                onChange={(e) =>
                  aiModel.updateSettings({ systemPrompt: e.target.value })
                }
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="You are Momo, a cute and supportive study companion..."
                className="w-full h-32 p-2 rounded bg-black/20 border border-white/10 text-white text-xs placeholder:text-white/30 resize-none focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Test Connection */}
            <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <Label className="text-white">Test Connection</Label>
              <p className="text-white/40 text-xs">
                Verify your API configuration is working correctly
              </p>

              <Button
                onClick={handleTestConnection}
                disabled={
                  aiModel.isLoading ||
                  !aiModel.settings.apiKey ||
                  !aiModel.settings.apiEndpoint
                }
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {aiModel.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>

              {/* Test Result */}
              {testResult && (
                <div
                  className={`p-3 rounded ${
                    testResult.success
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <p
                      className={`text-sm font-medium ${
                        testResult.success
                          ? "text-emerald-200"
                          : "text-red-200"
                      }`}
                    >
                      {testResult.message}
                    </p>
                  </div>
                  {testResult.response && (
                    <p className="text-white/60 text-xs mt-2 italic">
                      &quot;{testResult.response}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-200 text-sm">
                💡 <strong>Tip:</strong> When AI Model is enabled, the character
                will use your LLM to generate contextual messages based on your
                current tasks, timer status, and session progress.
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
