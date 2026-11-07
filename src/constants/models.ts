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
    label: '1. Đa năng & Tốc độ cao (Flash Chủ lực)',
    shortLabel: 'Đa năng • Flash',
    subtitle: 'Khuyên dùng cho hầu hết nhu cầu: trò chuyện hàng ngày, soạn thảo văn bản, dịch thuật, học tập và giải đáp nhanh.',
  },
  {
    tier: 'REASONING',
    label: '2. Phân tích & Suy luận Chuyên sâu (Pro / Thế hệ 4)',
    shortLabel: 'Suy luận sâu',
    subtitle: 'Dành cho yêu cầu phức tạp, lập kế hoạch chi tiết, phân tích tài liệu dài, toán học & lập trình (phản hồi chậm hơn Flash).',
  },
  {
    tier: 'LITE',
    label: '3. Phản hồi Tức thì & Tiết kiệm (Flash Lite)',
    shortLabel: 'Siêu tốc • Lite',
    subtitle: 'Tốc độ cực nhanh, độ trễ thấp nhất cho dịch thuật, tóm tắt văn bản dài hoặc tra cứu thông tin ngắn gọn.',
  },
  {
    tier: 'TTS',
    label: '4. Đọc Văn bản Thành Giọng nói (Text-to-Speech)',
    shortLabel: 'Giọng nói TTS',
    subtitle: 'Chuyển nội dung văn bản thành giọng đọc tự nhiên, phát trực tiếp trên trình duyệt.',
  },
  {
    tier: 'IMAGE',
    label: '5. Tạo & Chỉnh sửa Hình ảnh (Image)',
    shortLabel: 'Tạo ảnh',
    subtitle: 'Vẽ hình ảnh mới từ mô tả văn bản hoặc chỉnh sửa hình ảnh bạn tải lên.',
  },
  {
    tier: 'VIDEO',
    label: '6. Tạo Video từ Văn bản (Veo)',
    shortLabel: 'Tạo video Veo',
    subtitle: 'Dựng video ngắn khung hình 16:9 sống động từ mô tả cảnh quay.',
  },
];

// Danh sách model đã tinh giản: loại bỏ các bản trùng lặp phân khúc (như 3.7/3.5/3.0 Flash hay 3.1 Lite/TTS cũ),
// chỉ giữ đại diện tốt nhất cho mỗi nhu cầu kèm chú thích rõ sự khác nhau.
export const DEFAULT_MODELS: AIModel[] = [
  // ---- 1. ĐA NĂNG & TỐC ĐỘ CAO (DAILY FLASH) ----
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    capability: 'CHAT',
    tier: 'DAILY',
    badge: 'Mặc định • Khuyên dùng',
    speed: 'Nhanh',
    intelligence: 'Cao',
    bestFor: 'Trò chuyện hàng ngày, soạn thảo & biên tập nội dung, dịch thuật, tóm tắt tài liệu, hỏi đáp đa lĩnh vực',
    description:
      'Bản Flash thế hệ 3.8 mới và ổn định nhất. Cân bằng tối ưu giữa tốc độ phản hồi nhanh và khả năng hiểu ngữ cảnh sâu sắc.',
    note: 'Model chủ lực khuyên dùng mặc định cho hầu hết mọi nhu cầu.',
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
    bestFor: 'Trò chuyện đa năng, soạn thảo văn bản, dịch thuật và tra cứu thông tin ổn định trên AI Studio',
    description:
      'Model Flash tiêu chuẩn có hạn mức miễn phí rộng rãi và ổn định khi sử dụng qua Google AI Studio.',
    note: 'Chỉ hiển thị bên AI Studio (Vertex AI dùng thẳng bản 3.8 Flash mới hơn).',
    providers: ['aistudio'],
  },

  // ---- 2. PHÂN TÍCH & SUY LUẬN CHUYÊN SÂU (REASONING / PRO / GEN 4) ----
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    capability: 'CHAT',
    tier: 'REASONING',
    badge: 'Suy luận sâu • Pro',
    speed: 'Trung bình',
    intelligence: 'Chuyên sâu',
    bestFor: 'Phân tích chuyên sâu, lập kế hoạch chi tiết, giải quyết vấn đề nhiều bước, nghiên cứu & lập trình',
    description:
      'Dòng Pro chuyên xử lý các yêu cầu phức tạp cần lập luận chặt chẽ, phân tích kỹ lưỡng nhiều chiều trước khi trả lời.',
    note: 'Chọn khi câu hỏi khó hoặc cần bài viết/phân tích có chiều sâu; thời gian phản hồi lâu hơn dòng Flash.',
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
    bestFor: 'Sáng tạo nội dung chuyên sâu, lập luận phức tạp và tổng hợp kiến thức chất lượng cao nhất',
    description:
      'Model thế hệ thứ 4 mới ra mắt của Google. Khả năng tư duy, phân tích và diễn đạt vượt trội cho các yêu cầu khó.',
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
    bestFor: 'Dịch thuật nhanh, tóm tắt văn bản dài, viết lại câu, kiểm tra chính tả và tra cứu ngắn gọn',
    description:
      'Phiên bản gọn nhẹ tối ưu tốc độ phản hồi gần như tức thì, phù hợp cho các yêu cầu đơn giản không cần suy luận dài.',
    note: 'Nhanh hơn 3.8 Flash nhưng phân tích không sâu bằng đối với các câu hỏi phức tạp.',
    providers: ['vertex', 'aistudio'],
  },

  // ---- 4. GIỌNG NÓI TEXT-TO-SPEECH (TTS) ----
  {
    id: 'gemini-3.8-flash-tts',
    name: 'Gemini 3.8 Flash TTS',
    capability: 'TTS',
    tier: 'TTS',
    badge: 'Giọng đọc Tự nhiên',
    speed: 'Nhanh',
    intelligence: 'Chuyên biệt Audio',
    bestFor: 'Chuyển văn bản tiếng Việt & ngoại ngữ thành giọng đọc tự nhiên (hỗ trợ nhiều giọng đọc trong Cấu hình)',
    description:
      'Model tổng hợp giọng nói thế hệ mới, tạo âm thanh chất lượng cao để nghe trực tiếp hoặc tải về từ trình duyệt.',
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
    bestFor: 'Tạo hình ảnh minh họa từ mô tả văn bản hoặc chỉnh sửa hình ảnh bạn đính kèm',
    description:
      'Model tạo ảnh tích hợp của Gemini, hỗ trợ cả vẽ ảnh mới theo ý tưởng lẫn biến đổi ảnh có sẵn.',
    note: 'Hiện hoạt động qua nhà cung cấp Google AI Studio.',
    providers: ['aistudio'],
  },

  // ---- 6. TẠO VIDEO TỪ VĂN BẢN (VIDEO) ----
  {
    id: 'veo-3.1-lite-generate-001',
    name: 'Veo 3.1 Lite Video',
    capability: 'VIDEO',
    tier: 'VIDEO',
    badge: 'Video 16:9',
    speed: 'Chậm (~30–60s)',
    intelligence: 'Chuyên biệt Video',
    bestFor: 'Dựng video clip ngắn 6 giây (khung hình ngang 16:9) từ mô tả cảnh quay',
    description:
      'Model tạo video từ văn bản của Google. Hệ thống tự động dựng hình trong khoảng 30–60 giây và trả về video MP4 hoàn chỉnh.',
    note: 'Hỗ trợ trên chế độ Vertex AI.',
    providers: ['vertex'],
  },
];

export const TTS_VOICES = ['Puck', 'Aoede', 'Kore', 'Charon', 'Fenrir'];

export const STARTER_PROMPTS = [
  {
    title: 'Soạn thảo & Lên ý tưởng',
    prompt: 'Giúp tôi lập kế hoạch chi tiết và viết bản đề xuất chuyên nghiệp cho một dự án hoặc sự kiện sắp tới.',
    capability: 'CHAT'
  },
  {
    title: 'Tóm tắt & Giải thích dễ hiểu',
    prompt: 'Hãy giải thích một chủ đề hoặc khái niệm phức tạp theo cách ngắn gọn, sinh động cùng ví dụ thực tế dễ nhớ.',
    capability: 'CHAT'
  },
  {
    title: 'Tạo hình ảnh minh họa',
    prompt: 'Một góc quán cà phê nhỏ yên bình vào buổi sáng ngập nắng ấm, nhiều cây xanh bên khung cửa sổ gỗ, phong cách nhiếp ảnh điện ảnh.',
    capability: 'IMAGE'
  },
  {
    title: 'Đọc văn bản thành giọng nói',
    prompt: 'Xin chào! Tôi là Jenny, trợ lý AI của bạn. Hôm nay tôi có thể giúp gì cho công việc, học tập hay ý tưởng sáng tạo của bạn?',
    capability: 'TTS'
  }
];

