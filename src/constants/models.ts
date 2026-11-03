import { AIModel } from '../types/chat';

export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash (Latest)',
    capability: 'CHAT',
    badge: 'AI Studio • Alias',
    description: 'Luôn trỏ tới bản Flash mới nhất của Google AI Studio (có lúc quá tải, trả 503).'
  },
  {
    id: 'gemini-pro-latest',
    name: 'Gemini Pro (Latest)',
    capability: 'CHAT',
    badge: 'Reasoning • AI Studio',
    description: 'Luôn trỏ tới bản Pro mới nhất, dùng cho suy luận và lập trình phức tạp.'
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    capability: 'CHAT',
    badge: 'Default • Fast',
    description: 'Model mặc định tốc độ cao, tối ưu cho hội thoại đa phương thức & coding.'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    capability: 'CHAT',
    badge: 'Flagship Reasoning',
    description: 'Suy luận chuyên sâu, kiến trúc hệ thống, phân tích dữ liệu GIS & thuật toán.'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    capability: 'CHAT',
    badge: 'Pro Stable',
    description: 'Model Pro ổn định với cửa sổ ngữ cảnh lớn và độ chính xác cao.'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    capability: 'CHAT',
    badge: 'Default • Balanced',
    description: 'Cân bằng hoàn hảo giữa tốc độ phản hồi và chất lượng suy luận. Model mặc định.'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    capability: 'CHAT',
    badge: 'Ultra Fast',
    description: 'Siêu nhẹ, phản hồi tức thì cho các tác vụ tóm tắt và dịch thuật.'
  },
  {
    id: 'gemini-3.1-flash-image-preview',
    name: 'Gemini 3.1 Flash Image',
    capability: 'IMAGE',
    badge: 'Image Gen',
    description: 'Tạo và biến đổi hình ảnh chất lượng cao (Text-to-Image & Image-to-Image).'
  },
  {
    id: 'imagen-3.0-generate-002',
    name: 'Imagen 3.0 Generate',
    capability: 'IMAGE',
    badge: 'Photoreal',
    description: 'Mô hình chuyên dụng tạo ảnh nghệ thuật và chân thực của Google.'
  },
  {
    id: 'veo-3.1-lite-generate-001',
    name: 'Veo 3.1 Lite Video (LRO)',
    capability: 'VIDEO',
    badge: 'Video LRO',
    description: 'Tạo video 16:9 bất đồng bộ (Long-Running Operation) qua Vertex AI.'
  },
  {
    id: 'veo-3.0-generate-preview',
    name: 'Veo 3.0 Generate Preview',
    capability: 'VIDEO',
    badge: 'Cinema Video',
    description: 'Tạo chuyển động điện ảnh chất lượng cao từ mô tả văn bản.'
  },
  {
    id: 'gemini-3.1-flash-tts-preview',
    name: 'Gemini 3.1 Flash TTS',
    capability: 'TTS',
    badge: 'Voice Synthesis',
    description: 'Chuyển văn bản thành giọng nói tự nhiên với các giọng đọc Puck, Aoede, Kore...'
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

