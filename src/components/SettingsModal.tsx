import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useChatStore } from '../hooks/useChatStore';
import { TTS_VOICES } from '../constants/models';
import { PERSONAS, CUSTOM_PERSONA_ID } from '../constants/personas';
import type { ApiProvider } from '../types/chat';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useChatStore();
  const [form, setForm] = useState(settings);

  // Settings saved before personas existed, or with a persona that is no longer built in, show as match-by-text / custom.
  const personaValue = PERSONAS.some((p) => p.id === form.personaId)
    ? form.personaId!
    : PERSONAS.find((p) => p.systemPrompt === form.systemPrompt)?.id ?? CUSTOM_PERSONA_ID;

  const handlePersonaChange = (id: string) => {
    const persona = PERSONAS.find((p) => p.id === id);
    setForm(persona ? { ...form, personaId: id, systemPrompt: persona.systemPrompt } : { ...form, personaId: CUSTOM_PERSONA_ID });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 p-1.5 rounded-lg text-muted hover:text-primary">
          <X size={18} />
        </button>

        <h2 className="text-xl font-serif text-primary mb-1">Cấu hình Jenny Atelier</h2>
        <p className="text-xs text-muted mb-4">
          Thiết lập kết nối Google Agent Platform API, giọng đọc TTS và nhân cách của Jenny.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="p-3 rounded-xl bg-accent-sage/10 border border-accent-sage/30 flex items-start gap-2.5 text-xs text-primary">
            <ShieldCheck size={16} className="text-accent-sage shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-accent-sage">Đã nạp sẵn API Key:</span>{' '}
              Tích hợp key từ <code className="font-mono">key.md</code> và Vercel Proxy <code className="font-mono">/api/jenny</code>.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-1">Nhà cung cấp API</label>
              <select
                value={form.provider ?? 'aistudio'}
                onChange={(e) => setForm({ ...form, provider: e.target.value as ApiProvider })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta"
              >
                <option value="aistudio">Google AI Studio (API key)</option>
                <option value="vertex">Vertex AI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-1">AI Studio API Key</label>
              <input
                type="password"
                value={form.aiStudioApiKey ?? ''}
                onChange={(e) => setForm({ ...form, aiStudioApiKey: e.target.value })}
                placeholder="Để trống để dùng VITE_GEMINI_API_KEY"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-1">Project ID (Veo LRO)</label>
              <input
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                placeholder="no-coop-300usd-project"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta font-mono"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-1">Vertex API Key (Ghi đè)</label>
              <input
                type="password"
                value={form.customApiKey}
                onChange={(e) => setForm({ ...form, customApiKey: e.target.value })}
                placeholder="Để trống để dùng Key mặc định"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-1">Giọng đọc TTS</label>
              <select
                value={form.ttsVoice}
                onChange={(e) => setForm({ ...form, ttsVoice: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta"
              >
                {TTS_VOICES.map((v) => (
                  <option key={v} value={v}>{v} {v === 'Puck' ? '(Mặc định)' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-1">Tỷ lệ khung hình Ảnh</label>
              <select
                value={form.imageAspectRatio || '1:1'}
                onChange={(e) => setForm({ ...form, imageAspectRatio: e.target.value as '1:1' | '16:9' | '9:16' | '4:3' })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta"
              >
                <option value="1:1">1:1 (Vuông)</option>
                <option value="16:9">16:9 (Ngang rộng)</option>
                <option value="9:16">9:16 (Dọc Mobile)</option>
                <option value="4:3">4:3 (Cổ điển)</option>
              </select>
            </div>
          </div>

          <label className="flex items-center justify-between p-3 rounded-lg bg-background border border-border cursor-pointer">
            <div>
              <div className="text-sm font-medium text-primary">Phản hồi trực tiếp (SSE Streaming)</div>
              <div className="text-xs text-muted">Hiển thị văn bản trực tiếp theo thời gian thực</div>
            </div>
            <input
              type="checkbox"
              checked={form.enableStreaming ?? true}
              onChange={(e) => setForm({ ...form, enableStreaming: e.target.checked })}
              className="h-4 w-4 accent-accent-terracotta"
            />
          </label>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">Persona</label>
            <select
              value={personaValue}
              onChange={(e) => handlePersonaChange(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta"
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value={CUSTOM_PERSONA_ID}>Tùy chỉnh</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">System Instruction (Nhân cách Jenny)</label>
            <textarea
              value={form.systemPrompt}
              onChange={(e) => setForm({ ...form, systemPrompt: e.target.value, personaId: CUSTOM_PERSONA_ID })}
              rows={8}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta resize-none"
            />
          </div>

          <button type="submit" className="mt-1 bg-primary text-background font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm">
            Lưu cấu hình
          </button>
        </form>
      </div>
    </div>
  );
}

