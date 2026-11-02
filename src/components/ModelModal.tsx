import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles } from 'lucide-react';
import { useChatStore } from '../hooks/useChatStore';
import { ModelCapability } from '../types/chat';

export function ModelModal({ onClose }: { onClose: () => void }) {
  const { addCustomModel, customModels, removeCustomModel, setActiveModel } = useChatStore();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [capability, setCapability] = useState<ModelCapability>('CHAT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = id.trim();
    if (!cleanId) return;
    addCustomModel({
      id: cleanId,
      name: name.trim() || cleanId,
      capability,
      badge: 'Custom ID',
      isCustom: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-primary">
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-accent-terracotta" />
          <h2 className="text-xl font-serif text-primary">Thêm Model bằng ID</h2>
        </div>
        <p className="text-xs text-muted mb-4">
          Nhập Model ID từ Google Agent Platform (Gemini, Imagen, Veo, TTS).
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">Model ID *</label>
            <input
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta font-mono"
              placeholder="gemini-3-flash-preview"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">Tên hiển thị (Tùy chọn)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta"
              placeholder="Tự lấy theo ID nếu để trống"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">Chế độ API (Capability)</label>
            <select
              value={capability}
              onChange={(e) => setCapability(e.target.value as ModelCapability)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-terracotta"
            >
              <option value="CHAT">CHAT • Văn bản & Đa phương thức</option>
              <option value="IMAGE">IMAGE • Tạo hình ảnh</option>
              <option value="VIDEO">VIDEO • Tạo video (Veo LRO)</option>
              <option value="TTS">TTS • Giọng nói (Text-to-Speech)</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-1 flex items-center justify-center gap-2 bg-accent-terracotta text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            <Plus size={16} />
            <span>Thêm & Kích hoạt Model</span>
          </button>
        </form>

        {customModels.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border">
            <div className="text-xs uppercase tracking-wider text-muted mb-2">
              Model tùy chỉnh đã lưu ({customModels.length})
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {customModels.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border text-xs"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModel(m.id);
                      onClose();
                    }}
                    className="text-left flex-1 truncate"
                  >
                    <div className="font-medium text-primary">{m.name}</div>
                    <div className="font-mono text-muted">{m.id} ({m.capability})</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCustomModel(m.id)}
                    className="p-1 text-muted hover:text-accent-terracotta"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

