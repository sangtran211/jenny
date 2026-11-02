export type ModelCapability = 'CHAT' | 'IMAGE' | 'VIDEO' | 'TTS';

export interface AIModel {
  id: string;
  name: string;
  capability: ModelCapability;
  description?: string;
  badge?: string;
  isCustom?: boolean;
}

export type MessageRole = 'user' | 'model';

export interface Attachment {
  type: 'image' | 'video' | 'audio';
  url: string; // Base64 data URI or external URL
  mimeType: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  modelId?: string;
  attachments?: Attachment[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  pinned?: boolean;
}

export interface AppSettings {
  customApiKey: string;
  projectId: string;
  systemPrompt: string;
  ttsVoice: string;
  enableStreaming: boolean;
  imageAspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
}

