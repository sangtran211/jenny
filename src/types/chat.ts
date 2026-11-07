export type ModelCapability = 'CHAT' | 'IMAGE' | 'VIDEO' | 'TTS';

export interface AIModel {
  id: string;
  name: string;
  capability: ModelCapability;
  description?: string;
  badge?: string;
  isCustom?: boolean;
  providers?: ApiProvider[]; // which providers offer it; undefined = both
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
  retryable?: boolean; // false on an error message where asking again cannot help
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  pinned?: boolean;
}

export type ApiProvider = 'aistudio' | 'vertex';

export interface Persona {
  id: string;
  name: string;
  systemPrompt: string;
}

export interface AppSettings {
  provider?: ApiProvider; // undefined (settings saved before this field existed) is treated as 'aistudio'
  aiStudioApiKey?: string;
  customApiKey: string;
  projectId: string;
  personaId?: string; // id in PERSONAS, or 'custom' / undefined when the prompt was edited by hand
  systemPrompt: string;
  ttsVoice: string;
  enableStreaming: boolean;
  imageAspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
}

