import type { AIModel, ModelCapability, ModelTier } from '../types/chat';
import { DEFAULT_MODELS } from '../constants/models';

export interface RawAiStudioModel {
  name: string; // "models/gemini-2.5-flash"
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

// Models the chat UI cannot drive: music, agents, speech-to-text, realtime, robotics, embeddings.
const UNSUPPORTED =
  /lyria|deep-research|antigravity|robotics|computer-use|transcribe|embedding|aqa|live|native-audio|customtools/;

// Redundant aliases, older point-releases, and duplicate preview variants returned by /v1beta/models
// that clutter the selector with identical capabilities. Users can still add any specific ID via "Add Model ID".
const REDUNDANT_AISTUDIO_IDS = new Set([
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-pro-latest',
  'gemini-2.5-pro', // discontinued on free tier for new accounts; 3.1-pro-preview is the active Pro
  'gemini-2.5-flash-lite', // superseded by gemini-3.5-flash-lite
  'gemini-2.5-flash-preview-tts', // superseded by gemini-3.8-flash-tts
  'gemini-2.5-pro-preview-tts',
  'gemini-3-flash-preview', // superseded by gemini-3.8-flash
  'gemini-3.5-flash', // superseded by gemini-3.8-flash
  'gemini-3.6-flash', // intermediate point release
  'gemini-3.7-flash', // intermediate point release
  'gemini-3.1-flash-lite', // superseded by gemini-3.5-flash-lite
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-flash-tts-preview', // superseded by gemini-3.8-flash-tts
  'gemini-3.8-flash-lite-tts', // redundant with gemini-3.8-flash-tts
  'gemini-3-pro-image-preview', // duplicate of gemini-3-pro-image
  'nano-banana-pro-preview', // duplicate alias of gemini-3-pro-image
  'gemini-3.1-flash-image-preview', // duplicate of gemini-3.1-flash-image
  'gemini-3.1-flash-image', // superseded by gemini-nano-banana-2.1
  'gemini-3.1-flash-lite-image',
  'gemini-omni-flash-preview', // superseded by gemini-omni-1.2-flash
  'gemini-omni-1.1-flash', // superseded by gemini-omni-1.2-flash
  'gemma-4-26b-a4b-it', // keep gemma-4-31b-it as the single Gemma 4 representative
]);

const detectCapability = (id: string): ModelCapability => {
  if (/tts/.test(id)) return 'TTS';
  if (/image|nano-banana/.test(id)) return 'IMAGE';
  return 'CHAT';
};

const inferMetadata = (
  id: string,
  capability: ModelCapability
): Pick<AIModel, 'tier' | 'badge' | 'speed' | 'intelligence' | 'bestFor' | 'description' | 'note'> => {
  if (capability === 'TTS') {
    return {
      tier: 'TTS',
      badge: 'Giọng nói TTS',
      speed: 'Nhanh',
      intelligence: 'Chuyên biệt Audio',
      bestFor: 'Chuyển văn bản thành giọng đọc tự nhiên',
      description: 'Model tổng hợp giọng nói từ văn bản (Text-to-Speech).',
    };
  }
  if (capability === 'IMAGE') {
    if (/pro-image/.test(id)) {
      return {
        tier: 'IMAGE',
        badge: 'Ảnh Chất lượng cao',
        speed: 'Trung bình',
        intelligence: 'Chuyên biệt Ảnh Pro',
        bestFor: 'Vẽ ảnh chi tiết cao, bố cục phức tạp và ánh sáng nghệ thuật',
        description: 'Phiên bản Nano Banana Pro tạo ảnh độ chi tiết cao hơn bản tiêu chuẩn.',
      };
    }
    return {
      tier: 'IMAGE',
      badge: 'Tạo Ảnh Nhanh',
      speed: 'Nhanh',
      intelligence: 'Chuyên biệt Ảnh',
      bestFor: 'Tạo và chỉnh sửa hình ảnh nhanh từ mô tả văn bản',
      description: 'Thế hệ Nano Banana 2.1 tạo và biến đổi hình ảnh tốc độ cao.',
    };
  }
  if (/lite/.test(id)) {
    return {
      tier: 'LITE',
      badge: 'Siêu tốc • Lite',
      speed: 'Tức thì',
      intelligence: 'Tiêu chuẩn',
      bestFor: 'Tóm tắt nhanh, dịch thuật, phân loại văn bản tức thì',
      description: 'Model rút gọn phản hồi tức thì, tiết kiệm hạn mức.',
    };
  }
  if (/pro|argon/.test(id)) {
    return {
      tier: 'REASONING',
      badge: 'Suy luận sâu',
      speed: 'Trung bình',
      intelligence: 'Chuyên sâu',
      bestFor: 'Bài toán phức tạp, kiến trúc hệ thống, phân tích chuyên sâu',
      description: 'Model chuyên suy luận nhiều bước cho tác vụ kỹ thuật khó.',
    };
  }
  if (/gemma/.test(id)) {
    return {
      tier: 'LITE',
      badge: 'Open Model • 31B',
      speed: 'Nhanh',
      intelligence: 'Tiêu chuẩn',
      bestFor: 'Chạy thử nghiệm mô hình mở Gemma 4 31B gọn nhẹ, hạn mức thoải mái',
      description: 'Mô hình mở Gemma 4 31B Instruct của Google, phù hợp hỏi đáp & viết lách nhẹ.',
    };
  }
  if (/omni/.test(id)) {
    return {
      tier: 'DAILY',
      badge: 'Đa phương thức Omni',
      speed: 'Nhanh',
      intelligence: 'Cao',
      bestFor: 'Hội thoại đa phương thức tổng hợp (văn bản + hình ảnh)',
      description: 'Nhánh Gemini Omni 1.2 tối ưu cho hiểu ngữ cảnh đa phương thức.',
    };
  }
  const tier: ModelTier = 'DAILY';
  return {
    tier,
    badge: 'Đa dụng • Flash',
    speed: 'Nhanh',
    intelligence: 'Cao',
    bestFor: 'Hội thoại hàng ngày, lập trình và xử lý văn bản',
  };
};

export const toAiStudioModel = (raw: RawAiStudioModel): AIModel | null => {
  const id = raw.name.replace(/^models\//, '');
  if (
    !raw.supportedGenerationMethods?.includes('generateContent') ||
    UNSUPPORTED.test(id) ||
    REDUNDANT_AISTUDIO_IDS.has(id)
  ) {
    return null;
  }
  const capability = detectCapability(id);
  const known = DEFAULT_MODELS.find((m) => m.id === id);
  const inferred = inferMetadata(id, capability);

  return {
    id,
    name: known?.name ?? raw.displayName ?? id,
    capability,
    tier: known?.tier ?? inferred.tier,
    badge: known?.badge ?? inferred.badge,
    speed: known?.speed ?? inferred.speed,
    intelligence: known?.intelligence ?? inferred.intelligence,
    bestFor: known?.bestFor ?? inferred.bestFor,
    description: known?.description ?? inferred.description ?? raw.description?.slice(0, 140),
    note: known?.note ?? inferred.note,
    providers: ['aistudio'],
  };
};

