import type { AIModel, ModelCapability } from '../types/chat';
import { DEFAULT_MODELS } from '../constants/models';

export interface RawAiStudioModel {
  name: string; // "models/gemini-2.5-flash"
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

// Models the chat UI cannot drive: music, agents, speech-to-text, realtime, robotics, embeddings.
const UNSUPPORTED = /lyria|deep-research|antigravity|robotics|computer-use|transcribe|embedding|aqa|live|native-audio|customtools/;

const detectCapability = (id: string): ModelCapability => {
  if (/tts/.test(id)) return 'TTS';
  if (/image|nano-banana/.test(id)) return 'IMAGE';
  return 'CHAT';
};

export const toAiStudioModel = (raw: RawAiStudioModel): AIModel | null => {
  const id = raw.name.replace(/^models\//, '');
  if (!raw.supportedGenerationMethods?.includes('generateContent') || UNSUPPORTED.test(id)) {
    return null;
  }
  // Hand-written names/descriptions win; anything new falls back to what the API says.
  const known = DEFAULT_MODELS.find((m) => m.id === id);
  return {
    id,
    name: known?.name ?? raw.displayName ?? id,
    capability: detectCapability(id),
    badge: known?.badge,
    description: known?.description ?? raw.description?.slice(0, 140),
    providers: ['aistudio'],
  };
};
