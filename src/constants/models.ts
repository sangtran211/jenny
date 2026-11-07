import { AIModel, ApiProvider } from '../types/chat';

// Model used when the stored selection is not offered by the current provider.
export const DEFAULT_MODEL_BY_PROVIDER: Record<ApiProvider, string> = {
  aistudio: 'gemini-2.5-flash',
  vertex: 'gemini-3.8-flash',
};

// Built-in list. `providers` limits where a model shows (undefined = both). On AI Studio this is
// only the offline fallback (the live list comes from the API); on Vertex it is the whole list,
// since Vertex cannot list models for an API key. Ids marked "verified" answered a real request
// with the project's key; Garden "Serverless" alone did not guarantee access (2.5-family gave 404).
export const DEFAULT_MODELS: AIModel[] = [
  // ---- Vertex AI ----
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    capability: 'CHAT',
    badge: 'Default • Fast',
    description: 'Flash mới nhất đã kiểm chứng trên Vertex, tốc độ cao cho hội thoại & coding.',
    providers: ['vertex']
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    capability: 'CHAT',
    badge: 'Fast',
    description: 'Bản Flash 3.7, cân bằng tốc độ và chất lượng.',
    providers: ['vertex']
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    capability: 'CHAT',
    badge: 'Fast',
    description: 'Bản Flash 3.5 ổn định.',
    providers: ['vertex']
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    capability: 'CHAT',
    badge: 'Ultra Fast',
    description: 'Siêu nhẹ, phản hồi tức thì cho tóm tắt và dịch thuật.',
    providers: ['vertex']
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    capability: 'CHAT',
    badge: 'Lite',
    description: 'Bản Lite tiết kiệm chi phí.',
    providers: ['vertex']
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    capability: 'CHAT',
    badge: 'New • Chậm/giới hạn',
    description: 'Có trong Model Garden và chạy được trong console, nhưng gọi bằng API key hiện bị treo hoặc 429.',
    providers: ['vertex']
  },
  {
    id: 'veo-3.1-lite-generate-001',
    name: 'Veo 3.1 Lite Video (LRO)',
    capability: 'VIDEO',
    badge: 'Video LRO',
    description: 'Tạo video 16:9 bất đồng bộ (Long-Running Operation) qua Vertex AI. Chưa kiểm chứng.',
    providers: ['vertex']
  },
  {
    id: 'gemini-3.8-flash-tts',
    name: 'Gemini 3.8 Flash TTS',
    capability: 'TTS',
    badge: 'Voice Synthesis',
    description: 'Chuyển văn bản thành giọng nói với các giọng Puck, Aoede, Kore...',
    providers: ['vertex']
  },

  // ---- Both providers ----
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    capability: 'CHAT',
    badge: 'Preview • Fast',
    description: 'Model tốc độ cao, tối ưu cho hội thoại đa phương thức & coding.'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    capability: 'CHAT',
    badge: 'Flagship Reasoning',
    description: 'Suy luận chuyên sâu, kiến trúc hệ thống, phân tích dữ liệu GIS & thuật toán.'
  },
  {
    id: 'gemini-3.1-flash-tts-preview',
    name: 'Gemini 3.1 Flash TTS',
    capability: 'TTS',
    badge: 'Voice Synthesis',
    description: 'Chuyển văn bản thành giọng nói tự nhiên với các giọng đọc Puck, Aoede, Kore...'
  },

  // ---- Google AI Studio (offline fallback; the live list comes from the API) ----
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    capability: 'CHAT',
    badge: 'Default • Balanced',
    description: 'Cân bằng hoàn hảo giữa tốc độ phản hồi và chất lượng suy luận. Model mặc định.',
    providers: ['aistudio']
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    capability: 'CHAT',
    badge: 'Ultra Fast',
    description: 'Siêu nhẹ, phản hồi tức thì cho các tác vụ tóm tắt và dịch thuật.',
    providers: ['aistudio']
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    capability: 'CHAT',
    badge: 'Pro Stable',
    description: 'Model Pro với cửa sổ ngữ cảnh lớn; có thể không còn mở cho tài khoản mới.',
    providers: ['aistudio']
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash (Latest)',
    capability: 'CHAT',
    badge: 'AI Studio • Alias',
    description: 'Luôn trỏ tới bản Flash mới nhất của Google AI Studio (có lúc quá tải, trả 503).',
    providers: ['aistudio']
  },
  {
    id: 'gemini-pro-latest',
    name: 'Gemini Pro (Latest)',
    capability: 'CHAT',
    badge: 'Reasoning • AI Studio',
    description: 'Luôn trỏ tới bản Pro mới nhất, dùng cho suy luận và lập trình phức tạp.',
    providers: ['aistudio']
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    capability: 'IMAGE',
    badge: 'Image Gen',
    description: 'Tạo và biến đổi hình ảnh (Text-to-Image & Image-to-Image).',
    providers: ['aistudio']
  },
];

export const TTS_VOICES = ['Puck', 'Aoede', 'Kore', 'Charon', 'Fenrir'];

export const STARTER_PROMPTS = [
  {
    title: 'Kiến trúc React & MapLibre',
    prompt: 'Thiết kế kiến trúc component React + MapLibre GL hiệu năng cao để hiển thị 50,000 điểm GeoJSON mà không bị giật lag.',
    capability: 'CHAT'
  },
  {
    title: 'Tích hợp MCP Server',
    prompt: 'Viết khung chuẩn cho một Model Context Protocol (MCP) Server bằng TypeScript kết nối cơ sở dữ liệu PostGIS.',
    capability: 'CHAT'
  },
  {
    title: 'Tạo ảnh Concept Atelier',
    prompt: 'Một studio kiến trúc tối giản ngập tràn ánh nắng chiều ấm áp, bàn gỗ sồi đặt bản đồ địa hình 3D, phong cách nhiếp ảnh tạp chí Kinfolk.',
    capability: 'IMAGE'
  },
  {
    title: 'Tạo giọng nói Jenny (TTS)',
    prompt: 'Xin chào! Tôi là Jenny, trợ lý AI cá nhân của bạn. Hôm nay chúng ta sẽ cùng xây dựng dự án tuyệt vời nào?',
    capability: 'TTS'
  }
];

