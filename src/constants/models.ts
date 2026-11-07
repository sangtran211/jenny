import { AIModel, ApiProvider, ModelTier } from '../types/chat';

export const DEFAULT_PROVIDER: ApiProvider = 'vertex';

// Model used when the stored selection is not offered by the current provider.
export const DEFAULT_MODEL_BY_PROVIDER: Record<ApiProvider, string> = {
  vertex: 'gemini-3.8-flash',
  aistudio: 'gemini-2.5-flash',
};

export interface ModelTierMeta {
  tier: ModelTier;
  label: string;
  shortLabel: string;
  subtitle: string;
}

// Phân nhóm theo mục đích sử dụng & cấp độ để người dùng dễ so sánh và chọn đúng model.
export const MODEL_TIER_GROUPS: ModelTierMeta[] = [
  {
    tier: 'DAILY',
    label: '1. Đa dụng & Tốc độ cao (Flash Chủ lực)',
    shortLabel: 'Đa dụng • Flash',
    subtitle: 'Khuyên dùng cho 90% công việc: chat hàng ngày, viết code, phân tích tài liệu nhanh & chính xác.',
  },
  {
    tier: 'REASONING',
    label: '2. Suy luận Chuyên sâu & Kiến trúc (Pro / Thế hệ 4)',
    shortLabel: 'Suy luận sâu',
    subtitle: 'Dành cho bài toán khó, thiết kế hệ thống lớn, thuật toán phức tạp cần suy nghĩ sâu (chậm hơn Flash).',
  },
  {
    tier: 'LITE',
    label: '3. Phản hồi Tức thì & Tiết kiệm (Flash Lite)',
    shortLabel: 'Siêu tốc • Lite',
    subtitle: 'Tốc độ cực nhanh, độ trễ thấp nhất cho dịch thuật, tóm tắt văn bản dài hoặc trích xuất thông tin.',
  },
  {
    tier: 'TTS',
    label: '4. Tổng hợp Giọng nói (Text-to-Speech)',
    shortLabel: 'Giọng nói TTS',
    subtitle: 'Chuyển văn bản thành giọng đọc tự nhiên chuẩn âm thanh WAV.',
  },
  {
    tier: 'IMAGE',
    label: '5. Tạo & Chỉnh sửa Hình ảnh (Image Gen)',
    shortLabel: 'Tạo ảnh',
    subtitle: 'Vẽ ảnh mới từ mô tả văn bản hoặc biến đổi hình ảnh đính kèm.',
  },
  {
    tier: 'VIDEO',
    label: '6. Tạo Video Bất đồng bộ (Veo LRO)',
    shortLabel: 'Tạo video Veo',
    subtitle: 'Dựng video ngắn 16:9 từ kịch bản mô tả cảnh quay qua Vertex AI.',
  },
];

// Danh sách model đã tinh giản: loại bỏ các bản trùng lặp phân khúc (như 3.7/3.5/3.0 Flash hay 3.1 Lite/TTS cũ),
// chỉ giữ đại diện tốt nhất cho mỗi nhu cầu kèm chú thích rõ sự khác nhau.
export const DEFAULT_MODELS: AIModel[] = [
  // ---- 1. ĐA DỤNG & TỐC ĐỘ CAO (DAILY FLASH) ----
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    capability: 'CHAT',
    tier: 'DAILY',
    badge: 'Mặc định • Khuyên dùng',
    speed: 'Nhanh',
    intelligence: 'Cao',
    bestFor: 'Hội thoại hàng ngày, viết & review code, phân tích tài liệu, hỏi đáp đa lĩnh vực',
    description:
      'Bản Flash thế hệ 3.8 mới và ổn định nhất trên Vertex AI. Cân bằng tối ưu giữa tốc độ phản hồi nhanh và độ thông minh.',
    note: 'Model chủ lực khuyên dùng mặc định cho hầu hết tác vụ.',
    providers: ['vertex', 'aistudio'],
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    capability: 'CHAT',
    tier: 'DAILY',
    badge: 'Mặc định AI Studio',
    speed: 'Nhanh',
    intelligence: 'Cao',
    bestFor: 'Chat đa dụng, lập trình và xử lý văn bản ổn định trên gói miễn phí AI Studio',
    description:
      'Model Flash tiêu chuẩn có hạn mức miễn phí (free quota) rộng rãi và ít bị giới hạn nhất khi dùng Google AI Studio.',
    note: 'Chỉ hiển thị bên AI Studio (Vertex AI dùng thẳng bản 3.8 Flash mới hơn).',
    providers: ['aistudio'],
  },

  // ---- 2. SUY LUẬN CHUYÊN SÂU & KIẾN TRÚC (REASONING / PRO / GEN 4) ----
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    capability: 'CHAT',
    tier: 'REASONING',
    badge: 'Suy luận sâu • Pro',
    speed: 'Trung bình',
    intelligence: 'Chuyên sâu',
    bestFor: 'Thiết kế kiến trúc hệ thống, thuật toán khó, phân tích GIS/PostGIS, debug lỗi phức tạp',
    description:
      'Dòng Pro chuyên giải quyết vấn đề nhiều bước. Suy luận chặt chẽ và sâu sắc hơn dòng Flash nhưng thời gian trả lời lâu hơn một chút.',
    note: 'Chọn khi bài toán thực sự khó hoặc cần phân tích chiều sâu; trên AI Studio miễn phí dễ gặp giới hạn 429.',
    providers: ['vertex', 'aistudio'],
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    capability: 'CHAT',
    tier: 'REASONING',
    badge: 'Thế hệ 4 • Mới nhất',
    speed: 'Chậm (~30s)',
    intelligence: 'Thế hệ 4 (Cao nhất)',
    bestFor: 'Trải nghiệm khả năng lập luận, sáng tạo ý tưởng và viết chuyên sâu thế hệ Gemini 4',
    description:
      'Model thế hệ thứ 4 mới ra mắt của Google. Khả năng tổng hợp và tư duy vượt trội cho các yêu cầu đòi hỏi chất lượng cao nhất.',
    note: 'Tốc độ phản hồi khá chậm (~25–30 giây) và đôi khi báo quá tải (429) vào giờ cao điểm.',
    providers: ['vertex'],
  },

  // ---- 3. PHẢN HỒI TỨC THÌ & TIẾT KIỆM (LITE) ----
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    capability: 'CHAT',
    tier: 'LITE',
    badge: 'Siêu tốc • Nhẹ',
    speed: 'Tức thì',
    intelligence: 'Tiêu chuẩn',
    bestFor: 'Dịch thuật nhanh, tóm tắt văn bản dài, viết lại câu, trích xuất JSON/dữ liệu đơn giản',
    description:
      'Phiên bản rút gọn tối ưu độ trễ thấp nhất. Trả lời gần như tức thì, tiết kiệm chi phí/quota khi không cần suy luận phức tạp.',
    note: 'Nhanh hơn 3.8 Flash nhưng không sâu bằng khi giải thuật toán khó.',
    providers: ['vertex', 'aistudio'],
  },

  // ---- 4. GIỌNG NÓI TEXT-TO-SPEECH (TTS) ----
  {
    id: 'gemini-3.8-flash-tts',
    name: 'Gemini 3.8 Flash TTS',
    capability: 'TTS',
    tier: 'TTS',
    badge: 'Giọng đọc WAV',
    speed: 'Nhanh',
    intelligence: 'Chuyên biệt Audio',
    bestFor: 'Đọc văn bản tiếng Việt & tiếng Anh thành giọng nói tự nhiên (Puck, Aoede, Kore, Charon, Fenrir)',
    description:
      'Model tổng hợp giọng nói thế hệ 3.8 mới nhất, xuất trực tiếp âm thanh WAV chất lượng cao phát ngay trên trình duyệt.',
    note: 'Khi chọn model này, khung nhập liệu sẽ chuyển sang chế độ đọc văn bản thành tiếng.',
    providers: ['vertex', 'aistudio'],
  },

  // ---- 5. TẠO & CHỈNH SỬA HÌNH ẢNH (IMAGE) ----
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image (Nano Banana)',
    capability: 'IMAGE',
    tier: 'IMAGE',
    badge: 'Vẽ & Sửa Ảnh',
    speed: 'Trung bình',
    intelligence: 'Chuyên biệt Ảnh',
    bestFor: 'Tạo hình ảnh minh họa từ mô tả (Text-to-Image) hoặc chỉnh sửa ảnh đính kèm (Image-to-Image)',
    description:
      'Model sinh ảnh tích hợp của Gemini, hỗ trợ cả vẽ ảnh mới lẫn biến đổi ảnh có sẵn theo yêu cầu.',
    note: 'Hiện chỉ hoạt động qua nhà cung cấp Google AI Studio.',
    providers: ['aistudio'],
  },

  // ---- 6. TẠO VIDEO BẤT ĐỒNG BỘ (VIDEO LRO) ----
  {
    id: 'veo-3.1-lite-generate-001',
    name: 'Veo 3.1 Lite Video',
    capability: 'VIDEO',
    tier: 'VIDEO',
    badge: 'Video 16:9 (LRO)',
    speed: 'Chậm (~30–60s)',
    intelligence: 'Chuyên biệt Video',
    bestFor: 'Dựng video clip ngắn 6 giây (tỷ lệ 16:9) từ mô tả cảnh quay điện ảnh',
    description:
      'Model tạo video bất đồng bộ (Long-Running Operation) qua Vertex AI. Tự động xử lý nền và trả video MP4 khi hoàn tất.',
    note: 'Chỉ hỗ trợ trên Vertex AI (cần Project ID hợp lệ) và tiêu tốn quota nhiều hơn chat.',
    providers: ['vertex'],
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

