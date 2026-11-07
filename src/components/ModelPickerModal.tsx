import { useEffect } from 'react';
import {
  Zap,
  BrainCircuit,
  Feather,
  Volume2,
  Image as ImageIcon,
  Film,
  Check,
  Gauge,
  Sparkles,
  Info,
  X,
  Plus,
} from 'lucide-react';
import { useChatStore } from '../hooks/useChatStore';
import { useModels } from '../hooks/useModels';
import { MODEL_TIER_GROUPS } from '../constants/models';
import type { AIModel, ApiProvider, ModelTier } from '../types/chat';

export const getEffectiveTier = (model: AIModel): ModelTier => {
  if (model.tier) return model.tier;
  if (model.capability === 'IMAGE') return 'IMAGE';
  if (model.capability === 'VIDEO') return 'VIDEO';
  if (model.capability === 'TTS') return 'TTS';
  return 'DAILY';
};

export const TIER_STYLE: Record<
  ModelTier,
  {
    badgeClass: string;
    borderActiveClass: string;
    iconBgClass: string;
    Icon: typeof Zap;
  }
> = {
  DAILY: {
    badgeClass: 'bg-accent-sage/15 text-accent-sage border-accent-sage/35',
    borderActiveClass: 'border-accent-sage/60 bg-accent-sage/10',
    iconBgClass: 'bg-accent-sage/15 text-accent-sage',
    Icon: Zap,
  },
  REASONING: {
    badgeClass: 'bg-accent-terracotta/15 text-accent-terracotta border-accent-terracotta/35',
    borderActiveClass: 'border-accent-terracotta/60 bg-accent-terracotta/10',
    iconBgClass: 'bg-accent-terracotta/15 text-accent-terracotta',
    Icon: BrainCircuit,
  },
  LITE: {
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35',
    borderActiveClass: 'border-emerald-500/60 bg-emerald-500/10',
    iconBgClass: 'bg-emerald-500/15 text-emerald-400',
    Icon: Feather,
  },
  TTS: {
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/35',
    borderActiveClass: 'border-sky-500/60 bg-sky-500/10',
    iconBgClass: 'bg-sky-500/15 text-sky-400',
    Icon: Volume2,
  },
  IMAGE: {
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/35',
    borderActiveClass: 'border-purple-500/60 bg-purple-500/10',
    iconBgClass: 'bg-purple-500/15 text-purple-400',
    Icon: ImageIcon,
  },
  VIDEO: {
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/35',
    borderActiveClass: 'border-amber-500/60 bg-amber-500/10',
    iconBgClass: 'bg-amber-500/15 text-amber-400',
    Icon: Film,
  },
};

interface ModelPickerModalProps {
  onClose: () => void;
  onOpenCustomModal: () => void;
}

export function ModelPickerModal({ onClose, onOpenCustomModal }: ModelPickerModalProps) {
  const { setActiveModel, updateSettings } = useChatStore();
  const { provider, builtIn, customModels, activeModel } = useModels();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelect = (id: string) => {
    setActiveModel(id);
    onClose();
  };

  const handleSwitchProvider = (next: ApiProvider) => {
    if (next !== provider) updateSettings({ provider: next });
  };

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 flex items-start justify-center p-2 sm:p-4 sm:pt-14"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:px-5 border-b border-border flex flex-col gap-3 bg-background/60">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-serif text-primary flex items-center gap-2">
                <Sparkles size={17} className="text-accent-terracotta" />
                <span>Chọn Mô hình AI & So sánh Tác dụng</span>
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Đã tinh giản các bản trùng lặp — mỗi model đại diện cho một vai trò riêng biệt.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-border/40"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border text-xs">
              <button
                type="button"
                onClick={() => handleSwitchProvider('vertex')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  provider === 'vertex'
                    ? 'bg-accent-terracotta text-white shadow-sm'
                    : 'text-muted hover:text-primary'
                }`}
              >
                Vertex AI (Mặc định)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchProvider('aistudio')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  provider === 'aistudio'
                    ? 'bg-accent-terracotta text-white shadow-sm'
                    : 'text-muted hover:text-primary'
                }`}
              >
                Google AI Studio
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCustomModal();
              }}
              className="inline-flex items-center gap-1 text-xs text-accent-terracotta hover:underline font-medium"
            >
              <Plus size={13} />
              <span>Thêm Model bằng ID khác</span>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-3 sm:p-5 space-y-5">
          {MODEL_TIER_GROUPS.map((group) => {
            const models = builtIn.filter((m) => getEffectiveTier(m) === group.tier);
            if (models.length === 0) return null;
            const style = TIER_STYLE[group.tier];
            const GroupIcon = style.Icon;

            return (
              <div key={group.tier} className="space-y-2">
                <div className="px-1">
                  <div className="flex items-center gap-2">
                    <span className={`p-1 rounded-md ${style.iconBgClass}`}>
                      <GroupIcon size={14} />
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-primary">
                      {group.label}
                    </h3>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5 pl-7">{group.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {models.map((model) => {
                    const isSelected = model.id === activeModel.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => handleSelect(model.id)}
                        className={`w-full text-left rounded-xl p-3 sm:p-3.5 border transition-all ${
                          isSelected
                            ? `${style.borderActiveClass} shadow-sm`
                            : 'bg-background/70 hover:bg-background border-border hover:border-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm text-primary">
                              {model.name}
                            </span>
                            {model.badge && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${style.badgeClass}`}
                              >
                                {model.badge}
                              </span>
                            )}
                            <span className="font-mono text-[11px] text-muted bg-surface px-1.5 py-0.5 rounded border border-border/70">
                              {model.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                              {model.capability}
                            </span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-accent-terracotta text-white flex items-center justify-center">
                                <Check size={12} />
                              </span>
                            )}
                          </div>
                        </div>
                        {(model.speed || model.intelligence) && (
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                            {model.speed && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-primary/90">
                                <Gauge size={11} className="text-accent-sage" />
                                <span>Tốc độ:</span>
                                <strong className="font-medium">{model.speed}</strong>
                              </span>
                            )}
                            {model.intelligence && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-primary/90">
                                <BrainCircuit size={11} className="text-accent-terracotta" />
                                <span>Trí tuệ:</span>
                                <strong className="font-medium">{model.intelligence}</strong>
                              </span>
                            )}
                          </div>
                        )}

                        {model.bestFor && (
                          <div className="mt-2 text-xs text-primary/95 bg-surface/70 border border-border/60 rounded-lg px-2.5 py-1.5">
                            <span className="font-semibold text-accent-sage">Khi nào nên chọn: </span>
                            <span>{model.bestFor}</span>
                          </div>
                        )}

                        {model.description && (
                          <p className="mt-1.5 text-xs text-muted leading-relaxed">
                            {model.description}
                          </p>
                        )}

                        {model.note && (
                          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-amber-300/90">
                            <Info size={12} className="shrink-0 mt-0.5" />
                            <span>{model.note}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {customModels.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="px-1">
                <h3 className="text-xs sm:text-sm font-semibold text-primary">
                  Model Tùy chỉnh Đã thêm (Custom ID)
                </h3>
                <p className="text-[11px] text-muted">
                  Các model bạn đã thêm thủ công bằng ID riêng.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {customModels.map((model) => {
                  const isSelected = model.id === activeModel.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => handleSelect(model.id)}
                      className={`w-full text-left rounded-xl p-3 border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-accent-terracotta bg-accent-terracotta/10'
                          : 'bg-background/70 hover:bg-background border-border'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm text-primary">★ {model.name}</div>
                        <div className="font-mono text-xs text-muted">
                          {model.id} • {model.capability}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-accent-terracotta text-white flex items-center justify-center">
                          <Check size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
