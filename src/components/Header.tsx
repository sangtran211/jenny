import { useState } from 'react';
import { Settings, Plus, PanelLeft, Sparkles, ChevronDown } from 'lucide-react';
import { useChatStore } from '../hooks/useChatStore';
import { DEFAULT_MODELS } from '../constants/models';
import { ModelModal } from './ModelModal';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { activeModelId, setActiveModel, customModels } = useChatStore();
  const [showModelModal, setShowModelModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const allModels = [...DEFAULT_MODELS, ...customModels];
  const activeModel = allModels.find((m) => m.id === activeModelId) || DEFAULT_MODELS[0];

  const capabilityBadgeColor: Record<string, string> = {
    CHAT: 'bg-accent-sage/15 text-accent-sage border-accent-sage/30',
    IMAGE: 'bg-accent-terracotta/15 text-accent-terracotta border-accent-terracotta/30',
    VIDEO: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    TTS: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  };

  return (
    <>
      <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-surface/90 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-border/60 text-muted hover:text-primary transition-colors"
            title="Đóng/Mở thanh lịch sử"
          >
            <PanelLeft size={18} />
          </button>

          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-2xl tracking-tight text-primary">Jenny</span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent-terracotta hidden sm:inline-block">
              Atelier AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex items-center">
            <select
              value={activeModelId}
              onChange={(e) => setActiveModel(e.target.value)}
              className="appearance-none bg-background border border-border hover:border-muted rounded-xl pl-3.5 pr-9 py-2 text-xs sm:text-sm font-medium text-primary focus:outline-none focus:border-accent-terracotta transition-colors cursor-pointer max-w-[210px] sm:max-w-[300px] truncate"
            >
              <optgroup label="Chat & Suy Luận (Gemini)">
                {DEFAULT_MODELS.filter((m) => m.capability === 'CHAT').map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} — {model.id}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Tạo Hình Ảnh (Imagen / Gemini Image)">
                {DEFAULT_MODELS.filter((m) => m.capability === 'IMAGE').map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} — {model.id}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Tạo Video Bất Đồng Bộ (Veo LRO)">
                {DEFAULT_MODELS.filter((m) => m.capability === 'VIDEO').map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} — {model.id}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Giọng Nói Text-to-Speech (TTS)">
                {DEFAULT_MODELS.filter((m) => m.capability === 'TTS').map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} — {model.id}
                  </option>
                ))}
              </optgroup>
              {customModels.length > 0 && (
                <optgroup label="Model Tùy Chỉnh Đã Thêm (Custom ID)">
                  {customModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      ★ {model.name} ({model.capability}) — {model.id}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 pointer-events-none text-muted"
            />
          </div>

          <span
            className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono border ${
              capabilityBadgeColor[activeModel.capability] || capabilityBadgeColor.CHAT
            }`}
          >
            {activeModel.capability}
          </span>

          <button
            onClick={() => setShowModelModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-terracotta/15 border border-accent-terracotta/40 text-accent-terracotta hover:bg-accent-terracotta hover:text-white transition-colors text-xs font-medium"
            title="Thêm Model mới bằng ID"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add Model ID</span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-xl border border-border bg-background hover:border-muted text-muted hover:text-primary transition-colors"
            title="Cấu hình API & Giọng nói"
          >
            <Settings size={17} />
          </button>
        </div>
      </header>

      {showModelModal && <ModelModal onClose={() => setShowModelModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </>
  );
}

