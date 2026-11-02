import React, { useEffect, useRef, useState } from 'react';
import { Send, Image as ImageIcon, Video, Volume2, MessageSquare, Loader2 } from 'lucide-react';
import { useChatStore } from '../hooks/useChatStore';
import {
  generateText,
  generateImage,
  generateTTS,
  initiateVideoGen,
  pollVideoGen,
} from '../services/jennyApi';
import { DEFAULT_MODELS } from '../constants/models';
import { Attachment, ModelCapability } from '../types/chat';

export function Composer() {
  const {
    activeConversationId,
    createConversation,
    addMessage,
    updateMessage,
    activeModelId,
    setActiveModel,
    customModels,
    settings,
  } = useChatStore();

  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ type: 'image'; data: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const allModels = [...DEFAULT_MODELS, ...customModels];
  const activeModel = allModels.find((m) => m.id === activeModelId) || DEFAULT_MODELS[0];

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) setText(custom.detail);
    };
    window.addEventListener('jenny-fill-prompt', handler);
    return () => window.removeEventListener('jenny-fill-prompt', handler);
  }, []);

  const switchCapabilityMode = (cap: ModelCapability) => {
    if (activeModel.capability === cap) return;
    const match = allModels.find((m) => m.capability === cap);
    if (match) setActiveModel(match.id);
  };

  const handleSend = async () => {
    if ((!text.trim() && !attachment) || isLoading) return;

    const convId = activeConversationId || createConversation();
    const userText = text;
    const attachedImg = attachment?.data || null;
    setText('');
    setAttachment(null);
    setIsLoading(true);

    const userAttachments: Attachment[] = [];
    if (attachedImg) {
      userAttachments.push({ type: 'image', url: attachedImg, mimeType: 'image/png' });
    }

    const historySnapshot =
      useChatStore.getState().conversations.find((c) => c.id === convId)?.messages || [];

    addMessage(convId, {
      role: 'user',
      text: userText,
      attachments: userAttachments,
    });

    const placeholderId = addMessage(convId, {
      role: 'model',
      text: 'Jenny đang xử lý...',
      modelId: activeModel.id,
      isStreaming: true,
    });

    try {
      const context = { settings };

      if (activeModel.capability === 'CHAT') {
        const finalReply = await generateText(
          userText,
          activeModel.id,
          context,
          historySnapshot,
          attachedImg,
          (partialText) => {
            updateMessage(convId, placeholderId, {
              text: partialText,
              isStreaming: true,
            });
          }
        );
        updateMessage(convId, placeholderId, {
          text: finalReply || 'Jenny không nhận được phản hồi văn bản.',
          isStreaming: false,
        });
      } else if (activeModel.capability === 'IMAGE') {
        const { imageUrl, caption } = await generateImage(
          userText,
          activeModel.id,
          context,
          attachedImg
        );
        updateMessage(convId, placeholderId, {
          text: caption,
          attachments: [{ type: 'image', url: imageUrl, mimeType: 'image/png' }],
          isStreaming: false,
        });
      } else if (activeModel.capability === 'TTS') {
        const audioUrl = await generateTTS(userText, activeModel.id, context);
        updateMessage(convId, placeholderId, {
          text: `Đã tạo giọng nói (${settings.ttsVoice || 'Puck'}):`,
          attachments: [{ type: 'audio', url: audioUrl, mimeType: 'audio/mp3' }],
          isStreaming: false,
        });
      } else if (activeModel.capability === 'VIDEO') {
        updateMessage(convId, placeholderId, {
          text: 'Đang khởi tạo tiến trình tạo video Veo (LRO)...',
          isStreaming: true,
        });
        const opName = await initiateVideoGen(userText, activeModel.id, context);
        updateMessage(convId, placeholderId, {
          text: `Tiến trình LRO đã bắt đầu (\`${opName}\`). Đang chờ kết xuất video...`,
          isStreaming: true,
        });

        let done = false;
        while (!done) {
          await new Promise((r) => setTimeout(r, 8000));
          const res = await pollVideoGen(opName, activeModel.id, context);
          if (res.done && res.videoUrl) {
            done = true;
            updateMessage(convId, placeholderId, {
              text: 'Đã hoàn tất tạo video Veo:',
              attachments: [{ type: 'video', url: res.videoUrl, mimeType: res.mimeType! }],
              isStreaming: false,
            });
          }
        }
      }
    } catch (err: any) {
      updateMessage(convId, placeholderId, {
        text: `⚠️ Lỗi gọi API (${activeModel.id}): ${err.message}`,
        isStreaming: false,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachment({ type: 'image', data: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const modes: { cap: ModelCapability; label: string; icon: React.ReactNode }[] = [
    { cap: 'CHAT', label: 'Chat & Vision', icon: <MessageSquare size={13} /> },
    { cap: 'IMAGE', label: 'Tạo Ảnh', icon: <ImageIcon size={13} /> },
    { cap: 'VIDEO', label: 'Video Veo (LRO)', icon: <Video size={13} /> },
    { cap: 'TTS', label: 'Giọng Nói TTS', icon: <Volume2 size={13} /> },
  ];

  return (
    <div className="p-3 sm:p-4 bg-background w-full shrink-0 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {modes.map((m) => {
            const active = activeModel.capability === m.cap;
            return (
              <button
                key={m.cap}
                type="button"
                onClick={() => switchCapabilityMode(m.cap)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-accent-terracotta/15 border-accent-terracotta text-accent-terracotta'
                    : 'bg-surface border-border text-muted hover:text-primary'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-[11px] font-mono text-muted hidden sm:inline">
          Model: <strong className="text-primary">{activeModel.id}</strong>
        </span>
      </div>

      {attachment && (
        <div className="mb-2 relative inline-block">
          <img
            src={attachment.data}
            alt="Upload preview"
            className="h-16 rounded-lg border border-border"
          />
          <button
            onClick={() => setAttachment(null)}
            className="absolute -top-2 -right-2 bg-surface border border-border text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-surface border border-border rounded-2xl p-2 shadow-lg focus-within:border-accent-terracotta/70 transition-colors">
        <input type="file" accept="image/*" hidden ref={fileRef} onChange={handleFileChange} />
        <button
          onClick={() => fileRef.current?.click()}
          className="p-2.5 text-muted hover:text-primary transition-colors disabled:opacity-40 rounded-xl hover:bg-background/60"
          disabled={isLoading || activeModel.capability === 'TTS' || activeModel.capability === 'VIDEO'}
          title="Đính kèm hình ảnh (Vision / Image-to-Image)"
        >
          <ImageIcon size={19} />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            activeModel.capability === 'IMAGE'
              ? 'Mô tả bức ảnh bạn muốn Jenny vẽ...'
              : activeModel.capability === 'VIDEO'
              ? 'Mô tả cảnh quay video 16:9 bạn muốn Veo tạo...'
              : activeModel.capability === 'TTS'
              ? 'Nhập nội dung văn bản để Jenny chuyển thành giọng nói...'
              : 'Nhắn tin cho Jenny (Enter để gửi, Shift+Enter xuống dòng)...'
          }
          className="flex-1 max-h-36 min-h-[42px] bg-transparent resize-none py-2 px-1 focus:outline-none text-sm text-primary placeholder:text-muted/60"
          rows={1}
          disabled={isLoading}
        />

        <button
          onClick={handleSend}
          disabled={isLoading || (!text.trim() && !attachment)}
          className="p-2.5 bg-accent-terracotta text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
          title="Gửi yêu cầu"
        >
          {isLoading ? <Loader2 size={19} className="animate-spin" /> : <Send size={19} />}
        </button>
      </div>
    </div>
  );
}

