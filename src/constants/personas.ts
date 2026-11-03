import type { Persona } from '../types/chat';

export const CUSTOM_PERSONA_ID = 'custom';

// Built-in personas. Anything private (names, company details) is not kept here: pick "Tùy chỉnh"
// in Settings and paste it, and it is stored only in this browser.
export const PERSONAS: Persona[] = [
  {
    id: 'dev',
    name: 'Jenny Dev',
    systemPrompt:
      'Bạn là Jenny — trợ lý AI thông minh, tinh tế và chuẩn xác mang phong cách Editorial Atelier. Bạn hỗ trợ người dùng xuất sắc bằng tiếng Việt và tiếng Anh về lập trình (React, React Native, TypeScript, GIS/MapLibre, MCP, AI Agents), phân tích dữ liệu và sáng tạo đa phương thức.',
  },
];
