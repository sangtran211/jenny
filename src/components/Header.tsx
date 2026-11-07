import { useState } from 'react';
import { Settings, Plus, PanelLeft, ChevronDown, MessageSquarePlus } from 'lucide-react';
import { useModels } from '../hooks/useModels';
import { useChatStore } from '../hooks/useChatStore';
import { ModelModal } from './ModelModal';
import { SettingsModal } from './SettingsModal';
import { ModelPickerModal, getEffectiveTier, TIER_STYLE } from './ModelPickerModal';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { provider, activeModel } = useModels();
  const createConversation = useChatStore((state) => state.createConversation);
  const [showPicker, setShowPicker] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const activeTier = getEffectiveTier(activeModel);
  const activeStyle = TIER_STYLE[activeTier];
  const ActiveIcon = activeStyle.Icon;

  return (
    <>
      <header className="h-16 border-b border-border flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-6 bg-surface/90 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 sm:p-2.5 rounded-lg hover:bg-border/60 text-muted hover:text-primary transition-colors"
            title="Đóng/Mở thanh lịch sử"
          >
            <PanelLeft size={18} />
          </button>

          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg sm:text-2xl tracking-tight text-primary">Jenny</span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent-terracotta hidden xl:inline-block">
              Atelier AI
            </span>
          </div>

          <button
            type="button"
            onClick={() => createConversation()}
            className="ml-1 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-accent-terracotta text-white hover:opacity-90 transition-opacity text-xs font-medium shrink-0 shadow-sm"
            title="Tạo đoạn chat mới"
          >
            <MessageSquarePlus size={15} />
            <span className="hidden sm:inline">Đoạn chat mới</span>
            <span className="sm:hidden">Mới</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 min-w-0 flex-1">
          {/* Nút chọn Model nổi bật, tự động co giãn vừa khít trên cả màn hình nhỏ 320px–390px */}
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="group flex items-center gap-1.5 sm:gap-2.5 bg-background hover:bg-background/80 border border-accent-terracotta/45 hover:border-accent-terracotta rounded-xl px-2 sm:px-3.5 py-1.5 text-left transition-all shadow-sm min-w-0 max-w-full"
            title="Bấm để xem chú thích đặc điểm & đổi Model AI"
          >
            <div className={`p-1.5 rounded-lg shrink-0 hidden sm:flex ${activeStyle.iconBgClass}`}>
              <ActiveIcon size={16} />
            </div>

            <div className="min-w-0 flex-1 max-w-[260px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-primary truncate">
                  {activeModel.name}
                </span>
                {activeModel.badge && (
                  <span
                    className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 ${activeStyle.badgeClass}`}
                  >
                    {activeModel.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted truncate">
                <span className="font-mono uppercase text-accent-terracotta font-semibold shrink-0">
                  {provider === 'vertex' ? 'Vertex AI' : 'AI Studio'}
                </span>
                <span>•</span>
                <span className="truncate">
                  {activeModel.bestFor || activeModel.description || activeModel.id}
                </span>
              </div>
            </div>

            <ChevronDown
              size={15}
              className="text-accent-terracotta group-hover:translate-y-0.5 transition-transform shrink-0"
            />
          </button>

          <button
            onClick={() => setShowModelModal(true)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl bg-accent-terracotta/15 border border-accent-terracotta/40 text-accent-terracotta hover:bg-accent-terracotta hover:text-white transition-colors text-xs font-medium shrink-0"
            title="Thêm Model mới bằng ID"
          >
            <Plus size={15} />
            <span className="hidden lg:inline">Thêm ID</span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 sm:p-2.5 rounded-xl border border-border bg-background hover:border-muted text-muted hover:text-primary transition-colors shrink-0"
            title="Cấu hình API & Giọng nói"
          >
            <Settings size={17} />
          </button>
        </div>
      </header>

      {showPicker && (
        <ModelPickerModal
          onClose={() => setShowPicker(false)}
          onOpenCustomModal={() => setShowModelModal(true)}
        />
      )}
      {showModelModal && <ModelModal onClose={() => setShowModelModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </>
  );
}


