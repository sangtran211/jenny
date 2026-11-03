import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStore } from '../hooks/useChatStore';
import { PlayCircle, Volume2, Copy, Check, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { API_ERROR_PREFIX } from '../constants/messages';
import { cn } from '../lib/utils';
import { generateTTS } from '../services/jennyApi';
import { STARTER_PROMPTS } from '../constants/models';
import { useModels } from '../hooks/useModels';

export function ChatViewport() {
  const {
    conversations,
    activeConversationId,
    settings,
    setActiveModel,
  } = useChatStore();
  const { allModels, activeModel } = useModels();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ttsLoadingId, setTtsLoadingId] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleReadAloud = async (msgId: string, text: string) => {
    if (ttsLoadingId) return;
    setTtsLoadingId(msgId);
    try {
      const audioUri = await generateTTS(
        text.slice(0, 600),
        'gemini-3.1-flash-tts-preview',
        { settings }
      );
      const audio = new Audio(audioUri);
      await audio.play();
    } catch (err: any) {
      alert(`Không thể phát giọng nói TTS: ${err.message}`);
    } finally {
      setTtsLoadingId(null);
    }
  };

  const handleStarterClick = (promptText: string, cap: string) => {
    if (activeModel.capability !== cap) {
      const matching = allModels.find((m) => m.capability === cap);
      if (matching) setActiveModel(matching.id);
    }
    const event = new CustomEvent('jenny-fill-prompt', { detail: promptText });
    window.dispatchEvent(event);
  };


  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted flex-col gap-2">
        <h2 className="text-2xl font-serif text-primary">Jenny Atelier</h2>
        <p className="text-sm">Tạo cuộc trò chuyện mới để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8" ref={scrollRef}>
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.length === 0 && (
          <div className="py-8 sm:py-12">
            <div className="max-w-xl mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-terracotta/15 border border-accent-terracotta/30 text-accent-terracotta text-xs font-mono mb-3">
                <Sparkles size={13} />
                <span>JENNY AI • {activeModel.name}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl text-primary tracking-tight leading-tight mb-2">
                Xin chào, tôi là Jenny.
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                Không gian làm việc AI đa phương thức tích hợp Gemini, Imagen, Veo LRO và giọng nói TTS. Lịch sử chat được tự động lưu theo máy và hỗ trợ Export/Import linh hoạt.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STARTER_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStarterClick(item.prompt, item.capability)}
                  className="text-left p-4 rounded-xl bg-surface border border-border hover:border-accent-terracotta/60 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-primary group-hover:text-accent-terracotta">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-muted">
                      {item.capability}
                    </span>
                  </div>
                  <p className="text-xs text-muted line-clamp-2">{item.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={cn('flex gap-3.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-serif',
                msg.role === 'user' ? 'bg-accent-terracotta text-white' : 'bg-primary text-background'
              )}
            >
              {msg.role === 'user' ? 'B' : 'J'}
            </div>

            <div className={cn('flex flex-col gap-2 max-w-[85%]', msg.role === 'user' ? 'items-end' : 'items-start')}>
              {msg.text && (
                <div
                  className={cn(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    msg.role === 'user' ? 'bg-surface border border-border' : 'bg-surface/40 border border-border/60'
                  )}
                >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-background prose-pre:border prose-pre:border-border max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              {msg.attachments?.map((att, j) => (
                <div key={j} className="rounded-xl overflow-hidden border border-border bg-surface">
                  {att.type === 'image' && (
                    <img src={att.url} alt="Attachment" className="max-w-xs sm:max-w-md max-h-96 object-contain" />
                  )}
                  {att.type === 'video' && (
                    <video src={att.url} controls className="max-w-xs sm:max-w-md max-h-96" />
                  )}
                  {att.type === 'audio' && (
                    <div className="p-3 flex items-center gap-3 min-w-[250px]">
                      <button onClick={() => { const a = new Audio(att.url); a.play(); }} className="text-accent-sage hover:opacity-80">
                        <PlayCircle size={30} />
                      </button>
                      <audio src={att.url} controls className="h-8 w-48" />
                    </div>
                  )}
                </div>
              ))}

              {msg.role === 'model' && msg.text && !msg.isStreaming && (
                <div className="flex items-center gap-3 px-1 text-xs text-muted">
                  <button onClick={() => handleCopy(msg.id, msg.text)} className="flex items-center gap-1 hover:text-primary">
                    {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedId === msg.id ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                  <button onClick={() => handleReadAloud(msg.id, msg.text)} className="flex items-center gap-1 hover:text-accent-sage">
                    {ttsLoadingId === msg.id ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={12} />}
                    <span>Đọc giọng Jenny</span>
                  </button>
                  {msg.text.startsWith(API_ERROR_PREFIX) && messages[i - 1]?.role === 'user' && (
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('jenny-fill-prompt', { detail: messages[i - 1].text }))}
                      className="flex items-center gap-1 hover:text-accent-terracotta"
                    >
                      <RotateCcw size={12} />
                      <span>Thử lại</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

