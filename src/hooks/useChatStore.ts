import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Conversation, Message, AIModel, AppSettings } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  customModels: AIModel[];
  settings: AppSettings;
  activeModelId: string;
  isHydrated: boolean;
  lastSavedAt: number | null;

  // Actions
  setHydrated: () => void;
  createConversation: (title?: string) => string;
  setActiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  togglePinConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (conversationId: string, messageId: string, patch: Partial<Message>) => void;
  updateConversationTitle: (id: string, title: string) => void;
  addCustomModel: (model: AIModel) => void;
  removeCustomModel: (id: string) => void;
  setActiveModel: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  saveSnapshotNow: () => void;
  importHistory: (data: any, mode: 'merge' | 'replace') => void;
}

const createInitialConversation = (): Conversation => ({
  id: uuidv4(),
  title: 'Phiên làm việc mới cùng Jenny',
  messages: [],
  updatedAt: Date.now(),
  pinned: false,
});

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [createInitialConversation()],
      activeConversationId: null,
      customModels: [],
      settings: {
        provider: 'aistudio',
        aiStudioApiKey: '',
        customApiKey: '',
        projectId: 'no-coop-300usd-project',
        systemPrompt:
          'Bạn là Jenny — trợ lý AI thông minh, tinh tế và chuẩn xác mang phong cách Editorial Atelier. Bạn hỗ trợ người dùng xuất sắc bằng tiếng Việt và tiếng Anh về lập trình (React, React Native, TypeScript, GIS/MapLibre, MCP, AI Agents), phân tích dữ liệu và sáng tạo đa phương thức.',
        ttsVoice: 'Puck',
        enableStreaming: true,
        imageAspectRatio: '1:1',
      },
      activeModelId: 'gemini-2.5-flash',
      isHydrated: false,
      lastSavedAt: Date.now(),

      setHydrated: () =>
        set((state) => {
          if (state.conversations.length === 0) {
            const initial = createInitialConversation();
            return {
              isHydrated: true,
              conversations: [initial],
              activeConversationId: initial.id,
            };
          }
          return {
            isHydrated: true,
            activeConversationId:
              state.activeConversationId &&
              state.conversations.some((c) => c.id === state.activeConversationId)
                ? state.activeConversationId
                : state.conversations[0].id,
          };
        }),

      createConversation: (title = 'Cuộc trò chuyện mới') => {
        const id = uuidv4();
        const newConversation: Conversation = {
          id,
          title,
          messages: [],
          updatedAt: Date.now(),
          pinned: false,
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: id,
          lastSavedAt: Date.now(),
        }));
        return id;
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          if (filtered.length === 0) {
            const fallback = createInitialConversation();
            return {
              conversations: [fallback],
              activeConversationId: fallback.id,
              lastSavedAt: Date.now(),
            };
          }
          return {
            conversations: filtered,
            activeConversationId:
              state.activeConversationId === id ? filtered[0].id : state.activeConversationId,
            lastSavedAt: Date.now(),
          };
        });
      },

      clearAllConversations: () => {
        const fresh = createInitialConversation();
        set({
          conversations: [fresh],
          activeConversationId: fresh.id,
          lastSavedAt: Date.now(),
        });
      },

      togglePinConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c
          ),
          lastSavedAt: Date.now(),
        }));
      },


      addMessage: (conversationId, messageData) => {
        const msgId = uuidv4();
        set((state) => {
          const conversations = state.conversations.map((c) => {
            if (c.id === conversationId) {
              const newMsg: Message = {
                ...messageData,
                id: msgId,
                timestamp: Date.now(),
              };
              const messages = [...c.messages, newMsg];
              let title = c.title;
              const isDefaultTitle =
                title === 'Cuộc trò chuyện mới' ||
                title === 'New Conversation' ||
                title === 'Phiên làm việc mới cùng Jenny';
              if (isDefaultTitle && messageData.role === 'user' && messageData.text.trim()) {
                const clean = messageData.text.trim().replace(/\s+/g, ' ');
                title = clean.slice(0, 42) + (clean.length > 42 ? '…' : '');
              }
              return { ...c, messages, title, updatedAt: Date.now() };
            }
            return c;
          });
          return { conversations, lastSavedAt: Date.now() };
        });
        return msgId;
      },

      updateMessage: (conversationId, messageId, patch) => {
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            return {
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
            };
          }),
          lastSavedAt: Date.now(),
        }));
      },

      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title: title.trim() || c.title, updatedAt: Date.now() } : c
          ),
          lastSavedAt: Date.now(),
        }));
      },

      addCustomModel: (model) =>
        set((state) => {
          const exists = state.customModels.some((m) => m.id === model.id);
          const customModels = exists
            ? state.customModels.map((m) =>
                m.id === model.id ? { ...model, isCustom: true } : m
              )
            : [...state.customModels, { ...model, isCustom: true }];
          return {
            customModels,
            activeModelId: model.id,
            lastSavedAt: Date.now(),
          };
        }),

      removeCustomModel: (id) =>
        set((state) => ({
          customModels: state.customModels.filter((m) => m.id !== id),
          activeModelId: state.activeModelId === id ? 'gemini-2.5-flash' : state.activeModelId,
          lastSavedAt: Date.now(),
        })),

      setActiveModel: (id) => set({ activeModelId: id }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          lastSavedAt: Date.now(),
        })),

      saveSnapshotNow: () => {
        const current = get();
        try {
          localStorage.setItem(
            'jenny-chat-manual-snapshot',
            JSON.stringify({
              conversations: current.conversations,
              customModels: current.customModels,
              settings: current.settings,
              savedAt: new Date().toISOString(),
            })
          );
        } catch {
          // ignore quota error
        }
        set({ lastSavedAt: Date.now() });
      },

      importHistory: (data, mode) => {
        set((state) => {
          const incomingConvs: Conversation[] = Array.isArray(data?.conversations)
            ? data.conversations
            : [];
          const incomingModels: AIModel[] = Array.isArray(data?.customModels)
            ? data.customModels
            : [];

          if (mode === 'replace') {
            const safeConvs =
              incomingConvs.length > 0 ? incomingConvs : [createInitialConversation()];
            return {
              conversations: safeConvs,
              customModels: incomingModels,
              activeConversationId: safeConvs[0].id,
              lastSavedAt: Date.now(),
            };
          } else {
            const existingIds = new Set(state.conversations.map((c) => c.id));
            const newConvs = incomingConvs.filter((c) => c && c.id && !existingIds.has(c.id));

            const existingModelIds = new Set(state.customModels.map((m) => m.id));
            const newModels = incomingModels.filter(
              (m) => m && m.id && !existingModelIds.has(m.id)
            );

            const merged = [...newConvs, ...state.conversations].sort(
              (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
            );

            return {
              conversations: merged,
              customModels: [...state.customModels, ...newModels],
              activeConversationId: state.activeConversationId || merged[0]?.id || null,
              lastSavedAt: Date.now(),
            };
          }
        });
      },
    }),
    {
      name: 'jenny-chat-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);

