import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Image as ImageIcon,
  Video,
  Volume2,
  MessageSquare,
  Loader2,
  Paperclip,
  FileText,
  UploadCloud,
  X,
} from 'lucide-react';
import { useChatStore } from '../hooks/useChatStore';
import {
  generateText,
  generateImage,
  generateTTS,
  initiateVideoGen,
  pollVideoGen,
} from '../services/jennyApi';
import { useModels } from '../hooks/useModels';
import { API_ERROR_PREFIX } from '../constants/messages';
import { Attachment, ModelCapability } from '../types/chat';

const TEXT_FILE_EXT =
  /\.(txt|md|markdown|csv|tsv|json|jsonl|xml|yaml|yml|html|htm|css|scss|js|jsx|ts|tsx|mjs|cjs|py|sql|log|ini|conf|sh|bat|ps1|c|cpp|h|hpp|java|go|rs|php|rb|swift|kt|dart)$/i;

const readFileAsAttachment = (file: File): Promise<Attachment> =>
  new Promise((resolve, reject) => {
    const isImage = file.type.startsWith('image/');
    const isText =
      !isImage &&
      file.type !== 'application/pdf' &&
      (file.type.startsWith('text/') ||
        file.type === 'application/json' ||
        file.type === 'application/xml' ||
        TEXT_FILE_EXT.test(file.name));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Không thể đọc tệp ${file.name}`));

    if (isText) {
      reader.onload = (ev) => {
        resolve({
          type: 'file',
          url: '',
          mimeType: file.type || 'text/plain',
          name: file.name,
          size: file.size,
          textContent: String(ev.target?.result ?? ''),
        });
      };
      reader.readAsText(file, 'utf-8');
    } else {
      reader.onload = (ev) => {
        const dataUrl = String(ev.target?.result ?? '');
        resolve({
          type: isImage ? 'image' : 'file',
          url: dataUrl,
          mimeType: file.type || (isImage ? 'image/png' : 'application/octet-stream'),
          name: file.name,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    }
  });

export function Composer() {
  const {
    activeConversationId,
    createConversation,
    addMessage,
    updateMessage,
    setActiveModel,
    settings,
  } = useChatStore();
  const { allModels, activeModel } = useModels();

  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const processIncomingFiles = async (files: File[]) => {
    if (!files.length || isLoading) return;
    try {
      const loaded = await Promise.all(files.map(readFileAsAttachment));
      const hasNonImage = loaded.some((a) => a.type !== 'image');
      if (
        activeModel.capability === 'TTS' ||
        activeModel.capability === 'VIDEO' ||
        (activeModel.capability === 'IMAGE' && hasNonImage)
      ) {
        switchCapabilityMode('CHAT');
      }
      setAttachments((prev) => [...prev, ...loaded]);
    } catch (err: any) {
      alert(err?.message || 'Không thể đính kèm tệp đã chọn.');
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;

    const convId = activeConversationId || createConversation();
    const userText = text;
    const currentAttachments = [...attachments];
    const firstImage = currentAttachments.find((a) => a.type === 'image')?.url || null;
    setText('');
    setAttachments([]);
    setIsLoading(true);

    const historySnapshot =
      useChatStore.getState().conversations.find((c) => c.id === convId)?.messages || [];

    addMessage(convId, {
      role: 'user',
      text: userText,
      attachments: currentAttachments,
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
          currentAttachments,
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
          firstImage
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
          text: 'Đang khởi tạo tiến trình dựng video Veo...',
          isStreaming: true,
        });
        const opName = await initiateVideoGen(userText, activeModel.id, context);
        updateMessage(convId, placeholderId, {
          text: 'Đang dựng video Veo (quá trình này thường mất khoảng 30–60 giây)...',
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
        text: `${API_ERROR_PREFIX} (${activeModel.id}): ${err.message}`,
        isStreaming: false,
        retryable: err?.retryable !== false,
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
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      processIncomingFiles(files);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          const ext = file.type.split('/')[1] || 'png';
          const namedFile =
            !file.name || file.name === 'image.png'
              ? new File([file], `clipboard-${Date.now()}-${i + 1}.${ext}`, { type: file.type })
              : file;
          files.push(namedFile);
        }
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      processIncomingFiles(files);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.types?.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const droppedFiles = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
    if (droppedFiles.length > 0) {
      processIncomingFiles(droppedFiles);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const modes: { cap: ModelCapability; label: string; icon: React.ReactNode }[] = [
    { cap: 'CHAT', label: 'Trò chuyện', icon: <MessageSquare size={13} /> },
    { cap: 'IMAGE', label: 'Tạo Ảnh', icon: <ImageIcon size={13} /> },
    { cap: 'VIDEO', label: 'Tạo Video', icon: <Video size={13} /> },
    { cap: 'TTS', label: 'Giọng Nói', icon: <Volume2 size={13} /> },
  ];

  return (
    <div
      className="p-3 sm:p-4 bg-background w-full shrink-0 max-w-4xl mx-auto relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
        <span className="text-[11px] text-muted hidden sm:inline truncate max-w-[380px]">
          <strong className="text-primary font-mono">{activeModel.name}</strong>
          {activeModel.bestFor ? ` — ${activeModel.bestFor}` : ` (${activeModel.id})`}
        </span>
      </div>

      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative group">
              {att.type === 'image' ? (
                <img
                  src={att.url}
                  alt={att.name || 'Upload preview'}
                  title={att.name}
                  className="h-16 w-16 object-cover rounded-xl border border-border bg-surface"
                />
              ) : (
                <div className="h-16 px-3 rounded-xl border border-border bg-surface flex items-center gap-2.5 max-w-[220px]">
                  <FileText size={18} className="text-accent-terracotta shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-primary truncate">
                      {att.name || 'Tệp đính kèm'}
                    </div>
                    <div className="text-[10px] text-muted truncate">
                      {att.size ? `${(att.size / 1024).toFixed(1)} KB` : att.mimeType}
                    </div>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="absolute -top-1.5 -right-1.5 bg-surface border border-border hover:border-accent-terracotta text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                title="Xóa tệp đính kèm"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative flex items-end gap-2 bg-surface border rounded-2xl p-2 shadow-lg transition-colors ${
          isDragging
            ? 'border-accent-terracotta bg-accent-terracotta/10 border-dashed'
            : 'border-border focus-within:border-accent-terracotta/70'
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-background/90 backdrop-blur-xs flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-accent-terracotta pointer-events-none z-10">
            <UploadCloud size={18} />
            <span>Thả hình ảnh hoặc tệp vào đây để đính kèm</span>
          </div>
        )}

        <input
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.md,.markdown,.csv,.tsv,.json,.xml,.yaml,.yml,.html,.css,.js,.jsx,.ts,.tsx,.py,.sql,.log"
          hidden
          ref={fileRef}
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="p-2.5 text-muted hover:text-primary transition-colors disabled:opacity-40 rounded-xl hover:bg-background/60 shrink-0"
          disabled={isLoading}
          title="Đính kèm hình ảnh hoặc tệp (hoặc Dán Ctrl+V / Kéo thả vào ô nhập)"
        >
          <Paperclip size={19} />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={handlePaste}
          placeholder={
            activeModel.capability === 'IMAGE'
              ? 'Mô tả bức ảnh muốn tạo (có thể dán Ctrl+V hoặc kéo thả ảnh mẫu vào đây)...'
              : activeModel.capability === 'VIDEO'
              ? 'Mô tả cảnh quay video 16:9 bạn muốn Veo tạo...'
              : activeModel.capability === 'TTS'
              ? 'Nhập nội dung văn bản để Jenny chuyển thành giọng nói...'
              : 'Nhắn tin cho Jenny, dán ảnh (Ctrl+V) hoặc kéo thả tệp vào đây...'
          }
          className="flex-1 max-h-36 min-h-[42px] bg-transparent resize-none py-2 px-1 focus:outline-none text-sm text-primary placeholder:text-muted/60 min-w-0"
          rows={1}
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || (!text.trim() && attachments.length === 0)}
          className="p-2.5 bg-accent-terracotta text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
          title="Gửi yêu cầu"
        >
          {isLoading ? <Loader2 size={19} className="animate-spin" /> : <Send size={19} />}
        </button>
      </div>
    </div>
  );
}

