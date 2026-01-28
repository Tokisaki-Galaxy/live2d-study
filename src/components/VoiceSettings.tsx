import React from 'react';
import { X, Volume2, Mic, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface VoiceSettingsProps {
  onClose: () => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ onClose }) => {
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
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto -mr-4 pr-4 space-y-6">
        {/* TTS Voice Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-white/70" />
            <h4 className="text-white font-medium">Text-to-Speech (TTS)</h4>
          </div>
          
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm mb-3">
              Configure text-to-speech voice for character dialogue
            </p>
            
            {/* TODO Placeholders */}
            <div className="space-y-3">
              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">TODO</p>
                <p className="text-white/50 text-sm">Voice Provider Selection</p>
                <p className="text-white/30 text-xs mt-1">
                  Select from various TTS providers (e.g., Google TTS, Azure, Amazon Polly)
                </p>
              </div>
              
              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">TODO</p>
                <p className="text-white/50 text-sm">Voice Selection</p>
                <p className="text-white/30 text-xs mt-1">
                  Choose from available voices, languages, and accents
                </p>
              </div>
              
              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">TODO</p>
                <p className="text-white/50 text-sm">Voice Parameters</p>
                <p className="text-white/30 text-xs mt-1">
                  Adjust speed, pitch, and volume of TTS output
                </p>
              </div>

              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">TODO</p>
                <p className="text-white/50 text-sm">Preview & Test</p>
                <p className="text-white/30 text-xs mt-1">
                  Test TTS with sample text to hear the voice
                </p>
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
            
            {/* TODO Placeholders */}
            <div className="space-y-3">
              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">TODO</p>
                <p className="text-white/50 text-sm">AI Model Selection</p>
                <p className="text-white/30 text-xs mt-1">
                  Choose AI voice model (e.g., OpenAI TTS, ElevenLabs, Azure Neural)
                </p>
              </div>
              
              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">TODO</p>
                <p className="text-white/50 text-sm">Voice Character</p>
                <p className="text-white/30 text-xs mt-1">
                  Select or create custom voice character profiles
                </p>
              </div>
              
              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">TODO</p>
                <p className="text-white/50 text-sm">Emotion & Style</p>
                <p className="text-white/30 text-xs mt-1">
                  Configure emotional tone and speaking style (cheerful, calm, energetic)
                </p>
              </div>

              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">TODO</p>
                <p className="text-white/50 text-sm">API Configuration</p>
                <p className="text-white/30 text-xs mt-1">
                  Set up API keys and endpoint configuration for AI services
                </p>
              </div>

              <div className="p-3 rounded bg-white/5 border border-dashed border-white/20">
                <p className="text-white/40 text-xs uppercase font-medium mb-1">TODO</p>
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
            💡 <strong>Coming Soon:</strong> Voice features are currently under development. 
            These settings will allow you to customize how your character speaks!
          </p>
        </div>
      </div>
    </div>
  );
};
